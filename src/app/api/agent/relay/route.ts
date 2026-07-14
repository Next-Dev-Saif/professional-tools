import { NextRequest } from 'next/server';

// Maintain active Server-Sent Events (SSE) connections
// In dev mode, we attach to globalThis to survive HMR.
declare global {
  var sseClients: ReadableStreamDefaultController<any>[];
}

if (!globalThis.sseClients) {
  globalThis.sseClients = [];
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Hephaestus-Key',
};

export const runtime = 'nodejs'; // Use nodejs runtime to ensure globalThis persists connections

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
  // Return an SSE stream
  let controller: ReadableStreamDefaultController<any>;

  const stream = new ReadableStream({
    start(c) {
      controller = c;
      globalThis.sseClients.push(controller);
      // Send an initial connected message
      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ type: 'CONNECTED' })}\n\n`));
    },
    cancel() {
      globalThis.sseClients = globalThis.sseClients.filter(c => c !== controller);
    }
  });

  req.signal.addEventListener('abort', () => {
    if (controller) {
      globalThis.sseClients = globalThis.sseClients.filter(c => c !== controller);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      ...CORS_HEADERS
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Broadcast the command to all active Chrome Extensions
    const encoder = new TextEncoder();
    const message = `data: ${JSON.stringify(body)}\n\n`;
    
    let sentCount = 0;
    for (const client of globalThis.sseClients) {
      try {
        client.enqueue(encoder.encode(message));
        sentCount++;
      } catch (e) {
        // Client might have disconnected ungracefully
      }
    }

    return new Response(JSON.stringify({ success: true, clientsNotified: sentCount }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Invalid Request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
    });
  }
}
