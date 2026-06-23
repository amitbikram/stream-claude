# peregrine-mcp-app

MCP-UI rebuild of the stream-blog-claude wizard.

**UI only.** This server does not generate briefs or pages itself. The
model (Claude Desktop) orchestrates the flow: the widget posts plain-text
prompts, the model calls **DOTCOM-MCP / Stream-MCP** for the real work,
then calls `peregrine-mcp-app`'s single tool to re-render the wizard
with the new state.

## Architecture

```
                      ┌─────────────────────┐
   user interaction → │       Widget        │ → postMessage 'prompt' intent
                      │ (iframe, on CDN)    │ ←──── re-render (UIResource)
                      └─────────────────────┘
                                ↑                              ↑
            iframeUrl + state   │                              │ show_blog_wizard
                                │                              │
                      ┌─────────┴────────────────────────────┬─┘
                      │             Claude Desktop           │
                      │           (model + host)             │
                      └───┬──────────────────────────────┬───┘
                          │                              │
                          ↓                              ↓
                ┌──────────────────────┐    ┌──────────────────────┐
                │  peregrine-mcp-app   │    │   DOTCOM-MCP /       │
                │  (this server,       │    │   Stream-MCP         │
                │   stdio, no auth)    │    │   (HTTP, auth'd)     │
                │                      │    │                      │
                │  show_blog_wizard()  │    │  generate_blog_brief │
                │                      │    │  create_blog_from_brief │
                └──────────────────────┘    └──────────────────────┘
```

The two servers run side-by-side in Claude Desktop. **peregrine-mcp-app
has no auth, no external calls, no business logic** — it only returns
the wizard as a UIResource pointing at the CDN-hosted shell. DOTCOM-MCP
handles its own authentication and does the actual generation.

## Tools exposed

- **`show_blog_wizard(state?)`** — renders / re-renders the wizard
  inline in chat. Pass the full wizard state on every call (proposal,
  skills, brief, page, currentStep). Omit / empty for the initial
  welcome view.

That's it. One tool.

## Layout

```
peregrine-mcp-app/
├── package.json
├── tsconfig.json
├── instructions.md         # system prompt for the model (orchestration contract)
├── widget/                 # CDN-served static assets (jsDelivr → GitHub)
│   ├── blog_wizard.html    # HTML shell — reads ?state=… and loads CSS/JS from CDN
│   ├── blog-wizard.css     # styles
│   └── blog-wizard.js      # widget script (model-orchestrated flow)
├── src/
│   ├── server.ts           # MCP server (stdio, single tool)
│   ├── tools.ts            # show_blog_wizard handler
│   ├── ui-resource.ts      # builds the externalUrl UIResource
│   └── state.ts            # WizardState types
└── dist/                   # build output (gitignored)
```

## How state travels

Each `show_blog_wizard` call URL-encodes the state object and embeds it
as a `?state=<urlencoded-json>` query param on the iframe URL the host
loads. The shell's inline boot script copies that into the `#bw-root`
`data-state` attribute, and the widget JS hydrates from it. sessionStorage
backs everything up across re-mounts within the same tab.

Custom skill bodies are intentionally stripped from the round-tripped
state to keep URL length under limits — the widget keeps bodies in
sessionStorage, and sends them inline in the first `Generate brief`
prompt to the model.

## Build + run

```bash
cd peregrine-mcp-app
npm install
npm run build
```

Then connect via Claude Desktop. Add to
`~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "peregrine-mcp-app": {
      "command": "/Users/sarangi/.nvm/versions/node/v20.18.1/bin/node",
      "args": ["/Users/sarangi/stream-claude/peregrine-mcp-app/dist/server.js"]
    },
    "DOTCOM-MCP": {
      "command": "npx",
      "args": ["mcp-remote", "https://stream-dev.adobe.io/mcp"]
    }
  }
}
```

Restart Claude Desktop. Both servers must show as connected.

Load the system prompt from [instructions.md](instructions.md) into the
chat (or attach it as the system prompt for your Claude Desktop project).
Then ask: *"open the blog wizard"*. The model should call
`show_blog_wizard` and the welcome view should appear inline.

## Why this is faster than the previous inline-HTML approach

The previous version inlined the full HTML+CSS+JS (~37KB) into every
tool response. Iframes loaded via `srcdoc` cannot be cached — every
re-render meant a full re-parse of the same assets.

This version returns an `externalUrl` UIResource pointing at jsDelivr.
The shell + CSS + JS are fetched once, cached by the browser, and
subsequent renders only need the (small) state payload to change. The
wizard now feels as fast as the original Adobe-host version.

## Asset hosting + cache busting

Assets are served via [jsDelivr](https://www.jsdelivr.com/) from the
GitHub repo at:

```
https://cdn.jsdelivr.net/gh/amitbikram/stream-claude@main/peregrine-mcp-app/widget/
```

jsDelivr caches aggressively (~12h on `@main`). If you push a change and
don't see it reflected, either:

1. Use a specific commit SHA in the URL (`@<sha>` instead of `@main`)
   — edit `WIZARD_URL` in [src/ui-resource.ts](src/ui-resource.ts), or
   set the `PEREGRINE_WIZARD_URL` env var.
2. Purge the jsDelivr cache via their purge API.

For local dev you can override the wizard URL entirely:

```json
"peregrine-mcp-app": {
  "command": "node",
  "args": ["/path/to/dist/server.js"],
  "env": {
    "PEREGRINE_WIZARD_URL": "http://localhost:8080/blog_wizard.html"
  }
}
```

…and serve the `widget/` folder with any static file server.

## Adapting to other hosts

Any MCP-UI-compliant host that supports `externalUrl` resources can run
this wizard — just point the host at `node dist/server.js`. The widget
talks back via standard MCP-UI postMessage intents (`prompt`, `link`),
so no host-specific code is required.
