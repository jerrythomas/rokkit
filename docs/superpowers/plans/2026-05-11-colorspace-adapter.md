# ColorSpace Adapter — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace scattered color-space logic with a strategy-pattern `ColorSpace` class hierarchy that stores wrapped CSS colors in variables (e.g. `rgb(249, 115, 22)` instead of bare `249,115,22`), making `var(--color-x)` directly usable in raw CSS.

**Architecture:** A `ColorSpace` base class with `RgbColorSpace`, `HslColorSpace`, `OklchColorSpace` subclasses. Each knows how to `wrap()` values and produce `themeColor()` references for UnoCSS. The `Theme` class delegates all color-space concerns to an adapter instance. Alpha/opacity uses `color-mix()` instead of bare-channel injection.

**Tech Stack:** JavaScript classes, UnoCSS `theme.colors`, Vitest

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `packages/core/src/color-space.js` | Create | ColorSpace base + Rgb/Hsl/Oklch adapter classes |
| `packages/core/spec/color-space.spec.js` | Create | Unit tests for all adapters |
| `packages/core/src/theme.ts` | Modify | Replace `modifiers`, `COLOR_SPACE_WRAPPERS`, `shadesOf`, `colorToRgb` usage with adapter |
| `packages/core/spec/theme.spec.js` | Modify | Update expected values: wrapped palette, color-mix rules |
| `packages/core/src/utils.js` | Modify | Remove `hex2hsl`, `hexToComponents`, `colorToRgb`; keep `hex2rgb`, `hex2oklch`, `oklch2hex` as public utils |
| `packages/core/spec/utils.spec.js` | Modify | Remove tests for deleted functions |
| `packages/core/src/index.js` | Modify | Export `ColorSpace` class |
| `packages/core/spec/index.spec.js` | Modify | Update expected exports list |
| `packages/themes/src/index.js` | Modify | Remove `shadesOf` re-export |
| `packages/themes/build.mjs` | Modify | Remove `text-on-*` hardcoded shortcuts (Theme.getShortcuts already generates these) |
| `packages/unocss/src/preset.ts` | Verify | Confirm `color-mix` alpha works with UnoCSS; add custom rule if needed |

---

### Task 1: Create ColorSpace Base Class + RgbColorSpace

**Files:**
- Create: `packages/core/src/color-space.js`
- Create: `packages/core/spec/color-space.spec.js`

- [ ] **Step 1: Write failing tests for RgbColorSpace**

In `packages/core/spec/color-space.spec.js`:

```js
import { describe, it, expect } from 'vitest'
import { ColorSpace } from '../src/color-space'

describe('ColorSpace.create', () => {
  it('should return RgbColorSpace for "rgb"', () => {
    const cs = ColorSpace.create('rgb')
    expect(cs.name).toBe('rgb')
    expect(cs.mixSpace).toBe('srgb')
  })

  it('should default to RgbColorSpace when no argument', () => {
    const cs = ColorSpace.create()
    expect(cs.name).toBe('rgb')
  })
})

describe('RgbColorSpace', () => {
  const cs = ColorSpace.create('rgb')

  describe('wrap', () => {
    it('should wrap hex to rgb()', () => {
      expect(cs.wrap('#ff0000')).toBe('rgb(255, 0, 0)')
    })

    it('should wrap bare comma-separated channels', () => {
      expect(cs.wrap('255,0,0')).toBe('rgb(255, 0, 0)')
    })

    it('should wrap bare space-separated channels', () => {
      expect(cs.wrap('255 0 0')).toBe('rgb(255, 0, 0)')
    })

    it('should pass through already-wrapped rgb()', () => {
      expect(cs.wrap('rgb(255, 0, 0)')).toBe('rgb(255, 0, 0)')
    })

    it('should pass through non-string values', () => {
      expect(cs.wrap(null)).toBeNull()
      expect(cs.wrap(undefined)).toBeUndefined()
      expect(cs.wrap(42)).toBe(42)
    })

    it('should pass through named colors', () => {
      expect(cs.wrap('rebeccapurple')).toBe('rebeccapurple')
    })
  })

  describe('themeColor', () => {
    it('should produce color-mix with alpha placeholder', () => {
      expect(cs.themeColor('--color-primary-500')).toBe(
        'color-mix(in srgb, var(--color-primary-500) <alpha-value>%, transparent)'
      )
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/core && bun run test -- --run spec/color-space.spec.js`
Expected: FAIL — module not found

