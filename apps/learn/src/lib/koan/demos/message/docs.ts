export const messageDocs = `## Inline alert messages

Message is the inline counterpart to Toast. Both share the four
severity kinds (info / success / warning / error), but Message stays
in flow — it lives where the user is reading, not floating over the
content. Use it for form-level errors, inline confirmations, or any
non-transient feedback the user needs to see in context.

## Basic example

\`\`\`svelte
<Message type="success" text="Your changes were saved." />
<Message type="error" text="Couldn't connect to the server. Retry?" />
\`\`\`

## Severity kinds

\`info\` (default) / \`success\` / \`warning\` / \`error\` — each carries
its own colour, icon, and aria semantics. Pick by what the user
needs to do:

- **info** — context, no action required
- **success** — confirms an action completed
- **warning** — soft caution, action recommended
- **error** — hard problem, action required

## Dismissible vs persistent

\`dismissible={true}\` shows a close button; the user controls when
the message leaves. By default messages are persistent. Set
\`timeout={4000}\` to auto-dismiss after N ms (\`timeout={0}\` disables
the auto-dismiss).

## Rich content

Pass children for inline formatting — strong text, links, even nested
components.

\`\`\`svelte
<Message type="warning">
  <strong>Heads up.</strong> The migration runs at 2 AM UTC.
  <a href="/runbook">Read the runbook →</a>
</Message>
\`\`\`

## Action buttons

The \`actions\` snippet renders to the right of the message body —
useful for "Retry" / "Undo" / "Learn more" inline affordances.
`
