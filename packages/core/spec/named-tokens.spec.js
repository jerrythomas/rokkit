import { describe, it, expect } from 'vitest'
import {
  NAMED_TOKENS,
  NAMED_TOKEN_SHADE_MAP,
  NAMED_TOKEN_ROLE_MAP,
  Z_COLLAPSE_MAP_SURFACE,
  Z_COLLAPSE_MAP_INK,
  shadeForNamedToken,
  roleForNamedToken
} from '../src/named-tokens.ts'

describe('NAMED_TOKENS', () => {
  it('exports exactly 24 canonical names', () => {
    expect(NAMED_TOKENS).toHaveLength(24)
  })

  it('includes all surface tokens', () => {
    expect(NAMED_TOKENS).toEqual(expect.arrayContaining([
      'paper', 'paper-soft', 'paper-mute', 'paper-edge'
    ]))
  })

  it('includes all ink tokens', () => {
    expect(NAMED_TOKENS).toEqual(expect.arrayContaining([
      'ink', 'ink-mute', 'ink-soft', 'ink-faint'
    ]))
  })

  it('includes primary, on-primary, accent, accent-soft', () => {
    expect(NAMED_TOKENS).toEqual(expect.arrayContaining([
      'primary', 'on-primary', 'accent', 'accent-soft'
    ]))
  })

  it('includes status tokens with soft companions', () => {
    expect(NAMED_TOKENS).toEqual(expect.arrayContaining([
      'success', 'success-soft', 'warning', 'warning-soft', 'danger', 'danger-soft',
      'error', 'error-soft', 'info', 'info-soft'
    ]))
  })

  it('includes focus-ring and shadow-tint', () => {
    expect(NAMED_TOKENS).toEqual(expect.arrayContaining(['focus-ring', 'shadow-tint']))
  })
})

describe('NAMED_TOKEN_SHADE_MAP', () => {
  it('maps paper ladder to shades 50/100/200/400', () => {
    expect(NAMED_TOKEN_SHADE_MAP['paper']).toBe(50)
    expect(NAMED_TOKEN_SHADE_MAP['paper-soft']).toBe(100)
    expect(NAMED_TOKEN_SHADE_MAP['paper-mute']).toBe(200)
    expect(NAMED_TOKEN_SHADE_MAP['paper-edge']).toBe(400)
  })

  it('maps ink ladder to shades 900/700/500/300', () => {
    expect(NAMED_TOKEN_SHADE_MAP['ink']).toBe(900)
    expect(NAMED_TOKEN_SHADE_MAP['ink-mute']).toBe(700)
    expect(NAMED_TOKEN_SHADE_MAP['ink-soft']).toBe(500)
    expect(NAMED_TOKEN_SHADE_MAP['ink-faint']).toBe(300)
  })

  it('maps primary/accent/status to shade 500', () => {
    expect(NAMED_TOKEN_SHADE_MAP['primary']).toBe(500)
    expect(NAMED_TOKEN_SHADE_MAP['accent']).toBe(500)
    expect(NAMED_TOKEN_SHADE_MAP['success']).toBe(500)
    expect(NAMED_TOKEN_SHADE_MAP['warning']).toBe(500)
    expect(NAMED_TOKEN_SHADE_MAP['danger']).toBe(500)
    expect(NAMED_TOKEN_SHADE_MAP['error']).toBe(500)
    expect(NAMED_TOKEN_SHADE_MAP['info']).toBe(500)
  })

  it('maps soft companions to shade 100', () => {
    expect(NAMED_TOKEN_SHADE_MAP['accent-soft']).toBe(100)
    expect(NAMED_TOKEN_SHADE_MAP['success-soft']).toBe(100)
    expect(NAMED_TOKEN_SHADE_MAP['warning-soft']).toBe(100)
    expect(NAMED_TOKEN_SHADE_MAP['danger-soft']).toBe(100)
    expect(NAMED_TOKEN_SHADE_MAP['error-soft']).toBe(100)
    expect(NAMED_TOKEN_SHADE_MAP['info-soft']).toBe(100)
  })

  it('on-primary uses "derived" sentinel', () => {
    expect(NAMED_TOKEN_SHADE_MAP['on-primary']).toBe('derived')
  })
})

