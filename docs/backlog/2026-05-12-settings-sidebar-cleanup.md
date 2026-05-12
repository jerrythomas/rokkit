# Settings Sidebar Cleanup

**Date:** 2026-05-12
**Status:** Backlog

## Summary

Remove the language switcher and dark/light mode toggle from the sidebar now that the Settings page (`/settings`) provides full controls for both.

## Current State

- Sidebar bottom area has: Dark mode toggle, language chips (EN/ES/AR)
- Settings page has: Mode (Light/Dark), Language (English/Espanol/Arabic), plus Theme, Density, Corners

## What to Do

1. Remove the dark/light mode toggle button from `+layout.svelte` sidebar
2. Remove the language switcher chips from `+layout.svelte` sidebar
3. Keep the "Settings" nav link in the sidebar — it becomes the single entry point for all appearance/locale controls
4. Verify the sidebar layout looks clean without the bottom controls
5. Update e2e tests that reference sidebar mode/language elements