- [ ] **Step 3: Implement ColorSpace base + RgbColorSpace**

Create `packages/core/src/color-space.js`:

```js
import { hex2rgb } from './utils'

/**
 * Base class for color-space adapters.
 * Each adapter knows how to wrap values and produce UnoCSS-compatible references.
 */
export class ColorSpace {
  /**
   * Factory — returns the adapter for the given color space name.
   * @param {string} [space='rgb']
   * @returns {ColorSpace}
   */
  static create(space = 'rgb') {
    switch (space) {
      case 'hsl':   return new HslColorSpace()
      case 'oklch': return new OklchColorSpace()
      default:      return new RgbColorSpace()
    }
  }

  /** @returns {string} Color-space name */
  get name() { throw new Error('subclass must implement') }

  /** @returns {string} CSS color-mix interpolation space */
  get mixSpace() { throw new Error('subclass must implement') }

  /** @returns {string} CSS function name: 'rgb', 'hsl', 'oklch' */
  get fn() { throw new Error('subclass must implement') }

  /**
   * Convert hex (#rrggbb) to bare channels in this space.
   * @param {string} hex
   * @returns {string}
   */
  fromHex(hex) { throw new Error('subclass must implement') }

  /**
   * Wrap any input value into a complete CSS color in this space.
   *
   * @param {unknown} value — hex, bare channels, already wrapped, or non-string
   * @returns {unknown}
   */
  wrap(value) {
    if (typeof value !== 'string') return value

    // Already wrapped in any CSS function — pass through
    if (/^(rgb|hsl|oklch|color)\s*\(/.test(value)) return value

    // Hex — convert to this space's channels, then wrap
    if (/^#[0-9a-fA-F]{6}$/.test(value)) {
      return `${this.fn}(${this.fromHex(value)})`
    }

    // Short hex or named colors — pass through (can't decompose reliably)
    if (value.startsWith('#') || /^[a-zA-Z]+$/.test(value)) return value

    // Bare channels — already in this space, just wrap
    return `${this.fn}(${value.trim()})`
  }

  /**
   * Generate a UnoCSS theme color value with alpha placeholder.
   *
   * @param {string} varName — CSS variable name, e.g. '--color-primary-500'
   * @returns {string}
   */
  themeColor(varName) {
    return `color-mix(in ${this.mixSpace}, var(${varName}) <alpha-value>%, transparent)`
  }
}

class RgbColorSpace extends ColorSpace {
  get name() { return 'rgb' }
  get mixSpace() { return 'srgb' }
  get fn() { return 'rgb' }

  fromHex(hex) {
    const [r, g, b] = hex.match(/\w\w/g).map((x) => parseInt(x, 16))
    return `${r}, ${g}, ${b}`
  }

  wrap(value) {
    if (typeof value !== 'string') return value
    if (/^(rgb|hsl|oklch|color)\s*\(/.test(value)) return value
    if (/^#[0-9a-fA-F]{6}$/.test(value)) return `rgb(${this.fromHex(value)})`
    if (value.startsWith('#') || /^[a-zA-Z]+$/.test(value)) return value

    // Bare channels: '255,0,0' or '255 0 0' → normalize to 'rgb(255, 0, 0)'
    const parts = value.includes(',')
      ? value.split(',').map(s => s.trim())
      : value.trim().split(/\s+/)
    return `rgb(${parts.join(', ')})`
  }
}
```

Note: `HslColorSpace` and `OklchColorSpace` are stubbed as `throw new Error('not yet implemented')` — they are added in the next task.

```js
class HslColorSpace extends ColorSpace {
  get name() { return 'hsl' }
  get mixSpace() { return 'srgb' }
  get fn() { return 'hsl' }
  fromHex() { throw new Error('implemented in Task 2') }
}

class OklchColorSpace extends ColorSpace {
  get name() { return 'oklch' }
  get mixSpace() { return 'oklch' }
  get fn() { return 'oklch' }
  fromHex() { throw new Error('implemented in Task 2') }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd packages/core && bun run test -- --run spec/color-space.spec.js`
