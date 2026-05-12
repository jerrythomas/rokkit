# Settings Skin Customizer

**Date:** 2026-05-12
**Status:** Approved

## Problem

Users can switch theme style (zen-sumi, rokkit, etc.) but cannot change the color palette (skin) from the UI. The 5 predefined skins (default, ocean, violet, rose, emerald) are defined in `rokkit.config.js` but have no settings UI.

## Design

### New "SKIN" section in Settings page

Placed between Theme Style and Appearance sections.

**Predefined skin picker** — horizontal row of cards (matching theme card layout). Each card shows:
- Skin name
- 4 color swatches (surface, primary, secondary, accent at z5)
- Active: primary border + ring

**Individual color roles** — below skin cards. Per role (Surface, Primary, Secondary, Accent):
- Role label
- Row of clickable palette swatches (small circles, z5 shade of each available palette)
- Active swatch has ring indicator
- Click updates that role's CSS variables immediately

### Runtime mechanism

- `$lib/data/skins.ts` — exports skin definitions + palette map as pre-computed lookup (skin name → role → shade → OKLCH value)
- `theme.svelte.ts` — new `setSkin(name)` and `setRoleColor(role, palette)` methods that set CSS variables on `document.documentElement.style`
- Persisted to localStorage (`sensei-theme` key)

### Independence from theme style

Style (visual treatment) and skin (color palette) are independent axes. Zen-sumi style + ocean skin works.

## Files

| File | Change |
|------|--------|
| `demo/src/lib/data/skins.ts` | Create — skin definitions, palette lookup, available palettes |
| `demo/src/lib/stores/theme.svelte.ts` | Add `skin`, `setSkin()`, `setRoleColor()`, `roleOverrides` |
| `demo/src/routes/(app)/settings/+page.svelte` | Add SKIN section with cards + role swatches |
