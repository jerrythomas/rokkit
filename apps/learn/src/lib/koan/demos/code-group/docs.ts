export const codeGroupDocs = `## Multi-file code display with a tree picker

CodeGroup renders a set of related files with a hierarchical tree
picker on the left and the active file's source on the right.
Real projects have nested folders, so the picker is a tree (not a
tabs row) — paths like \`src/lib/Button.svelte\` flow into a folder
structure automatically.

Below 768px the rail collapses into a "current file" pill that
opens an overlay drawer, keeping code at full viewport width.

## Basic example

\`\`\`svelte
<script>
  import { CodeGroup } from '@rokkit/ui'

  const files = [
    { path: 'src/App.svelte', language: 'svelte', code: appSrc },
    { path: 'src/lib/Button.svelte', language: 'svelte', code: buttonSrc },
    { path: 'package.json', language: 'json', code: pkgSrc }
  ]
</script>

<CodeGroup {files} initialFile="src/App.svelte" />
\`\`\`

## File shape

\`\`\`ts
interface CodeGroupFile {
  path: string       // 'src/lib/Button.svelte' — used as id + tree placement
  language: string   // Shiki language id
  code: string       // raw source
  name?: string      // optional display name (defaults to path's last segment)
  icon?: string      // optional file icon (defaults to extension lookup)
}
\`\`\`

## Initial file

\`initialFile\` is the path of the file selected on first mount. If
the path doesn't exist in the file list, falls back to the first
file. After the user navigates, the selection persists for the
component's lifetime — no external state needed.

## Preview snippet

Optional \`preview\` snippet renders a collapsed "Show preview"
panel below the code. Use it to embed a live, runnable instance of
whatever the displayed code is showing.

## When to use CodeGroup vs Code vs CodeBlock

- \`Code\` — a single snippet inline in prose.
- \`CodeBlock\` — a single snippet with a filename header — for "this
  is the file" callouts.
- \`CodeGroup\` — many related files with a tree — for project
  skeletons, "before / after" pairs, or "here are all the pieces"
  walkthroughs.
`