describe('NAMED_TOKEN_ROLE_MAP', () => {
  it('routes paper-* through surface role', () => {
    expect(NAMED_TOKEN_ROLE_MAP['paper']).toBe('surface')
    expect(NAMED_TOKEN_ROLE_MAP['paper-edge']).toBe('surface')
  })

  it('routes ink-* through ink role', () => {
    expect(NAMED_TOKEN_ROLE_MAP['ink']).toBe('ink')
    expect(NAMED_TOKEN_ROLE_MAP['ink-faint']).toBe('ink')
  })

  it('routes primary and on-primary through primary role', () => {
    expect(NAMED_TOKEN_ROLE_MAP['primary']).toBe('primary')
    expect(NAMED_TOKEN_ROLE_MAP['on-primary']).toBe('primary')
  })

  it('routes accent and accent-soft through accent role', () => {
    expect(NAMED_TOKEN_ROLE_MAP['accent']).toBe('accent')
    expect(NAMED_TOKEN_ROLE_MAP['accent-soft']).toBe('accent')
  })

  it('routes status tokens through their roles', () => {
    expect(NAMED_TOKEN_ROLE_MAP['success']).toBe('success')
    expect(NAMED_TOKEN_ROLE_MAP['success-soft']).toBe('success')
    expect(NAMED_TOKEN_ROLE_MAP['warning']).toBe('warning')
    expect(NAMED_TOKEN_ROLE_MAP['danger']).toBe('danger')
    expect(NAMED_TOKEN_ROLE_MAP['error']).toBe('error')
    expect(NAMED_TOKEN_ROLE_MAP['error-soft']).toBe('error')
    expect(NAMED_TOKEN_ROLE_MAP['info']).toBe('info')
    expect(NAMED_TOKEN_ROLE_MAP['info-soft']).toBe('info')
  })

  it('routes focus-ring through accent and shadow-tint through ink', () => {
    expect(NAMED_TOKEN_ROLE_MAP['focus-ring']).toBe('accent')
    expect(NAMED_TOKEN_ROLE_MAP['shadow-tint']).toBe('ink')
  })
})

describe('Z_COLLAPSE_MAP_SURFACE (z-slot → named slot)', () => {
  it('collapses z2/z3 to paper-mute', () => {
    expect(Z_COLLAPSE_MAP_SURFACE['z2']).toBe('paper-mute')
    expect(Z_COLLAPSE_MAP_SURFACE['z3']).toBe('paper-mute')
  })

  it('collapses z9/z10 to ink', () => {
    expect(Z_COLLAPSE_MAP_SURFACE['z9']).toBe('ink')
    expect(Z_COLLAPSE_MAP_SURFACE['z10']).toBe('ink')
  })

  it('maps z0..z4 to paper ladder', () => {
    expect(Z_COLLAPSE_MAP_SURFACE['z0']).toBe('paper')
    expect(Z_COLLAPSE_MAP_SURFACE['z1']).toBe('paper-soft')
    expect(Z_COLLAPSE_MAP_SURFACE['z4']).toBe('paper-edge')
  })
})

describe('Z_COLLAPSE_MAP_INK (inverted)', () => {
  it('maps z0 to ink (inverted)', () => {
    expect(Z_COLLAPSE_MAP_INK['z0']).toBe('ink')
  })

  it('maps z10 to paper (inverted)', () => {
    expect(Z_COLLAPSE_MAP_INK['z10']).toBe('paper')
  })

  it('maps z5/z6 to paper-edge in the inverted middle ladder', () => {
    expect(Z_COLLAPSE_MAP_INK['z5']).toBe('paper-edge')
    expect(Z_COLLAPSE_MAP_INK['z6']).toBe('paper-edge')
  })

  it('maps z1/z2 to ink-mute and z3/z4 to ink-soft', () => {
    expect(Z_COLLAPSE_MAP_INK['z1']).toBe('ink-mute')
    expect(Z_COLLAPSE_MAP_INK['z2']).toBe('ink-mute')
    expect(Z_COLLAPSE_MAP_INK['z3']).toBe('ink-soft')
    expect(Z_COLLAPSE_MAP_INK['z4']).toBe('ink-soft')
  })
})

describe('helpers', () => {
  it('shadeForNamedToken returns the shade index', () => {
    expect(shadeForNamedToken('paper-mute')).toBe(200)
  })

  it('shadeForNamedToken returns undefined for unknown names', () => {
    expect(shadeForNamedToken('not-a-token')).toBeUndefined()
  })

  it('roleForNamedToken returns the role', () => {
    expect(roleForNamedToken('ink-mute')).toBe('ink')
  })

  it('roleForNamedToken returns undefined for unknown names', () => {
    expect(roleForNamedToken('not-a-token')).toBeUndefined()
  })
})
