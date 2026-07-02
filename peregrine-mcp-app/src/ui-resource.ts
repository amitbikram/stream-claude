import { createUIResource } from '@mcp-ui/server';
import type { WizardState } from './state.js';

// Static, public URL for the wizard HTML shell. The HTML loads CSS + JS
// from the same CDN path, and reads the encoded state from the `?state=`
// query param. Both browsers and the MCP-UI iframe sandbox cache the assets
// aggressively after first load, so subsequent renders are near-instant.
const WIZARD_URL = process.env.PEREGRINE_WIZARD_URL
  || 'https://cdn.jsdelivr.net/gh/amitbikram/stream-claude@38ee19a/peregrine-mcp-app/widget/blog_wizard.html';

// Build the iframe URL by URL-encoding the wizard state as the `state`
// query param. The shell's inline boot script copies this into the
// `#bw-root[data-state]` attribute so the widget hydrates as if a host
// had baked the state directly.
export function buildWizardIframeUrl(state?: WizardState): string {
  if (!state || Object.keys(state).length === 0) return WIZARD_URL;
  const encoded = encodeURIComponent(JSON.stringify(state));
  const sep = WIZARD_URL.includes('?') ? '&' : '?';
  return `${WIZARD_URL}${sep}state=${encoded}`;
}

// Wrap into the MCP-UI external-url resource the client renders in an iframe.
export function buildWizardResource(state?: WizardState) {
  const url = buildWizardIframeUrl(state);
  return createUIResource({
    uri: 'ui://peregrine-mcp-app/wizard',
    content: { type: 'externalUrl', iframeUrl: url },
    encoding: 'text',
  });
}
