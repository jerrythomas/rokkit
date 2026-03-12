# @rokkit/stories

Utilities for building interactive code stories and tutorials in SvelteKit — file fetching, metadata parsing, section navigation, and syntax-highlighted code display.

## Install

```bash
bun add @rokkit/stories
# or
npm install @rokkit/stories
```

## Overview

`@rokkit/stories` is used to build interactive documentation pages where each "story" pairs a live Svelte component preview with its source files. It handles:

- Loading and grouping source files via Vite's `import.meta.glob`
- Parsing metadata (title, description, category, order) from story modules
- Navigating stories by section and slug
- Rendering syntax-highlighted code via Shiki
- Displaying a live preview alongside the highlighted source

## Usage

### Loading stories in a SvelteKit route

```js
// src/routes/stories/[slug]/+page.js
import { fetchStories, getAllSections, findSection } from '@rokkit/stories'

const sources = import.meta.glob('/src/stories/**/+page.svelte', { as: 'raw', eager: false })
const modules = import.meta.glob('/src/stories/**/meta.js')

export async function load({ params }) {
  const stories = await fetchStories(sources, modules)
  const sections = getAllSections()
  const section = findSection(sections, params.slug)

  return { stories, sections, section }
}
```

### Rendering a story

```svelte
<!-- src/routes/stories/[slug]/+page.svelte -->
<script>
  import { StoryViewer } from '@rokkit/stories'

  let { data } = $props()
</script>

<StoryViewer App={data.section.App} files={data.section.files} />
```

`StoryViewer` renders a split view: the live component preview on the left, syntax-highlighted source files on the right.

### Working with sections and metadata

```js
import {
  fetchImports,
  getSlug,
  getSections,
  groupFiles,
  findSection,
  findGroupForSection
} from '@rokkit/stories'

// Fetch raw source file contents
const files = await fetchImports(import.meta.glob('./examples/**', { as: 'raw' }))

// Group files by their parent folder
const grouped = groupFiles(files)

// Build a navigation tree from story metadata
const sections = getSections(metadata)

// Look up a section by URL slug
const current = findSection(sections, 'getting-started')

// Find which nav group a section belongs to
const group = findGroupForSection(sections, current.id)
```

### Syntax highlighting

```js
import { highlightCode, preloadHighlighter } from '@rokkit/stories'

// Warm the highlighter (call once on app start to avoid first-render delay)
await preloadHighlighter()

// Highlight a code string
const html = await highlightCode('const x = 1', {
  lang: 'javascript',
  theme: 'github-light' // or 'github-dark'
})
```

Supported languages: `svelte`, `javascript`, `typescript`, `css`, `html`, `json`, `bash`, `shell`.

## API

### Components

| Export        | Description                                                                                  |
| ------------- | -------------------------------------------------------------------------------------------- |
| `StoryViewer` | Renders a live preview (`App` prop) alongside syntax-highlighted source files (`files` prop) |
| `CodeViewer`  | Tabbed code viewer with syntax highlighting                                                  |
| `Preview`     | Isolated preview container for a live component                                              |
| `Notes`       | Prose content area for story narrative text                                                  |

### Story utilities (`@rokkit/stories`)

| Export                              | Description                                                   |
| ----------------------------------- | ------------------------------------------------------------- |
| `fetchImports(sources)`             | Resolve `import.meta.glob` entries into `File[]` objects      |
| `fetchStories(sources, modules)`    | Combine source files and metadata modules into stories        |
| `getSlug(file)`                     | Derive a URL slug from a file path                            |
| `getSections(metadata)`             | Build a hierarchical section list from metadata objects       |
| `groupFiles(files)`                 | Group `File[]` by parent folder name                          |
| `getAllSections()`                  | Return the full section list (populated after `fetchStories`) |
| `findSection(sections, slug)`       | Look up a section by slug                                     |
| `findGroupForSection(sections, id)` | Find the nav group that contains a section                    |

### Shiki utilities

| Export                         | Description                                            |
| ------------------------------ | ------------------------------------------------------ |
| `highlightCode(code, options)` | Highlight a code string; returns HTML string           |
| `preloadHighlighter()`         | Warm the Shiki highlighter to avoid cold-start latency |

### Types

```ts
type File = {
  file: string
  group?: string
  name: string
  language: string
  content: string | object
}

type Metadata = {
  title: string
  description: string
  category: string
  tags: string[]
  depth: number
  order: number
  children?: Metadata[]
}

type Story = {
  files: File[]
  App?: SvelteComponent
}
```

## Dependencies

- `shiki` — syntax highlighting
- `frontmatter` — metadata parsing
- `@rokkit/core` — shared utilities

---

Part of [Rokkit](https://github.com/jerrythomas/rokkit) — a Svelte 5 component library and design system.
