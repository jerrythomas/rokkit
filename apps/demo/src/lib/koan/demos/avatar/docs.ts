export const avatarDocs = `## User identity at a glance

Avatar renders a circular (or square) image representing a person —
with a graceful initials fallback when no image is available, an
optional online-presence indicator, and five size presets.

## Image with fallback

\`\`\`svelte
<Avatar
  src="https://example.com/ada.jpg"
  alt="Ada Lovelace"
  name="Ada Lovelace"
/>
\`\`\`

If \`src\` is missing or fails to load, the avatar renders \`initials\`
instead. If \`initials\` isn't set but \`name\` is, the component
auto-derives them (first letter of the first two words).

## Sizes

\`xs\` / \`sm\` / \`md\` (default) / \`lg\` / \`xl\` — five steps that match
the theme's typographic scale. Use \`xs\` in dense list contexts,
\`xl\` for profile headers.

## Presence

\`status\` accepts \`online\` / \`offline\` / \`away\` / \`busy\` and renders
a small coloured dot in the bottom-right corner. Map to your app's
real-time state.

## Shape

\`circle\` (default) for people, \`square\` when the avatar represents
a non-human entity (workspace, team, organization).
`
