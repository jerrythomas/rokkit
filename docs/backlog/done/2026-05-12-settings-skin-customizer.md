# Settings Skin Customizer

**Date:** 2026-05-12
**Status:** Closed 2026-06-03 — stale. Targeted the legacy `/settings` page (now under `apps/learn/src/routes/(legacy)/(app)/settings/`). Skin/theme customization in the new Koan/learn app is covered by the shipped Theme Wizard. Re-open as a new item if a Koan-side skin panel is wanted.

## Summary

Add skin customization to the Settings page — users can pick from predefined skins or change the base color for semantic roles (primary, surface, etc.) to see how changes apply to the active theme in real time.

## Features

### Predefined Skins
- Show available skins from `rokkit.config.js` `skins` map (default, ocean, violet, rose, emerald)
- Each skin displayed as a swatch card with preview colors
- Clicking a skin applies it immediately (updates `body.dataset.skin` or equivalent)

### Custom Color Picker
- For each semantic role (surface, primary, secondary, accent, success, warning, danger):
  - Show current mapped palette name and color swatch
  - Allow picking a different palette from the available set (Tailwind defaults + custom palettes)
  - Live preview: changing primary from `shu` to `hisui` updates all primary-colored elements immediately
- Changes persisted to localStorage alongside other settings

### Integration with Ink (future)
- Once the ink role ships, include ink in the customizable roles
- Show ink/surface contrast preview at matching z-levels

## Dependencies

- Depends on extensible roles spec (2026-05-12-semantic-ink-and-extensible-roles-design.md) for custom role support
- Requires runtime CSS variable updates (not a rebuild — just swap `--color-primary-*` values)
