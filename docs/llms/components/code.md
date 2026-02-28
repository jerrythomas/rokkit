# Code

> Syntax-highlighted code block powered by Shiki with copy button and line numbers.

**Export**: `Code` from `@rokkit/ui`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `code` | `string` | `''` | Code string to display |
| `language` | `string` | `'text'` | Language identifier (e.g. `'svelte'`, `'typescript'`) |
| `theme` | `string` | `'github-dark'` | Shiki theme name |
| `showLineNumbers` | `boolean` | `false` | Display line numbers |
| `showCopyButton` | `boolean` | `true` | Show copy-to-clipboard button |
| `icons` | `Partial<CodeStateIcons>` | — | Override copy icon CSS classes |
| `class` | `string` | `''` | Extra CSS classes |

## Utilities

```typescript
import { highlightCode, preloadHighlighter, getSupportedLanguages } from '@rokkit/ui'

// Highlight without rendering component
const html = await highlightCode(code, 'typescript', 'github-dark')

// Pre-warm Shiki for specific languages
await preloadHighlighter(['svelte', 'typescript', 'json'])

// List all supported language IDs
const langs = getSupportedLanguages()
```

## Examples

### Basic

```svelte
<script>
  import { Code } from '@rokkit/ui'
</script>

<Code code={`const x = 42`} language="javascript" />
```

### With line numbers

```svelte
<Code
  code={`function hello() {\n  return 'world'\n}`}
  language="typescript"
  showLineNumbers
/>
```

### Custom theme

```svelte
<Code code={snippet} language="svelte" theme="catppuccin-mocha" />
```

## Notes

- Shiki is a peer dependency — install separately: `npm install shiki`.
- Highlighting is async; component shows loading state until Shiki resolves.
- `preloadHighlighter` should be called at app init to avoid FOUC.
