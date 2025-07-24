# Story Organization & Content Management Guidelines

## Overview

To ensure consistency, maintainability, and ease of updates for tutorial and documentation pages, follow this approach for all story-based pages (such as those under `sites/learn/src/routes/(learn)/welcome` and `sites/learn/src/routes/(learn)/customization`):

- **Keep `+page.svelte` clean:** Only include HTML structure, layout, and minimal logic for rendering. Avoid embedding code examples or prototypes directly in the page file.
- **Use `<article data-article-root>` as the main wrapper:** All story/tutorial pages must use `<article data-article-root>` as the root element for their content. Do not use custom `<section>` wrappers or unnecessary styles for the main container.
- **Import stories and fragments:** Use a `stories.js` file to import all interactive examples (App.svelte files) and code fragments (from a `fragments/` folder) using `import.meta.glob`. See below for the canonical content of `stories.js`.
- **Organize code fragments:** Place all code snippets, shell commands, and example source files in a `fragments/` subfolder. **Never write code inline in `+page.svelte`—always put code in a fragment file and reference it using `<Code {...storyBuilder.getFragment(n)} />`.**
- **Organize prototypes/examples:** Place interactive Svelte example apps in their own subfolders (e.g., `example/`, `intro/`, `mapping/`), each with an `App.svelte` entry point.
- **Use a StoryBuilder:** Instantiate a `StoryBuilder` in `stories.js` to manage loading and referencing both fragments and examples.
- **Render with StoryViewer/Code:** In `+page.svelte`, use `<StoryViewer {...storyBuilder.getExample('name')} />` for interactive demos and `<Code {...storyBuilder.getFragment(n)} />` for code blocks.
- **Meta and config:** Place page metadata in a `meta.json` file in the same directory.

---

## Example Structure

```
component/
├── +page.svelte
├── stories.js
├── fragments/
│   ├── 01-install.sh
│   ├── 02-first-component.svelte
│   └── ...
├── example/
│   └── App.svelte
├── mapping/
│   └── App.svelte
└── meta.json
```

---

## stories.js (Canonical Content)

Every story/tutorial folder should include a `stories.js` file with the following content:

```js
import { StoryBuilder } from '$lib/builder.svelte.js'

const modules = import.meta.glob('./*/**/App.svelte', { import: 'default' })
const sources = import.meta.glob('./*/**/*', { query: '?raw', import: 'default' })

export const storyBuilder = new StoryBuilder(sources, modules)
```

- This automatically loads all code fragments and interactive examples in the folder.
- In your `+page.svelte`, import `storyBuilder` from `./stories.js` and use it with `<Code {...storyBuilder.getFragment(n)} />` and `<StoryViewer {...storyBuilder.getExample('name')} />`.

---

## meta.json Requirements

Each story/tutorial folder **must** include a `meta.json` file with the following attributes:

- `title` (string): The page or story title
- `order` (number): Sort order for navigation
- `category` (string): Section/category name
- `icon` (string): Icon name or emoji for navigation
- `description` (string): Short description of the page/story
- `tags` (array of strings): Keywords for search and filtering

Example:

```json
{
  "title": "Getting Started",
  "order": 1,
  "category": "welcome",
  "icon": "i-solar:rocket-bold-duotone",
  "description": "Set up your first Rokkit project and start building data-driven applications",
  "tags": ["setup", "installation", "quick-start", "project"]
}
```

---

## Benefits

- **Separation of concerns:** Content, code, and interactive examples are managed independently.
- **Easy updates:** Code examples and demos can be updated without touching the main page layout.
- **Consistent rendering:** All pages use the same pattern for displaying code and interactive content.
- **Scalability:** New examples or fragments can be added without cluttering the main page file.

---

## Required Practices

- **Apply this structure to all tutorial and documentation pages, especially under `/customization` and similar folders.**
- **Do not transform or inline code examples in `+page.svelte`; always reference fragments.**
- **All code snippets must be in a separate file under `fragments/`. Never write code inline in `+page.svelte`.**
- **Keep `+page.svelte` focused on markup and layout, not code content.**
- **Always use `<article data-article-root>` as the main wrapper for the page. Do not use custom `<section>` wrappers or add unnecessary styles to the root.**

---
