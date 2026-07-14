/**
 * Hephaestus Extension — Background Service Worker
 *
 * Connects to the Next.js Agent Relay API via Server-Sent Events (SSE).
 * When an external AI Agent sends a command to the Next.js API, it is pushed
 * here, and the background script forwards it to the active tab's content script.
 */

const RELAY_URL = 'http://localhost:3000/api/agent/relay';

let eventSource = null;
let bridgeStatus = 'disconnected'; // disconnected, connecting, connected

function broadcastStatus() {
  chrome.runtime.sendMessage({ type: 'BRIDGE_STATUS', status: bridgeStatus }).catch(() => {});
}

function connectRelay() {
  if (eventSource) {
    eventSource.close();
  }

  bridgeStatus = 'connecting';
  broadcastStatus();

  // In MV3 Service Workers, EventSource is not globally available in all Chrome versions,
  // but starting from Chrome 116+ it's available. If unavailable, we can use fetch streaming.
  // We'll attempt a generic streaming fetch to be highly robust in MV3.
  startStreamingFetch();
}

async function startStreamingFetch() {
  try {
    const response = await fetch(RELAY_URL, {
      method: 'GET',
      headers: {
        'Accept': 'text/event-stream',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    bridgeStatus = 'connected';
    broadcastStatus();

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6).trim();
          if (dataStr) {
            try {
              const data = JSON.parse(dataStr);
              handleCommand(data);
            } catch (err) {
              console.error('[Hephaestus Relay] Error parsing JSON:', err);
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('[Hephaestus Relay] Connection error:', err);
  } finally {
    bridgeStatus = 'disconnected';
    broadcastStatus();
    // Reconnect after 3 seconds
    setTimeout(connectRelay, 3000);
  }
}

function handleCommand(data) {
  if (data.type === 'CONNECTED') {
    console.log('[Hephaestus Relay] Connected to Next.js API.');
    return;
  }
  
  // Broadcast to the active tab (assuming it's localhost:3000)
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, data).catch((e) => {
        console.warn('[Hephaestus Relay] Could not send to content script:', e.message);
      });
    }
  });
}

// ─── Lifecycle ───────────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(() => {
  connectRelay();
});

// Also start connecting if the service worker wakes up
connectRelay();

// ─── UI Communication ────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_STATUS') {
    sendResponse({ status: bridgeStatus });
  }
});