Expected: All RGB tests PASS

- [ ] **Step 5: Commit**

```
feat(core): add ColorSpace base class + RgbColorSpace adapter
```

---

### Task 2: Add HslColorSpace + OklchColorSpace

**Files:**
- Modify: `packages/core/src/color-space.js`
- Modify: `packages/core/spec/color-space.spec.js`

- [ ] **Step 1: Write failing tests for HslColorSpace and OklchColorSpace**

Append to `packages/core/spec/color-space.spec.js`:

```js
describe('HslColorSpace', () => {
  const cs = ColorSpace.create('hsl')

  it('should have correct name and mixSpace', () => {
    expect(cs.name).toBe('hsl')
    expect(cs.mixSpace).toBe('srgb')
  })

  describe('wrap', () => {
    it('should wrap hex to hsl()', () => {
      expect(cs.wrap('#ff0000')).toBe('hsl(0 100% 50%)')
    })

    it('should wrap bare channels', () => {
      expect(cs.wrap('0 100% 50%')).toBe('hsl(0 100% 50%)')
    })

    it('should pass through already-wrapped', () => {
      expect(cs.wrap('hsl(0 100% 50%)')).toBe('hsl(0 100% 50%)')
    })

    it('should pass through non-string', () => {
      expect(cs.wrap(null)).toBeNull()
    })
  })

  describe('themeColor', () => {
    it('should produce color-mix in srgb', () => {
      expect(cs.themeColor('--color-primary-500')).toBe(
        'color-mix(in srgb, var(--color-primary-500) <alpha-value>%, transparent)'
      )
    })
  })
})

describe('OklchColorSpace', () => {
  const cs = ColorSpace.create('oklch')

  it('should have correct name and mixSpace', () => {
    expect(cs.name).toBe('oklch')
    expect(cs.mixSpace).toBe('oklch')
  })

  describe('wrap', () => {
    it('should wrap hex to oklch()', () => {
      const result = cs.wrap('#ff0000')
      expect(result).toMatch(/^oklch\(/)
      const inner = result.match(/oklch\((.+)\)/)[1]
      const [L, C, H] = inner.split(' ').map(Number)
      expect(L).toBeCloseTo(0.63, 1)
      expect(C).toBeGreaterThan(0.2)
    })

    it('should wrap bare channels', () => {
      expect(cs.wrap('0.63 0.26 29')).toBe('oklch(0.63 0.26 29)')
    })

    it('should pass through already-wrapped', () => {
      expect(cs.wrap('oklch(0.63 0.26 29)')).toBe('oklch(0.63 0.26 29)')
    })

    it('should pass through non-string', () => {
      expect(cs.wrap(undefined)).toBeUndefined()
    })
  })

  describe('themeColor', () => {
    it('should produce color-mix in oklch', () => {
      expect(cs.themeColor('--color-primary-500')).toBe(
        'color-mix(in oklch, var(--color-primary-500) <alpha-value>%, transparent)'
      )
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/core && bun run test -- --run spec/color-space.spec.js`
Expected: FAIL — `fromHex` throws "implemented in Task 2"

- [ ] **Step 3: Implement HslColorSpace and OklchColorSpace**

Move the conversion math from `utils.js` into the adapter classes. In `packages/core/src/color-space.js`, replace the stub implementations:

**HslColorSpace** — move `hex2hsl` logic into `fromHex()`:

```js
class HslColorSpace extends ColorSpace {
  get name() { return 'hsl' }
  get mixSpace() { return 'srgb' }
  get fn() { return 'hsl' }

  fromHex(hex) {
    const [r, g, b] = hex.match(/\w\w/g).map((x) => parseInt(x, 16))
    const rn = r / 255, gn = g / 255, bn = b / 255
    const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
    const l = (max + min) / 2
    if (max === min) return `0 0% ${Math.round(l * 100)}%`
    const d = max - min
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    let h = 0
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6
    else if (max === gn) h = ((bn - rn) / d + 2) / 6
    else h = ((rn - gn) / d + 4) / 6
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
  }
}
```

**OklchColorSpace** — move `hex2oklch` conversion math into `fromHex()`. This requires the matrix math from `utils.js`. Import the helper functions (`srgbToLinear`, matrix constants, `matMul`) or inline them as private module functions in `color-space.js`.

