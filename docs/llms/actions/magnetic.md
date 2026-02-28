# magnetic

> Element shifts subtly toward the cursor on hover, creating a magnetic attraction effect.

**Package**: `@rokkit/actions`
**File**: `magnetic.svelte.js`

## Usage

```svelte
<button use:magnetic>Hover me</button>
<button use:magnetic={{ strength: 0.5, duration: 400 }}>Strong magnetic</button>
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `strength` | `number` | `0.3` | Maximum displacement as fraction of element size (0–1) |
| `duration` | `number` | `300` | Return-to-center transition duration (ms) |

## Behavior

- On `mousemove`: calculates cursor offset from element center, translates proportionally to `strength`.
- On `mouseleave`: smooth transition back to original position over `duration` ms.
- Transform applied with `transition: 'none'` during mouse move (immediate tracking), then transition re-added for return.
- Respects `prefers-reduced-motion` — skips entirely.

## Example

```svelte
<button use:magnetic={{ strength: 0.4 }} class="cta">
  Get Started
</button>
```

## Notes

- Works best on contained elements like buttons, icons, cards.
- Composable with `hoverLift` and `ripple`.
- Does not conflict with CSS transitions on other properties.
