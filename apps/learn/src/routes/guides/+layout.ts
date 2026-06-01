// Guides render markdown via @rokkit/ui MarkdownRenderer, which currently
// uses DOMPurify directly without an SSR-safe binding (DOMPurify needs a
// jsdom window on the server). The chat-shell side avoids this because it
// lazy-mounts components on the client; guides render markdown
// synchronously in the +page.svelte template.
//
// Workaround: disable SSR for the entire /guides section. Once the
// MarkdownRenderer is made SSR-safe (e.g. instantiate DOMPurify with
// jsdom on server, or skip sanitisation on server and re-sanitise on
// hydration), this file can switch to `prerender = true` for proper
// static HTML output and SEO.
export const ssr = false
