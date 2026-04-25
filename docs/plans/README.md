# Active Plan

## Design Token System + Demo App + Zen-Sumi Theme

**Backlog**: Design system overhaul, demo app, theme rebuild
**Status**: PLAN — awaiting agreement
**Design docs**: `docs/design-system/`

### Goal

Build a cohesive, configurable design token system for rokkit. Validate it by:
1. Building a demo app that replicates zen/sumi mockup aesthetics
2. Creating the zen-sumi theme as the first theme built on the new token system
3. Replacing custom demo components with rokkit components
4. Rebuilding all existing themes (rokkit, minimal, material, frosted) on the new tokens

### Key Decisions

- 10 semantic colors (add tertiary), nullable/default inheritance
- Color-space agnostic (RGB, HSL, OKLCH) — zen-sumi uses OKLCH natively
- Roundedness as independent axis (sharp/soft/rounded/pill)
- Hybrid theme factory: JS generates tokens + CSS handles visual styling
- Paraglide.js for i18n (English, Spanish, Arabic/RTL)
- Breaking change to existing themes — no backward compatibility
- New Stepper component for wizard navigation
- Playwright visual regression for all theme/density/mode/locale combinations

### Phases

1. Demo app foundation (SvelteKit + mockup replication)
2. Internationalization (Paraglide + 3 languages)
3. Playwright baseline snapshots
4. Design token system (extend core + preset)
5. Zen-sumi theme (build + promote to @rokkit/themes)
6. Component migration (custom → rokkit, screen by screen)
7. Theme rebuild (rokkit, minimal, material, frosted)
8. Settings panel + live theme switching
9. Final verification

### Detailed Plan

See `docs/design-system/execution-plan.md` for full step-by-step breakdown.
