# Hephaestus Tools — Chrome Extension

Connects any web AI chat (Claude, ChatGPT, Gemini, Perplexity) to the Hephaestus documentation tools via a persistent side panel. Generate docs without leaving your conversation.

---

## Install (Development)

1. Open `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked** → select this `chrome-extension/` folder
4. The ⚒ icon appears in your toolbar

> Icons are in `icons/` (16, 48, 128 px PNGs). Replace them with a proper design any time — Chrome picks up changes on next reload.

---

## How the connection works

```
┌────────────────────────────────────────────────────────────────┐
│                       AI CHAT TAB                              │
│  (claude.ai / chat.openai.com / gemini.google.com / etc.)      │
│                                                                 │
│  ┌──────────────────────┐    ┌───────────────────────────────┐ │
│  │   AI Chat Interface  │    │   Hephaestus Side Panel       │ │
│  │                      │◄──►│                               │ │
│  │  content.js injected │    │  sidepanel.js                 │ │
│  │  ─────────────────── │    │  ─────────────────────────── │ │
│  │  • Floating ⚒ button │    │  • Tool selector              │ │
│  │    on text selection │    │  • Dynamic param fields       │ │
│  │  • "Save to Heph"    │    │  • Streaming output           │ │
│  │    badge on AI docs  │    │  • Copy / Insert / Download   │ │
│  │  • Scrapes AI output │    │  • Capture AI tab             │ │
│  │  • Injects text into │    │  • History tab                │ │
│  │    chat input        │    │                               │ │
│  └──────────────────────┘    └───────────────────────────────┘ │
│              │                              │                   │
└──────────────┼──────────────────────────────┼───────────────────┘
               │  chrome.tabs.sendMessage     │  chrome.runtime.sendMessage
               ▼                              ▼
┌──────────────────────────────────────────────────────────────── ┐
│                  background.js (Service Worker)                  │
│                                                                  │
│  Central message bus — owns ALL network calls                    │
│  Routes: GET_AI_RESPONSE, SEND_TO_AI, EXECUTE_TOOL,              │
│          GET_TOOLS, DOWNLOAD_FILE, OPEN_SIDEPANEL                │
└──────────────────────────────────────────────────────────────────┘
               │
               │ fetch()
               ▼
┌──────────────────────────────┐
│  Hephaestus Next.js App      │
│  GET  /api/agent/tools       │  ← Tool manifest (schemas, params)
│  POST /api/agent/execute     │  ← Streaming or buffered generation
│  GET  /api/agent/download    │  ← File download with Content-Disposition
└──────────────────────────────┘
```

---

## Connection flows

### Flow 1 — Toolbar click on AI chat page
```
User clicks ⚒ icon
  → background.js: action.onClicked
  → chrome.sidePanel.open({ tabId })
  → Side panel opens inside the tab
  → sidepanel.js: boot() → GET /api/agent/tools → renders form
```

### Flow 2 — Text selection bridge
```
User selects text in AI chat
  → content.js: selectionchange
  → Floating "⚒ Hephaestus" pill button appears
User clicks it
  → chrome.storage.session.set({ prefillText })
  → OPEN_SIDEPANEL message → background.js → sidePanel.open()
  → Side panel opens, first param field auto-filled with selection
```

### Flow 3 — Right-click context menu
```
User right-clicks selected text
  → "⚒ Send to Hephaestus Tools"
  → background.js: contextMenus.onClicked
  → prefillText stored in session storage
  → sidePanel.open() → side panel auto-fills
```

### Flow 4 — AI response auto-capture badge
```
AI finishes a response containing markdown structure
  → content.js MutationObserver fires
  → Detects headings / code blocks / tables
  → "Save to Hephaestus" floating badge appears (12s auto-dismiss)
User clicks Save
  → prefillText set → OPEN_SIDEPANEL → side panel opens pre-filled
```

### Flow 5 — Capture AI tab (manual)
```
User switches to "Capture AI" tab in side panel
  → Clicks "↑ Read from AI chat"
  → SCRAPE_AI_RESPONSE → background.js → content.js SCRAPE_AI_RESPONSE
  → Last AI message text extracted and shown in textarea
User selects a tool and clicks "Generate from AI response"
  → Switches to Generate tab, fills first field, ready to generate
```

### Flow 6 — Insert result back into chat
```
Generation completes in side panel
  → User clicks "→ Insert into chat"
  → SEND_TO_AI → background.js → content.js INSERT_TEXT
  → content.js finds chat input (textarea or contenteditable)
  → Text injected using native value setter + input event dispatch
  → React/Vue state managers pick up the change correctly
```

### Flow 7 — Save to file
```
User clicks "↓ Save" in side panel or history
  → DOWNLOAD_FILE → background.js
  → Content base64-encoded → GET /api/agent/download
  → Response has Content-Disposition: attachment; filename="..."
  → chrome.downloads.download() → browser Save dialog
```

---

## Supported AI platforms

| Platform | Selector strategy | Input type |
|---|---|---|
| Claude (claude.ai) | `.font-claude-message`, ProseMirror | ContentEditable |
| ChatGPT (chatgpt.com) | `[data-message-author-role="assistant"]` | Textarea |
| Gemini | `.response-container .markdown` | ContentEditable (Quill) |
| Perplexity | `[data-testid="answer"]` | Textarea |
| Any other | Generic `div[contenteditable]` / `textarea` fallback | Auto-detected |

---

## API endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/agent/tools` | GET | Returns full tool manifest with JSON Schema parameter definitions |
| `/api/agent/execute` | POST | Executes a tool — streaming (`text/plain`) or buffered (`application/json`) |
| `/api/agent/download` | GET | Returns file with `Content-Disposition: attachment` for direct browser/OS save |

### Execute request body
```json
{
  "toolId": "pr-to-document",
  "parameters": {
    "commitText": "feat: added OAuth2 PKCE flow",
    "docType": "Technical Documentation"
  },
  "buffered": false
}
```

### Buffered response (IDE agents / download flow)
```json
{
  "toolId": "pr-to-document",
  "content": "# OAuth2 PKCE Flow\n\n...",
  "format": "markdown",
  "generatedAt": "2025-07-14T10:30:00.000Z",
  "downloadUrl": "http://localhost:3000/api/agent/download?toolId=pr-to-document&format=md&content=..."
}
```

---

## Settings

Click ⚙ in the panel header to change the **API Base URL**.

| Environment | URL |
|---|---|
| Local dev | `http://localhost:3000` (default) |
| Production | `https://your-deployed-app.com` |

The URL is persisted in `chrome.storage.sync` — syncs across your Chrome profile automatically.

---

## File structure

```
chrome-extension/
├── manifest.json       ← MV3 manifest (sidePanel, contextMenus, downloads)
├── background.js       ← Service worker — message bus + all fetch calls
├── content.js          ← Injected into AI tabs — selection, scrape, inject
├── styles.css          ← Minimal styles injected with content.js
├── popup.html/css/js   ← Fallback popup for non-AI pages
├── sidepanel.html      ← Side panel shell
├── sidepanel.css       ← Side panel styles
├── sidepanel.js        ← Side panel logic (tabs, streaming, history)
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```
