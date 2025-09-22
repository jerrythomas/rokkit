# Rokkit Story System

The Rokkit Story System is a modular set of utilities and components designed to power interactive demos and code examples throughout the Rokkit documentation and learning site. It serves as a developer education and demonstration tool to help you explore and understand Rokkit’s capabilities.

---

## Purpose

- **Showcase Rokkit Components:** Provide live, interactive examples of Rokkit UI components and patterns.
- **Display Source Code:** Allow users to view, copy, and experiment with the exact code used in demos.
- **Organize Tutorials:** Structure multi-file, multi-step tutorials and stories for a better learning experience.

---

## Key Components

- **StoryRoot:** Orchestrates loading and display of stories, manages state, and handles code visibility toggling.
- **StoryComponent:** Renders interactive Svelte components inside the story container.
- **StoryCode:** Displays syntax-highlighted code, supporting both single-file and multi-file demos.
- **StoryError:** Consistent error display for loading or rendering issues.
- **StoryLoading:** Shows loading states with a spinner and customizable message.

---

## How It Works

- Each story is organized as a folder with a main Svelte component (`App.svelte`) and any supporting files.
- The Story system loads these files dynamically, rendering both the interactive demo and the source code.
- Stories can be composed of multiple files, and the system provides tabs and icons for easy navigation.

---

## Example Usage

```svelte
<script>
  import { StoryRoot } from '$lib/components/Story'
</script>

<StoryRoot
  slug="introduction"
  title="Interactive List Demo"
  description="A data-driven List component with field mapping and custom rendering"
/>
```

---

## File Structure

Stories are organized by tutorial section and should follow this structure:

```
stories/
├── introduction/
│   └── src/
│       └── App.svelte
├── elements/
│   ├── list/
│   │   └── src/
│   │       └── App.svelte
│   └── tabs/
│       └── src/
│           └── App.svelte
└── forms/
    └── inputs/
        └── src/
            └── App.svelte
```

Each story's main component should be in `src/App.svelte` and can include additional files as needed.

---

## Features

- **Live Demos:** Interactive Svelte components rendered directly in the docs.
- **Code Viewing:** Syntax-highlighted, copyable code for every demo.
- **Multi-File Support:** Organize complex examples with multiple files and tabs.
- **Error Handling:** Graceful handling of loading and rendering errors.
- **Performance:** Lazy loading, code splitting, and caching for fast docs.

---

## Why a Separate System?

The Story System is intentionally kept separate from the core Rokkit library to:

- Avoid adding runtime or bundle size overhead to production apps.
- Allow rapid iteration and improvement of documentation tools.
- Provide a focused, best-in-class learning experience for Rokkit users.

---

## Migration Plan

- The current tutorials package will be converted into a stories package.
- Story system components will eventually move into the `@rokkit/ui` package for consistency.
- Story building utilities will replace the legacy tutorials library.

---

## Acknowledgements

- **Bits UI** — Inspired the data-attribute pattern and composable architecture. Rokkit uses Bits UI under the hood for some components.
- **UnoCSS** — For utility-first styling and theme support.
- **Iconify** — For the icon system.

---

## Licensing

For licensing and language model usage, see [llms.txt](<../sites/learn/src/routes/(learn)/welcome/introduction/llms.txt>).

---
