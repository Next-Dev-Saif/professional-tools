/**
 * GET /api/agent/tools
 *
 * Discovery endpoint — returns the complete tool manifest in a machine-readable
 * format compatible with OpenAI function-calling, Anthropic tool_use, and any
 * custom IDE agent that follows the Hephaestus Agent Protocol.
 *
 * Response is aggressively cached (60s) since the registry is static.
 * No authentication required — same posture as the web UI.
 */

import { NextRequest } from 'next/server';
import { TOOL_REGISTRY } from '@/lib/agent/registry';
import type { ToolsManifestResponse } from '@/lib/agent/types';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const host = req.headers.get('host') ?? 'localhost:3000';
  const protocol = host.startsWith('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  const manifest: ToolsManifestResponse = {
    schemaVersion: '1.0',
    baseUrl,
    endpoints: {
      tools: `${baseUrl}/api/agent/tools`,
      execute: `${baseUrl}/api/agent/execute`,
      download: `${baseUrl}/api/agent/download`,
    },
    authentication: {
      required: false,
      scheme: 'ApiKey',
      header: 'X-Hephaestus-Key',
    },
    tools: TOOL_REGISTRY,
  };

  return new Response(JSON.stringify(manifest, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Hephaestus-Key',
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Hephaestus-Key',
    },
  });
}
