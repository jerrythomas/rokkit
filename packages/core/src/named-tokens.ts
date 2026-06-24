/**
 * The 24 canonical named tokens that constitute the "core" emit vocabulary.
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
  'error', 'error-soft',
  'info', 'info-soft',
  'focus-ring', 'shadow-tint'
] as const

export type NamedToken = (typeof NAMED_TOKENS)[number]

export type SkinRole =
  | 'surface' | 'ink' | 'primary' | 'accent'
  | 'success' | 'warning' | 'danger' | 'error' | 'info'

/**
 * Maps each named token to the palette shade index that backs it.
 * 'derived' indicates the token is computed (e.g., on-primary is the auto
 * on-color — near-black or near-white — picked by the primary fill's luminance).
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
 *   on-primary:   derived — auto on-color (near-black/white) for primary fill
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
  error: 500,
  'error-soft': 100,
  info: 500,
  'info-soft': 100,
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
  error: 'error',
  'error-soft': 'error',
  info: 'info',
  'info-soft': 'info',
  'focus-ring': 'accent',
  'shadow-tint': 'ink'
}

const SOFT_TOKENS: Set<string> = new Set(NAMED_TOKENS.filter((t) => t.endsWith('-soft')))

/**
 * Returns true when the role has a `-soft` companion in the named vocabulary.
 * Used to decide whether the role's tinted-background slot collapses to
 * `var(--{role}-soft)` or to `var(--{role})`.
 */
export function hasSoftCompanion(role: string): boolean {
  return SOFT_TOKENS.has(`${role}-soft`)
}

export function shadeForNamedToken(name: string): number | 'derived' | undefined {
  return NAMED_TOKEN_SHADE_MAP[name as NamedToken]
}

export function roleForNamedToken(name: string): SkinRole | undefined {
  return NAMED_TOKEN_ROLE_MAP[name as NamedToken]
}
