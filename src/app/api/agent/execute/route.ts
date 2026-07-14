/**
 * POST /api/agent/execute
 *
 * Execution endpoint — accepts a toolId + parameters, validates them
 * against the registry schema, runs the tool, and returns either:
 *
 *   • A streaming text/plain response (generative tools, buffered=false)
 *   • A JSON body with {toolId, content, format, generatedAt, downloadUrl}
 *     (buffered=true — used by IDE agents that need the full output at once)
 *
 * Request body:
 * {
 *   "toolId": "pr-to-document",          // required
 *   "parameters": { ... },               // required — see /api/agent/tools for schemas
 *   "buffered": false                     // optional, default false
 * }
 *
 * Errors:
 *   400 — missing/invalid parameters
 *   404 — unknown toolId
 *   500 — Cohere or internal error
 */

import { NextRequest } from 'next/server';
import { executeTool } from '@/lib/agent/executor';
import { TOOL_MAP } from '@/lib/agent/registry';
import type { ExecuteRequest, ExecuteBufferedResponse } from '@/lib/agent/types';

export const runtime = 'edge';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Hephaestus-Key',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  try {
    let body: ExecuteRequest;
    try {
      body = await req.json();
    } catch {
      return errorResponse(400, 'Request body must be valid JSON.');
    }

    const { toolId, parameters, buffered = false } = body;

    if (!toolId || typeof toolId !== 'string') {
      return errorResponse(400, 'Missing required field: "toolId"');
    }
    if (!parameters || typeof parameters !== 'object' || Array.isArray(parameters)) {
      return errorResponse(400, 'Missing required field: "parameters" (must be an object)');
    }
    if (!TOOL_MAP.has(toolId)) {
      return errorResponse(
        404,
        `Unknown tool: "${toolId}". Call GET /api/agent/tools to see available tools.`
      );
    }

    const result = await executeTool(toolId, parameters as Record<string, unknown>, buffered);
    const tool = TOOL_MAP.get(toolId)!;

    // ── Buffered response — full content + download URL ────────────────────
    if (buffered || result.bufferedContent !== undefined) {
      const content = result.bufferedContent ?? '';
      const generatedAt = new Date().toISOString();

      // Build download URL with all parameters encoded so the download
      // endpoint can reconstruct exactly the same document on demand
      const host = req.headers.get('host') ?? 'localhost:3000';
      const protocol = host.startsWith('localhost') ? 'http' : 'https';
      const dlParams = new URLSearchParams({
        toolId,
        format: tool.output.fileExtension,
        // Pass the content directly so the download endpoint doesn't need
        // to re-execute the tool (which would cost another Cohere call)
        content: Buffer.from(content).toString('base64'),
      });
      const downloadUrl = `${protocol}://${host}/api/agent/download?${dlParams.toString()}`;

      const responseBody: ExecuteBufferedResponse = {
        toolId,
        content,
        format: tool.output.format,
        generatedAt,
        downloadUrl,
      };

      return new Response(JSON.stringify(responseBody, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS,
        },
      });
    }

    // ── Streaming response ─────────────────────────────────────────────────
    if (!result.stream) {
      return errorResponse(500, 'Tool returned no stream and buffered=false');
    }

    return new Response(result.stream, {
      status: 200,
      headers: {
        'Content-Type': result.contentType,
        'Cache-Control': 'no-cache, no-transform',
        'X-Tool-Id': toolId,
        'X-Output-Format': tool.output.format,
        ...CORS_HEADERS,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    const status = message.startsWith('Missing required') ? 400 : 500;
    return errorResponse(status, message);
  }
}

function errorResponse(status: number, message: string) {
  return new Response(
    JSON.stringify({ error: message, status }),
    {
      status,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    }
  );
}
