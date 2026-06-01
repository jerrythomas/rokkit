## Inline code block with Shiki highlighting

Code is a self-contained block — pass a code string and a language,
get back a syntax-highlighted snippet with a hover-revealed copy
button. Uses Shiki under the hood, so highlighting matches what
you'd see in VS Code for the same theme.

## Basic example

```svelte
<script>
  import { Code } from '@rokkit/ui'

  const example = `function greet(name) {
  return \`Hello, \${name}!\`
}`
</script>

<Code code={example} language="javascript" />
```

## Language support

`language` is any [Shiki-supported language id](https://shiki.style/languages)
— common ones include `javascript`, `typescript`, `svelte`,
`html`, `css`, `json`, `yaml`, `shell`. Default is `text`
(plain rendering, no highlighting).

## Themes

`theme` accepts `'light'` / `'dark'` and applies a paired Shiki
theme — defaults to `dark`. The theme controls only the code
colors; surrounding chrome (border, copy button) takes its cue
from the active style.

## Copy button

The copy button reveals on hover and stays visible while focused.
Set `showCopyButton={false}` to hide it entirely — useful for
read-only embeds in long docs.

## Line numbers

`showLineNumbers={true}` adds a gutter on the left. Aligns with
the chrome of the active style so the numbers don't visually
overwhelm short snippets.

## When to use Code vs CodeBlock vs CodeGroup

- `Code` — single snippet, the building block.
- `CodeBlock` — single snippet with a filename header, dark
  fenced look, useful for "this is the file" embeds.
- `CodeGroup` — multiple files / variants with a tree picker —
  ideal for project skeletons or before/after comparisons.
