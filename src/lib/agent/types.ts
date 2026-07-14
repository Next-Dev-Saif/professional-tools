/**
 * Agent API — Type Definitions
 *
 * Shared across the tool registry, executor, and both API routes.
 * Intentionally shaped to be compatible with:
 *   - OpenAI function-calling schema
 *   - Anthropic tool_use schema
 *   - Kiro / custom IDE agent integrations
 */

// ─── Parameter schema (JSON Schema subset) ─────────────────────────────────

export type ParameterType = 'string' | 'number' | 'boolean' | 'object' | 'array';

export interface ParameterProperty {
  type: ParameterType;
  description: string;
  enum?: string[];
  default?: string | number | boolean;
  items?: { type: ParameterType };
}

export interface ParameterSchema {
  type: 'object';
  required: string[];
  properties: Record<string, ParameterProperty>;
}

// ─── Output descriptor ──────────────────────────────────────────────────────

export type OutputFormat = 'markdown' | 'html' | 'json' | 'text';

export interface OutputDescriptor {
  format: OutputFormat;
  /** Whether the execution endpoint streams chunks or returns a single JSON body */
  streaming: boolean;
  /** MIME type returned by /api/agent/execute */
  contentType: string;
  /** File extension used by /api/agent/download */
  fileExtension: string;
}

// ─── Tool definition ────────────────────────────────────────────────────────

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: 'documentation' | 'legal' | 'design' | 'engineering';
  parameters: ParameterSchema;
  output: OutputDescriptor;
  /** UI path so agents can deep-link users to the interactive version */
  uiPath: string;
  examples: Array<{ summary: string; parameters: Record<string, unknown> }>;
}

// ─── API request / response shapes ─────────────────────────────────────────

export interface ExecuteRequest {
  toolId: string;
  parameters: Record<string, unknown>;
  /** If true, return a single JSON body {content, toolId, generatedAt} instead of a stream */
  buffered?: boolean;
}

export interface ExecuteBufferedResponse {
  toolId: string;
  content: string;
  format: OutputFormat;
  generatedAt: string;
  /** Populated only when buffered=true — signed URL or path for /api/agent/download */
  downloadUrl: string;
}

export interface ToolsManifestResponse {
  schemaVersion: '1.0';
  baseUrl: string;
  endpoints: {
    tools: string;
    execute: string;
    download: string;
  };
  authentication: {
    required: boolean;
    scheme: string;
    header: string;
  };
  tools: ToolDefinition[];
}

// ─── Execution result (internal) ────────────────────────────────────────────

export interface ExecutionResult {
  stream?: ReadableStream<Uint8Array>;
  bufferedContent?: string;
  format: OutputFormat;
  contentType: string;
}
