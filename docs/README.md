# Rokkit Learn Story System

Rokkit UI is a data-driven, headless component library for Svelte that empowers you to build high-quality, accessible, and beautiful user interfaces—without sacrificing creative control or developer velocity.

The Story system is a modular component library for creating interactive code demonstrations in the Rokkit Learn site. It replaces the previous CodeViewer component with a more flexible, reusable system that supports multiple files and better organization.

---

## Ecosystem Overview

Rokkit consists of several packages, each focused on a core aspect of modern Svelte development:

- **@rokkit/ui**: Headless, data-driven UI components
- **@rokkit/actions**: Svelte actions for behaviors and effects
- **@rokkit/states**: State management and proxy utilities
- **@rokkit/themes**: Utility-first and semantic theming
- **@rokkit/data**: Data manipulation and transformation utilities
- **@rokkit/forms**: Form generation and validation
- **@rokkit/icons**: Icon system powered by Iconify
- **@rokkit/cli**: Command-line tools for scaffolding and automation

---

## Core Principles

- **Data-First Design:** Components adapt to your data structure, not the other way around.
- **Composable & Extensible:** Every component is designed for extension and composition.
- **Unstyled by Default:** Bring your own styles, or use one of the included themes. Rokkit provides semantic `data-*` attributes for easy theming.
- **Accessible by Default:** ARIA roles, keyboard navigation, and focus management are built in.
- **Developer Experience:** Stable, predictable APIs, full TypeScript coverage, and comprehensive documentation help you move fast and stay productive.

---

## Bring Your Own Styles

Most Rokkit components are completely unstyled, giving you full control over your application's look and feel. Use `class` props or semantic `data-*` attributes for styling hooks. Rokkit includes a few built-in style packs (like **rokkit**, **material**, and **minimal**), but you can enhance or replace them as you see fit.

---

## Driven by Data

Unlike traditional UI libraries, Rokkit is built around the principle that **data should drive the interface**. Components adapt to your data structures using a flexible field mapping system, so you spend less time transforming data and more time building features.

- No more writing adapters or mappers for every API response.
- Consistent prop patterns across all components: `items`, `value`, `fields`, and more.
- Composable snippets and overrides for custom rendering.

---

## Developer Experience

Rokkit is designed to let you focus on what matters—your application's functionality. You don't need to learn a new design system or force your data into rigid component contracts. Instead, Rokkit's intuitive patterns and unstyled-by-default approach let you build apps quickly, with minimal friction and maximum flexibility.

- Rapid prototyping with minimal boilerplate.
- Easy to learn, easy to extend.
- Comprehensive documentation and real-world examples.
- Unopinionated about styling—bring your own, or use a starter theme.

---

## Production-Ready Accessibility

Accessibility is not an afterthought in Rokkit. All interactive components are WAI-ARIA compliant, support keyboard navigation, and include focus management and screen reader support out of the box.

---

## Acknowledgements

- **Bits UI** — Inspired the data-attribute pattern and composable architecture. Rokkit uses Bits UI under the hood for some components.
- **UnoCSS** — For utility-first styling and theme support.
- **Iconify** — For the icon system.

---

## Story System (for Demos & Docs)

The Story system powers interactive demos and code examples for Rokkit documentation. It is not part of the runtime library, but helps you learn and explore Rokkit’s capabilities.

See [docs/stories.md](./stories.md) for details on the Story system.

---

Rokkit UI is built to help you **build beyond limits**—with speed, flexibility, and confidence.
