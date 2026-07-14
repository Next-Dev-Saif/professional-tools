/**
 * Agent Executor
 *
 * Routes a validated {toolId, parameters} payload to the correct prompt
 * builder and Cohere call. Returns either a ReadableStream (streaming tools)
 * or a buffered string (structured tools like visual-builder).
 *
 * This is the single choke-point where all agent tool calls flow through —
 * making it trivial to add auth, rate-limiting, or logging later.
 */

import { CohereClient } from 'cohere-ai';
import { TOOL_MAP } from './registry';
import {
  buildPrToDocPrompt,
  buildMeetingToReportPrompt,
  buildPostMortemPrompt,
  buildADRPrompt,
  buildReleaseNotesPrompt,
  buildAPIDocPrompt,
  buildLegalPrompt,
} from './prompts';
import type { ExecutionResult } from './types';

const cohere = new CohereClient({ token: process.env.COHERE_API_KEY || '' });

/** Map from toolId → prompt builder function */
const PROMPT_BUILDERS: Record<string, (p: Record<string, unknown>) => string> = {
  'pr-to-document': buildPrToDocPrompt,
  'meeting-to-report': buildMeetingToReportPrompt,
  'post-mortem': buildPostMortemPrompt,
  'adr-builder': buildADRPrompt,
  'release-notes': buildReleaseNotesPrompt,
  'api-documenter': buildAPIDocPrompt,
  'code-to-legal': buildLegalPrompt,
};

/** Validate that all required parameters are present */
function validateParams(toolId: string, params: Record<string, unknown>): string | null {
  const tool = TOOL_MAP.get(toolId);
  if (!tool) return `Unknown tool: "${toolId}"`;
  for (const key of tool.parameters.required) {
    if (!params[key] && params[key] !== 0 && params[key] !== false) {
      return `Missing required parameter: "${key}" for tool "${toolId}"`;
    }
  }
  return null;
}

/**
 * Execute a tool and return a streaming ReadableStream or buffered content.
 *
 * @throws {Error} if toolId is unknown, required params are missing, or Cohere fails
 */
export async function executeTool(
  toolId: string,
  parameters: Record<string, unknown>,
  buffered = false
): Promise<ExecutionResult> {
  // ── 1. Validate ──────────────────────────────────────────────────────────
  const validationError = validateParams(toolId, parameters);
  if (validationError) throw new Error(validationError);

  const tool = TOOL_MAP.get(toolId)!;

  // ── 2. Route non-generative tools ─────────────────────────────────────────
  if (toolId === 'visual-builder') {
    return executeVisualBuilder(parameters);
  }

  // ── 3. Generative (streaming) tools ───────────────────────────────────────
  const promptBuilder = PROMPT_BUILDERS[toolId];
  if (!promptBuilder) throw new Error(`No prompt builder registered for tool: "${toolId}"`);

  const prompt = promptBuilder(parameters);

  if (buffered) {
    // ── 3a. Buffered mode — collect full response then return ────────────────
    const response = await cohere.chat({
      model: 'command-r-plus-08-2024',
      message: prompt,
      temperature: 0.3,
    });
    return {
      bufferedContent: response.text,
      format: tool.output.format,
      contentType: tool.output.contentType,
    };
  }

  // ── 3b. Streaming mode ────────────────────────────────────────────────────
  const cohereStream = await cohere.chatStream({
    model: 'command-r-plus-08-2024',
    message: prompt,
    temperature: 0.3,
  });

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      for await (const chunk of cohereStream) {
        if (chunk.eventType === 'text-generation') {
          controller.enqueue(encoder.encode(chunk.text));
        }
      }
      controller.close();
    },
  });

  return {
    stream,
    format: tool.output.format,
    contentType: tool.output.contentType,
  };
}

/** Visual builder uses the existing generate-layout logic — non-streaming */
async function executeVisualBuilder(params: Record<string, unknown>): Promise<ExecutionResult> {
  const { prompt } = params as { prompt: string };

  const SYSTEM_PROMPT = `You are an expert design AI powering Hephaestus, a WYSIWYG visual document builder.
Generate a fully styled HTML document using Tailwind CSS. Use semantic HTML, 8px grid spacing, and elegant minimal design.
Attach unique id attributes starting with 'hephaestus-' to top-level structural blocks.
Output ONLY valid HTML — no markdown code fences, no explanations.`;

  const response = await cohere.chat({
    model: 'command-r-plus-08-2024',
    message: prompt,
    preamble: SYSTEM_PROMPT,
    temperature: 0.3,
  });

  let html = response.text.trim()
    .replace(/^```html\n?/, '').replace(/^```\n?/, '').replace(/```$/, '').trim();

  return {
    bufferedContent: JSON.stringify({ html }),
    format: 'html',
    contentType: 'application/json',
  };
}
