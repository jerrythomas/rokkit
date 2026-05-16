/**
 * The 20 canonical named tokens that constitute the "core" emit vocabulary.
 * Order is significant for tests and for predictable CSS-var output ordering.
 */
export const NAMED_TOKENS = [
  'paper', 'paper-soft', 'paper-mute', 'paper-edge',
  'ink', 'ink-mute', 'ink-soft', 'ink-faint',
  'primary', 'on-primary',
  'accent', 'accent-soft',
  'success', 'success-soft',
  'warning', 'warning-soft',
  'danger', 'danger-soft',
  'focus-ring', 'shadow-tint'
] as const

export type NamedToken = (typeof NAMED_TOKENS)[number]

export type SkinRole = 'surface' | 'ink' | 'primary' | 'accent' | 'success' | 'warning' | 'danger'

export type ZSlot = 'z0' | 'z1' | 'z2' | 'z3' | 'z4' | 'z5' | 'z6' | 'z7' | 'z8' | 'z9' | 'z10'

/**
 * Maps each named token to the palette shade index that backs it.
 * 'derived' indicates the token is computed from another palette (e.g., on-primary
 * picks the paper shade of the surface palette by default for white-on-primary).
 *
 *   paper:        50  (lightest surface tone, canvas)
 *   paper-soft:   100 (card background)
 *   paper-mute:   200 (subdued panel)
 *   paper-edge:   400 (hairline border tone)
 *   ink:          900 (primary text)
 *   ink-mute:     700 (secondary text)
 *   ink-soft:     500 (placeholder)
 *   ink-faint:    300 (disabled)
 *   primary:      500 (CTA fill)
 *   on-primary:   derived — surface.50 default (white-on-primary)
 *   accent / status: 500 (solid)
 *   *-soft:       100 (tinted-bg companion)
 *   focus-ring:   500 of accent
 *   shadow-tint:  900 of ink
 */
export const NAMED_TOKEN_SHADE_MAP: Record<NamedToken, number | 'derived'> = {
  paper: 50,
  'paper-soft': 100,
  'paper-mute': 200,
  'paper-edge': 400,
  ink: 900,
  'ink-mute': 700,
  'ink-soft': 500,
  'ink-faint': 300,
  primary: 500,
  'on-primary': 'derived',
  accent: 500,
  'accent-soft': 100,
  success: 500,
  'success-soft': 100,
  warning: 500,
  'warning-soft': 100,
  danger: 500,
  'danger-soft': 100,
  'focus-ring': 500,
  'shadow-tint': 900
}

/**
 * Maps each named token to the skin role whose palette it draws from.
 */
export const NAMED_TOKEN_ROLE_MAP: Record<NamedToken, SkinRole> = {
  paper: 'surface',
  'paper-soft': 'surface',
  'paper-mute': 'surface',
  'paper-edge': 'surface',
  ink: 'ink',
  'ink-mute': 'ink',
  'ink-soft': 'ink',
  'ink-faint': 'ink',
  primary: 'primary',
  'on-primary': 'primary',
  accent: 'accent',
  'accent-soft': 'accent',
  success: 'success',
  'success-soft': 'success',
  warning: 'warning',
  'warning-soft': 'warning',
  danger: 'danger',
  'danger-soft': 'danger',
  'focus-ring': 'accent',
  'shadow-tint': 'ink'
}

/**
 * Surface z-slot → named slot. Used to emit back-compat aliases like
 * `--color-surface-z1: var(--paper-soft);` in core mode.
 *
 * z2/z3 collapse to paper-mute, z5/z6 to ink-soft, z7/z8 to ink-mute,
 * z9/z10 to ink. This collapse is the contract: 4 surface tones in core mode.
 */
export const Z_COLLAPSE_MAP_SURFACE: Record<ZSlot, NamedToken> = {
  z0: 'paper',
  z1: 'paper-soft',
  z2: 'paper-mute',
  z3: 'paper-mute',
  z4: 'paper-edge',
  z5: 'ink-soft',
  z6: 'ink-soft',
  z7: 'ink-mute',
  z8: 'ink-mute',
  z9: 'ink',
  z10: 'ink'
}

/**
 * Ink role uses the inverted z-scale (z0 = darkest = primary text).
 * In core mode, the same 4+4 named ladder is reused; this table just inverts.
 */
export const Z_COLLAPSE_MAP_INK: Record<ZSlot, NamedToken> = {
  z0: 'ink',
  z1: 'ink-mute',
  z2: 'ink-mute',
  z3: 'ink-soft',
  z4: 'ink-soft',
  z5: 'paper-edge',
  z6: 'paper-edge',
  z7: 'paper-mute',
  z8: 'paper-mute',
  z9: 'paper-soft',
  z10: 'paper'
}

export function shadeForNamedToken(name: string): number | 'derived' | undefined {
  return NAMED_TOKEN_SHADE_MAP[name as NamedToken]
}

export function roleForNamedToken(name: string): SkinRole | undefined {
  return NAMED_TOKEN_ROLE_MAP[name as NamedToken]
}
