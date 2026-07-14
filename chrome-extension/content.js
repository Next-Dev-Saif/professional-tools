/**
 * Hephaestus Extension — Content Script
 * 
 * Listens for commands relayed from the background script (originating from the AI agent)
 * and fills or manipulates the DOM on localhost:3000.
 */

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'fill_fields' && msg.fields) {
    fillFields(msg.fields);
  }
});

function fillFields(fields) {
  // 1. Dispatch an event for React components that handle their own state (e.g., dynamic arrays)
  window.postMessage({
    type: 'HEPHAESTUS_AGENT_COMMAND',
    action: 'fill_fields',
    fields: fields
  }, '*');

  // 2. Fallback: Try to aggressively inject into the DOM for simple text/select inputs
  for (const [key, value] of Object.entries(fields)) {
    // If the value is an array, we skip DOM injection since arrays must be handled by the React component event listener
    if (Array.isArray(value)) continue;

    // Try finding by id, name, or data-key
    const el = document.getElementById(key) 
      || document.querySelector(`[name="${key}"]`)
      || document.querySelector(`[data-key="${key}"]`);
      
    if (el) {
      setReactValue(el, value);
    }
  }
}

/**
 * React overrides the default setter for input values. 
 * We must bypass it to properly trigger onChange events.
 */
function setReactValue(element, value) {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
  const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
  const nativeSelectValueSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')?.set;

  if (element.tagName === 'INPUT' && nativeInputValueSetter) {
    nativeInputValueSetter.call(element, value);
  } else if (element.tagName === 'TEXTAREA' && nativeTextAreaValueSetter) {
    nativeTextAreaValueSetter.call(element, value);
  } else if (element.tagName === 'SELECT' && nativeSelectValueSetter) {
    nativeSelectValueSetter.call(element, value);
  } else {
    element.value = value;
  }
  
  // Dispatch a bubbling input event to notify React
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}
