import { ColorSpace, NAMED_TOKENS } from '@rokkit/core'

const RESERVED_NAMES = new Set(NAMED_TOKENS)
export const PALETTE_REF_RE = /^[a-z][a-z0-9_-]*\.\d+$/i
const COLOR_VALUE_RE = /^(rgb|rgba|hsl|hsla|oklch|oklab|hwb|color)\(/
const HEX_RE = /^#[0-9a-fA-F]{3,8}$/

/**
 * Throws when any custom token name collides with a reserved NAMED_TOKEN.
 * Reserved names are overridden via the `skin` palette mapping, not via `custom`.
 *
 * @param {Record<string, unknown>} custom
 */
export function validateCustomTokenNames(custom) {
  for (const name of Object.keys(custom)) {
    if (RESERVED_NAMES.has(name)) {
      throw new Error(
        `Custom token name "${name}" is reserved. ` +
        `Override it via the skin palette mapping instead.`
      )
    }
  }
}

function isPaletteRef(value) {
  return typeof value === 'string' && PALETTE_REF_RE.test(value)
}

function resolvePaletteRef(ref, palettes, adapter) {
  const [paletteName, shade] = ref.split('.')
  const palette = palettes[paletteName]
  if (!palette) {
    throw new Error(`Custom token references unknown palette "${paletteName}" in "${ref}".`)
  }
  if (palette[shade] === undefined) {
    throw new Error(`Custom token references unknown shade "${shade}" of palette "${paletteName}" in "${ref}".`)
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
 * Resolves a `custom` config block into a `{ '--name': 'value' }` map for a
 * given mode. Palette refs (`'kami.50'`) go through the colorSpace adapter;
 * raw strings pass through verbatim; `{ light, dark }` selects the side for
 * the active mode and falls back to the other side if missing.
 *
 * @param {Record<string, string | { light?: string, dark?: string }>} custom
 * @param {Record<string, Record<string, string>>} palettes
 * @param {string} colorSpace
 * @param {'light' | 'dark'} mode
 */
export function resolveCustomTokens(custom, palettes, colorSpace, mode) {
  const adapter = ColorSpace.create(colorSpace)
  const result = {}
  for (const [name, value] of Object.entries(custom)) {
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