```js
class OklchColorSpace extends ColorSpace {
  get name() { return 'oklch' }
  get mixSpace() { return 'oklch' }
  get fn() { return 'oklch' }

  fromHex(hex) {
    const [r, g, b] = hex.match(/\w\w/g).map((x) => parseInt(x, 16))
    const lin = [srgbToLinear(r), srgbToLinear(g), srgbToLinear(b)]
    const xyz = matMul(SRGB_TO_XYZ, lin)
    const lms = matMul(XYZ_TO_LMS, xyz)
    const lms3 = [Math.cbrt(lms[0]), Math.cbrt(lms[1]), Math.cbrt(lms[2])]
    const [L, a, bk] = matMul(LMS3_TO_OKLAB, lms3)
    const C = Math.sqrt(a * a + bk * bk)
    let H = (Math.atan2(bk, a) * 180) / Math.PI
    if (H < 0) H += 360
    return `${Math.round(L * 1000000) / 1000000} ${Math.round(C * 1000000) / 1000000} ${Math.round(H * 10000) / 10000}`
  }
}
```

Move the matrix constants (`SRGB_TO_XYZ`, `XYZ_TO_LMS`, `LMS3_TO_OKLAB`) and `srgbToLinear` into `color-space.js` as private module-level functions (they are currently private in `utils.js`, not exported).

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd packages/core && bun run test -- --run spec/color-space.spec.js`
Expected: All PASS

- [ ] **Step 5: Commit**

```
feat(core): add HslColorSpace + OklchColorSpace adapters
```

---

### Task 3: Refactor Theme Class to Use Adapter

**Files:**
- Modify: `packages/core/src/theme.ts`
- Modify: `packages/core/spec/theme.spec.js`

- [ ] **Step 1: Update theme.spec.js expected values**

The key changes in test expectations:

**`getPalette()`** — values are now wrapped:
```js
// Before: expect(paletteCustom['--color-accent']).toEqual('56,189,248')
// After:
expect(paletteCustom['--color-accent']).toEqual('rgb(56, 189, 248)')
```

**`getColorRules()`** — values use color-mix:
```js
// Before: 'rgba(var(--color-primary-500),<alpha-value>)'
// After:  'color-mix(in srgb, var(--color-primary-500) <alpha-value>%, transparent)'
```

**`themeRules()`** — values are wrapped:
```js
// Before: '--color-primary-500': '249,115,22'
// After:  '--color-primary-500': 'rgb(249, 115, 22)'
```

**oklch color space tests** — palette values are wrapped:
```js
// Before: expect(val.split(' ')).toHaveLength(3)
// After:
expect(val).toMatch(/^oklch\(/)
const inner = val.replace(/^oklch\(|\)$/g, '')
expect(inner.split(' ')).toHaveLength(3)
```

**`shadesOf` tests** — update to use new API (shadesOf is refactored to use adapter):
```js
// Replace shadesOf(name, 'rgb') with ColorSpace-based approach
// shadesOf(name, colorSpace) now produces color-mix wrapped values
```

Update ALL expected values in the `themeRules` test fixture (`paletteRules` object) — every bare channel value like `'251,146,60'` becomes `'rgb(251, 146, 60)'`. There are ~60 entries.

Update `semanticShortcuts` tests — these are unchanged (they map z-scale names to numeric shade names, no color values involved).

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/core && bun run test -- --run spec/theme.spec.js`
Expected: FAIL — values still bare channels

- [ ] **Step 3: Refactor Theme class**

In `packages/core/src/theme.ts`:

1. Replace `import { colorToRgb } from './utils'` with `import { ColorSpace } from './color-space'`
2. Delete `modifiers` object
3. Delete `COLOR_SPACE_WRAPPERS` object
4. Refactor `shadesOf` to accept a `ColorSpace` instance or space name:

```js
export function shadesOf(name, space = 'rgb') {
  const adapter = typeof space === 'string' ? ColorSpace.create(space) : space
  return shades.reduce(
    (result, shade) => ({
      ...result,
      [shade]: adapter.themeColor(`--color-${name}-${shade}`)
    }),
    { DEFAULT: adapter.themeColor(`--color-${name}-500`) }
  )
}
```

5. Refactor `generateColorRules` to use adapter:

```js
function generateColorRules(variant, colors, mapping, adapter) {
  return ['DEFAULT', ...shades].flatMap((shade) => [
    {
      key: shade === 'DEFAULT' ? `--color-${variant}` : `--color-${variant}-${shade}`,
      value: adapter.wrap(colors[mapping[variant]][`${shade}`])
    }
  ])
}
```

6. Refactor `themeRules` to create an adapter:

```js
export function themeRules(mapping = DEFAULT_THEME_MAPPING, colors = defaultColors, colorSpace) {
  mapping = { ...DEFAULT_THEME_MAPPING, ...mapping }
  colors = { ...defaultColors, ...colors }
  const adapter = ColorSpace.create(colorSpace)
  const variants = Object.keys(mapping)
  const rules = variants
    .flatMap((variant) => generateColorRules(variant, colors, mapping, adapter))
    .reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {})
  return rules
}
```

7. Refactor `Theme` class:

```js
constructor({ colors = defaultColors, mapping = DEFAULT_THEME_MAPPING, colorSpace = 'rgb' } = {}) {
  this.#colors = { ...defaultColors, ...colors }
  this.#mapping = resolveColors({ ...DEFAULT_THEME_MAPPING, ...mapping })
  this.#adapter = ColorSpace.create(colorSpace)
}

get colorSpace() { return this.#adapter.name }
set colorSpace(colorSpace) { this.#adapter = ColorSpace.create(colorSpace) }

mapVariant(color, variant) {
  return Object.keys(color).reduce(
    (acc, key) => ({
      ...acc,
      [key]: key === 'DEFAULT'
        ? this.#adapter.themeColor(`--color-${variant}`)
        : this.#adapter.themeColor(`--color-${variant}-${key}`)
    }),
    {}
  )
}

getPalette(mapping = null) {
  const useMapping = { ...this.#mapping, ...mapping }
  const useColors = { ...defaultColors, ...this.#colors }
  const variants = Object.keys(useMapping)
  const rules = variants
    .flatMap((variant) => generateColorRules(variant, useColors, useMapping, this.#adapter))
    .reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {})
  return rules
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd packages/core && bun run test -- --run spec/theme.spec.js`
Expected: All PASS

- [ ] **Step 5: Commit**

```
refactor(core): Theme class uses ColorSpace adapter instead of scattered helpers
```

---

### Task 4: Clean Up utils.js + Update Exports

**Files:**
- Modify: `packages/core/src/utils.js` — remove `hex2hsl`, `hexToComponents`, `colorToRgb`
- Modify: `packages/core/spec/utils.spec.js` — remove tests for deleted functions
- Modify: `packages/core/src/index.js` — add `ColorSpace` export
- Modify: `packages/core/spec/index.spec.js` — update expected exports
- Modify: `packages/themes/src/index.js` — remove `shadesOf` re-export (or keep if still useful)

- [ ] **Step 1: Remove deleted functions from utils.js**

Remove from `packages/core/src/utils.js`:
- `hex2hsl` function (moved to HslColorSpace.fromHex)
- `hexToComponents` function (replaced by adapter.wrap)
- `colorToRgb` function (replaced by adapter.wrap)

Keep:
- `hex2rgb` — still used by RgbColorSpace (imported in color-space.js) and possibly externally
- `hex2oklch` — still used by OklchColorSpace and externally
- `oklch2hex` — reverse conversion used by chart/swatch

- [ ] **Step 2: Remove corresponding tests from utils.spec.js**

Remove test blocks:
- `describe('hexToComponents', ...)`
- `describe('colorToRgb', ...)`
- `describe('colorToRgb with color space', ...)`
- `describe('hex2hsl', ...)`

Keep:
- `describe('hex2rgb', ...)`
- `describe('hex2oklch', ...)`

- [ ] **Step 3: Update index.js exports**

In `packages/core/src/index.js`, add:
```js
export { ColorSpace } from './color-space.js'
```

In `packages/core/spec/index.spec.js`, update the expected exports list:
- Remove: `'hexToComponents'`, `'colorToRgb'`, `'hex2hsl'`
- Add: `'ColorSpace'`

- [ ] **Step 4: Update themes/src/index.js**

Remove `shadesOf` from the re-export list if it's only used internally. Check if any consumer imports `shadesOf` from `@rokkit/themes` (none found in codebase search).

- [ ] **Step 5: Run full test suite**

Run: `cd packages/core && bun run test -- --run`
Expected: All PASS

- [ ] **Step 6: Commit**

```
refactor(core): remove deprecated color-space functions, export ColorSpace
```

---

### Task 5: Verify UnoCSS Alpha + Theme Build

**Files:**
- Verify: `packages/unocss/src/preset.ts` — confirm color-mix alpha works
- Verify: `packages/themes/build.mjs` — confirm build produces correct output
- Modify: `packages/themes/build.mjs` — remove redundant `text-on-*` hardcoded shortcuts if Theme already generates them

- [ ] **Step 1: Run theme build**

Run: `cd packages/themes && bun run build`
Expected: All 7 files built successfully

- [ ] **Step 2: Verify compiled CSS variable values are wrapped**

Check `dist/base.css` for wrapped values:
```bash
grep '\-\-color-primary-500:' dist/base.css
```
Expected: `--color-primary-500:rgb(249, 115, 22)` (not bare `249,115,22`)

- [ ] **Step 3: Verify compiled theme CSS still works**

Check that `@apply bg-primary-z5` in a theme file still produces valid CSS after compilation:
```bash
grep 'background-color' dist/rokkit.css | head -5
```
Expected: Valid `background-color` declarations using the color values

- [ ] **Step 4: Test alpha/opacity in compiled output**

Check that `@apply bg-surface-z10/40` in theme CSS produces correct output:
```bash
grep 'color-mix' dist/rokkit.css | head -3
```
Expected: `color-mix(in srgb, var(--color-surface-...` or inline color values from UnoCSS compilation.

If UnoCSS doesn't handle `<alpha-value>%` inside `color-mix`, add a custom rule in `packages/unocss/src/preset.ts` to handle opacity modifiers. The semantic shortcuts already resolve z-scale → numeric shades, so this rule would intercept `bg-{color}-{shade}/{opacity}` and emit color-mix CSS.

- [ ] **Step 5: Remove redundant text-on-* shortcuts from build.mjs**

In `packages/themes/build.mjs`, the hardcoded `text-on-primary`, `text-on-secondary`, etc. shortcuts (lines 53-59) duplicate what `Theme.getShortcuts()` already generates via `contrastShortcuts()`. Check if removing them causes any build output change. If Theme generates them, remove the hardcoded ones.

- [ ] **Step 6: Run full test suite**

Run: `bun run test:ci`
Expected: All 3321+ tests pass

- [ ] **Step 7: Run lint**

Run: `bun run lint`
Expected: 0 errors

- [ ] **Step 8: Commit**

```
feat(themes): verify theme build with wrapped color variables
```

---

### Task 6: Full Integration Verification

**Files:**
- No new files — verification only

- [ ] **Step 1: Build all packages**

Run: `bun run build` (if workspace-level build exists) or `cd packages/themes && bun run build`
Expected: Success

- [ ] **Step 2: Run complete test suite**

Run: `bun run test:ci`
Expected: All tests pass

- [ ] **Step 3: Run lint**

Run: `bun run lint`
Expected: 0 errors

- [ ] **Step 4: Spot-check the z-scale CSS**

The `Theme.getZScaleCSS()` output should be unchanged — it's pure var aliases:
```css
:root {
  --color-primary-z5: var(--color-primary-500);
}
```
Verify the actual palette variable `--color-primary-500` is now wrapped in the preflight/base output.

- [ ] **Step 5: Commit final state**

```
chore: verify colorspace adapter integration — all tests pass
```

---

## Dependency Graph

```
Task 1 (Rgb adapter) ──► Task 2 (Hsl + Oklch adapters)
                                    │
                                    ▼
                           Task 3 (Theme refactor)
                                    │
                                    ▼
                           Task 4 (Cleanup + exports)
                                    │
                                    ▼
                           Task 5 (Build verification)
                                    │
                                    ▼
                           Task 6 (Integration check)
```

All tasks are sequential — each builds on the previous.
