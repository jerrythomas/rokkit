import { describe, it, expect } from 'vitest'
import { resolveTokens, isColorValue } from '../src/custom-tokens.js'

describe('resolveTokens', () => {
  const palettes = {
    kami: { 50: '#f8f8f3', 100: '#f0f0e8', 400: '#ddd5c4', 900: '#1a1a1a' },
    sumi: { 50: '#fafafa', 800: '#222222', 900: '#0d0d0d' }
  }

  it('resolves "palette.shade" refs via the colorSpace adapter', () => {
    const result = resolveTokens(
      { canvas: 'kami.50' },
      palettes,
      'rgb',
      'light'
    )
    expect(result['--canvas']).toBe('rgb(248, 248, 243)')
  })

  it('passes raw string values through verbatim', () => {
    const result = resolveTokens(
      { 'canvas-grid': '#d4d4d4', tau: 'oklch(0.5 0.1 30)' },
      palettes,
      'rgb',
      'light'
    )
    expect(result['--canvas-grid']).toBe('#d4d4d4')
    expect(result['--tau']).toBe('oklch(0.5 0.1 30)')
  })

  it('selects light value from { light, dark } in light mode', () => {
    const result = resolveTokens(
      { bleed: { light: 'kami.50', dark: 'sumi.900' } },
      palettes,
      'rgb',
      'light'
    )
    expect(result['--bleed']).toBe('rgb(248, 248, 243)')
  })

  it('selects dark value from { light, dark } in dark mode', () => {
    const result = resolveTokens(
      { bleed: { light: 'kami.50', dark: 'sumi.900' } },
      palettes,
      'rgb',
      'dark'
    )
    expect(result['--bleed']).toBe('rgb(13, 13, 13)')
  })

  it('falls back to the other side when only one side is provided', () => {
    const result = resolveTokens(
      { bleed: { light: 'kami.50' } },
      palettes,
      'rgb',
      'dark'
    )
    expect(result['--bleed']).toBe('rgb(248, 248, 243)')
  })

  it('returns empty object when overrides is empty', () => {
    expect(resolveTokens({}, palettes, 'rgb', 'light')).toEqual({})
  })

  it('throws when a palette ref points to unknown palette', () => {
    expect(() => resolveTokens(
      { canvas: 'unknown.50' },
      palettes,
      'rgb',
      'light'
    )).toThrow(/unknown/)
  })

  it('throws when a palette ref points to unknown shade', () => {
    expect(() => resolveTokens(
      { canvas: 'kami.999' },
      palettes,
      'rgb',
      'light'
    )).toThrow(/999/)
  })

  it('accepts reserved named-token names — caller decides via cascade order which value wins', () => {
    // The merged `overrides` field accepts any name. Reserved names like
    // `paper-edge` are emitted alongside non-reserved ones; the preset's
    // merge order is what makes the reserved-name entries override the
    // named-token defaults. The resolver itself is name-agnostic.
    const result = resolveTokens(
      { 'paper-edge': { light: 'kami.400', dark: 'sumi.800' } },
      palettes,
      'rgb',
      'dark'
    )
    expect(result['--paper-edge']).toBe('rgb(34, 34, 34)')
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
