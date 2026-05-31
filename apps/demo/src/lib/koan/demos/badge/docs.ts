export const badgeDocs = `## Notification counts and status dots

Badge is a small overlay primitive — a numeric count or a status dot
that decorates another element (icon button, avatar, list item) to
draw attention without disrupting layout.

## Basic example

\`\`\`svelte
<Badge count={3} variant="error">
  <Button icon="i-mdi:bell" aria-label="Notifications" />
</Badge>
\`\`\`

When \`children\` are passed the badge positions itself absolutely
over the child; without children the badge renders inline.

## Variants

\`default\` / \`primary\` / \`success\` / \`warning\` / \`error\` map to the
theme's role colours. Use \`error\` for unread/urgent counts,
\`success\` for "ready" indicators, \`primary\` for branded counters.

## Dot mode

\`dot={true}\` omits the number and renders a small filled circle —
the right choice when "something happened" matters more than how
much.

## Count overflow

When \`count\` exceeds \`max\` (default 99), the badge renders \`{max}+\`
instead. Keeps the pill from sprawling when the queue is large.
`
