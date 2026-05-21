# Named Tokens Don't Flip in `[data-mode="dark"]`

**Date:** 2026-05-20
**Status:** Backlog — preset bug

## Summary

The trimmed token vocabulary's named layer (`--paper`, `--paper-soft`, `--paper-mute`, `--paper-edge`, `--ink`, `--ink-mute`, `--ink-soft`, `--ink-faint`, `--primary`, `--accent`, `--accent-soft`, status names, `--focus-ring`, `--shadow-tint`) is emitted **only at `:root`** with light values. The `[data-mode="dark"]` block that the preset emits only flips the `--color-*-z*` alias layer.

Result: any component or app CSS that reads named tokens directly (e.g., `background: var(--paper-soft)`) renders identically in light and dark mode.

## How to reproduce

Inspect `packages/themes/dist/base.css`:

```bash
grep -c "^\[data-mode=\"dark\"\]" packages/themes/dist/base.css
# → 1

# That single block contains only --color-*-z* mappings:
awk '/^\[data-mode="dark"\]/{flag=1} flag{print; if(/^}/){flag=0; exit}}' \
  packages/themes/dist/base.css | grep -c '^\s*--paper\|^\s*--ink:'
# → 0
```

Named tokens at `:root` only:

```bash
grep -E "^\s*--paper:|^\s*--ink:" packages/themes/dist/base.css
# all matches are inside :root, none inside [data-mode="dark"]
```

## Expected behavior

The design spec for the trimmed token vocabulary (`docs/superpowers/specs/2026-05-15-trimmed-token-vocabulary-design.md`) says:

> Same emission model. The skin defines `{ light, dark }` palettes per role. The preset emits:
> ```css
> :root { /* named + z-aliases resolved from light palettes */ }
> [data-mode="dark"] { /* same names, resolved from dark palettes */ }
> ```

So the named tokens should be re-emitted inside `[data-mode="dark"]` for any skin that has a dual-palette mapping. For single-palette skins the named tokens stay constant (light-only), which is also acceptable.

## Actual behavior

`@rokkit/themes/dist/base.css` is built from the default single-palette skin (`slate` for everything), so the dark block correctly skips named-token re-emission. But this means a consumer importing `@rokkit/themes/base.css` and authoring against `--paper` / `--ink-mute` etc. has no dark mode — even when their app's runtime preset DOES use a dual-palette skin.

The right fix is one of:

1. **Always emit named tokens in `[data-mode="dark"]`**, pointing at the (flipping) z-aliases. This makes the dark block self-sufficient even when downstream consumers import the built CSS rather than running the preset themselves.
2. **Document that consumers must run their own preset build** if they want named tokens to flip — and add the `[data-mode="dark"]` named block to the runtime preset emit when the skin is dual-palette.

Option 1 is safer (works for all consumers, including those importing built CSS). Option 2 keeps emit lean.

## Workaround (in place 2026-05-20)

`demo/src/lib/koan/compat.css` adds a manual `[data-mode="dark"]` block that re-points named tokens to z-aliases. Lets the demo's chat primitives respond to dark mode while the preset fix is being decided.

Remove that block once the preset emits the named layer in dark.

## Investigation needed

- Confirm the dev-time runtime preset (UnoCSS `presetRokkit({...})`) has the same omission for dual-palette skins, or whether it's only the package-built CSS that lacks the dark named block.
- If the runtime emit is correct, the issue is purely in `@rokkit/themes` build configuration; bumping the package's skin to dual-palette would fix it. But that may be a breaking change for consumers relying on the existing light-only base output.
- Decide between options 1 and 2 above.

## Out of scope

- The names themselves — vocabulary is locked at the 24-name set.
- Per-role mode emit — same problem applies; same fix.
