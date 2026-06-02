import { ColorSpace } from '@rokkit/core'

export const PALETTE_REF_RE = /^[a-z][a-z0-9_-]*\.\d+$/i
const COLOR_VALUE_RE = /^(rgb|rgba|hsl|hsla|oklch|oklab|hwb|color)\(/
const HEX_RE = /^#[0-9a-fA-F]{3,8}$/

function isPaletteRef(value) {
  return typeof value === 'string' && PALETTE_REF_RE.test(value)
}

function resolvePaletteRef(ref, palettes, adapter) {
  const [paletteName, shade] = ref.split('.')
  const palette = palettes[paletteName]
  if (!palette) {
    throw new Error(`Token references unknown palette "${paletteName}" in "${ref}".`)
  }
  if (palette[shade] === undefined) {
    throw new Error(`Token references unknown shade "${shade}" of palette "${paletteName}" in "${ref}".`)
  }
  return adapter.wrap(palette[shade])
}

function resolveSingleValue(value, palettes, adapter) {
  if (isPaletteRef(value)) return resolvePaletteRef(value, palettes, adapter)
  return value
}

function pickModeValue(value, mode) {
  if (mode === 'dark') return value.dark ?? value.light
  return value.light ?? value.dark
}

/**
 * Resolves an `overrides` config block into a `{ '--name': 'value' }` map for a
 * given mode. Reserved names (e.g. `paper-edge`) override the named-token
 * defaults via cascade order; non-reserved names emit as new custom tokens.
 *
 * Palette refs (`'kami.50'`) go through the colorSpace adapter; raw strings
 * pass through verbatim; `{ light, dark }` selects the side for the active
 * mode and falls back to the other side if missing.
 *
 * @param {Record<string, string | { light?: string, dark?: string }>} overrides
 * @param {Record<string, Record<string, string>>} palettes
 * @param {string} colorSpace
 * @param {'light' | 'dark'} mode
 */
export function resolveTokens(overrides, palettes, colorSpace, mode) {
  const adapter = ColorSpace.create(colorSpace)
  const result = {}
  for (const [name, value] of Object.entries(overrides)) {
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      const picked = pickModeValue(value, mode)
      if (picked === null || picked === undefined) continue
      result[`--${name}`] = resolveSingleValue(picked, palettes, adapter)
    } else {
      result[`--${name}`] = resolveSingleValue(value, palettes, adapter)
    }
  }
  return result
}

/**
 * Heuristic — does the resolved value look like a CSS color?
 * Used to decide whether to auto-emit bg-/text-/border- shortcuts.
 */
export function isColorValue(value) {
  if (typeof value !== 'string') return false
  return COLOR_VALUE_RE.test(value) || HEX_RE.test(value)
}
