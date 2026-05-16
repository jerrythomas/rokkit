import { describe, it, expect } from 'vitest'
import { resolveCustomTokens, validateCustomTokenNames, isColorValue } from '../src/custom-tokens.js'

describe('resolveCustomTokens', () => {
  const palettes = {
    kami: { 50: '#f8f8f3', 100: '#f0f0e8', 900: '#1a1a1a' },
    sumi: { 50: '#fafafa', 900: '#0d0d0d' }
  }

  it('resolves "palette.shade" refs via the colorSpace adapter', () => {
    const result = resolveCustomTokens(
      { canvas: 'kami.50' },
      palettes,
      'rgb',
      'light'
    )
    // kami.50 = #f8f8f3 → rgb(248, 248, 243)
    expect(result['--canvas']).toBe('rgb(248, 248, 243)')
  })

  it('passes raw string values through verbatim', () => {
    const result = resolveCustomTokens(
      { 'canvas-grid': '#d4d4d4', tau: 'oklch(0.5 0.1 30)' },
      palettes,
      'rgb',
      'light'
    )
    expect(result['--canvas-grid']).toBe('#d4d4d4')
    expect(result['--tau']).toBe('oklch(0.5 0.1 30)')
  })

  it('selects light value from { light, dark } in light mode', () => {
    const result = resolveCustomTokens(
      { bleed: { light: 'kami.50', dark: 'sumi.900' } },
      palettes,
      'rgb',
      'light'
    )
    expect(result['--bleed']).toBe('rgb(248, 248, 243)') // kami.50
  })

  it('selects dark value from { light, dark } in dark mode', () => {
    const result = resolveCustomTokens(
      { bleed: { light: 'kami.50', dark: 'sumi.900' } },
      palettes,
      'rgb',
      'dark'
    )
    expect(result['--bleed']).toBe('rgb(13, 13, 13)') // sumi.900
  })

  it('falls back to the other side when only one side is provided', () => {
    const result = resolveCustomTokens(
      { bleed: { light: 'kami.50' } },
      palettes,
      'rgb',
      'dark'
    )
    expect(result['--bleed']).toBe('rgb(248, 248, 243)')
  })

  it('returns empty object when custom is empty', () => {
    expect(resolveCustomTokens({}, palettes, 'rgb', 'light')).toEqual({})
  })

  it('throws when a palette ref points to unknown palette', () => {
    expect(() => resolveCustomTokens(
      { canvas: 'unknown.50' },
      palettes,
      'rgb',
      'light'
    )).toThrow(/unknown/)
  })

  it('throws when a palette ref points to unknown shade', () => {
    expect(() => resolveCustomTokens(
      { canvas: 'kami.999' },
      palettes,
      'rgb',
      'light'
    )).toThrow(/999/)
  })
})

describe('validateCustomTokenNames', () => {
  it('throws when a custom token name collides with a NAMED_TOKEN', () => {
    expect(() => validateCustomTokenNames({ paper: 'kami.50' })).toThrow(/reserved/i)
    expect(() => validateCustomTokenNames({ 'ink-mute': 'kami.700' })).toThrow(/reserved/i)
    expect(() => validateCustomTokenNames({ 'on-primary': '#fff' })).toThrow(/reserved/i)
    expect(() => validateCustomTokenNames({ 'focus-ring': '#fff' })).toThrow(/reserved/i)
  })

  it('allows non-reserved names', () => {
    expect(() => validateCustomTokenNames({
      canvas: 'kami.50',
      'canvas-grid': '#d4d4d4',
      'tauri-traffic': 'oklch(0.72 0.14 28)'
    })).not.toThrow()
  })

  it('passes silently for empty custom object', () => {
    expect(() => validateCustomTokenNames({})).not.toThrow()
  })
})

describe('isColorValue', () => {
  it('returns true for rgb/hsl/oklch/hex values', () => {
    expect(isColorValue('rgb(0, 0, 0)')).toBe(true)
    expect(isColorValue('hsl(0 0% 0%)')).toBe(true)
    expect(isColorValue('oklch(0.5 0.1 30)')).toBe(true)
    expect(isColorValue('#aabbcc')).toBe(true)
    expect(isColorValue('#fff')).toBe(true)
    expect(isColorValue('rgba(0, 0, 0, 0.5)')).toBe(true)
  })

  it('returns false for non-color strings', () => {
    expect(isColorValue('8px')).toBe(false)
    expect(isColorValue('1.2s ease')).toBe(false)
    expect(isColorValue('var(--foo)')).toBe(false)
  })

  it('returns false for non-strings', () => {
    expect(isColorValue(null)).toBe(false)
    expect(isColorValue(undefined)).toBe(false)
    expect(isColorValue(42)).toBe(false)
  })
})
