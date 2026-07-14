/**
 * Hephaestus Extension — Popup Script
 */

function updateStatus(status) {
  const indicator = document.getElementById('statusIndicator');
  const text = document.getElementById('statusText');

  indicator.className = 'indicator';
  if (status === 'connected') {
    indicator.classList.add('connected');
    text.textContent = 'Connected to Agent API';
  } else if (status === 'connecting') {
    indicator.classList.add('connecting');
    text.textContent = 'Connecting...';
  } else {
    text.textContent = 'Disconnected';
  }
}

// Request initial status
chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (response) => {
  if (response && response.status) {
    updateStatus(response.status);
  } else {
    updateStatus('disconnected');
  }
});

// Listen for status updates
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'BRIDGE_STATUS') {
    updateStatus(msg.status);
  }
});
