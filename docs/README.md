# Documentation

## Contents

| Folder | Purpose | Audience |
|--------|---------|----------|
| [requirements/](requirements/) | What and why — per module | Human |
| [design/](design/) | How and why — per module | Human |
| [backlog/](backlog/) | Prioritized work items by area | Both |
| [plans/](plans/) | Active plan + archived completed plans | AI agent |

## Two Documentation Layers

- **Requirements + Design** — human-readable module docs. Requirements describe what/why. Design describes how/why. Numbered 1:1 per module.
- **Backlog** — prioritized work items grouped by area, referencing requirements and design docs.

## Flow

Requirements → Design → Backlog → Plan → Implement

Requirements and design are living docs, updated before and after implementation as needed.

## Public Documentation

User-facing guides, API reference, and llms.txt are served from the [learn site](../sites/learn/).

## Related

- [Requirements README](requirements/README.md) — module index and numbering convention
- [Design README](design/README.md) — module design docs index
- [Component Status](design/000-component-status.md) — implementation tracking
