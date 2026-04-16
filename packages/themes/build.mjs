/**
 * @rokkit/themes — CSS Build Script
 *
 * Compiles theme CSS with UnoCSS, expanding @apply directives into real CSS
 * (including correct dark mode sibling rules).
 *
 * Outputs separate files per theme:
 *   dist/base.css    — structural styles + default CSS variable palette
 *   dist/rokkit.css  — rokkit theme (gradients, glowing borders)
 *   dist/minimal.css — minimal theme (clean, subtle)
 *   dist/material.css — material theme (elevation, shadows)
 *   dist/frosted.css   — frosted theme (blur, transparency)
 *
 * Post-processing: adds compound selector form so dark mode works when
 * data-mode and data-style are on the SAME element (e.g. body):
 *   Generated:  [data-mode="dark"] [data-style="rokkit"] [data-toggle]
 *   Added also: [data-mode="dark"][data-style="rokkit"] [data-toggle]
 */

import { createGenerator, presetWind3, transformerDirectives } from 'unocss'
import { Theme } from '@rokkit/core'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'
import MagicString from 'magic-string'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ─── UnoCSS config ────────────────────────────────────────────────────────────

const theme = new Theme()

const uno = await createGenerator({
  presets: [
    presetWind3({
      dark: {
        light: '[data-mode="light"]',
        dark: '[data-mode="dark"]'
      }
    })
  ],
  shortcuts: [
    ['skin-default', theme.getPalette()],
    ...theme.getShortcuts('surface'),
    ...theme.getShortcuts('primary'),
    ...theme.getShortcuts('secondary'),
    ...theme.getShortcuts('accent'),
    ...theme.getShortcuts('success'),
    ...theme.getShortcuts('warning'),
    ...theme.getShortcuts('danger'),
    ...theme.getShortcuts('error'),
    ...theme.getShortcuts('info'),
    [/^text-on-primary(\/\d+)?$/, ([, end]) => `text-surface-50${end || ''}`],
    [/^text-on-secondary(\/\d+)?$/, ([, end]) => `text-surface-50${end || ''}`],
    [/^text-on-info(\/\d+)?$/, ([, end]) => `text-surface-50${end || ''}`],
    [/^text-on-success(\/\d+)?$/, ([, end]) => `text-surface-50${end || ''}`],
    [/^text-on-warning(\/\d+)?$/, ([, end]) => `text-surface-50${end || ''}`],
    [/^text-on-error(\/\d+)?$/, ([, end]) => `text-surface-50${end || ''}`],
    [/^text-on-surface(\/\d+)?$/, ([, end]) => `text-surface-50${end || ''}`]
  ],
  theme: {
    colors: theme.getColorRules()
  }
})

// ─── CSS @import resolver ─────────────────────────────────────────────────────

/**
 * Recursively inlines local @import statements.
 * External imports (http, @, ~) are left unchanged.
 */
function resolveImports(filePath, seen = new Set()) {
  if (seen.has(filePath)) return ''
  seen.add(filePath)

  const content = readFileSync(filePath, 'utf-8')
  return content.replace(/@import\s+['"]([^'"]+)['"]\s*;/g, (match, importPath) => {
    if (importPath.startsWith('http') || importPath.startsWith('@') || importPath.startsWith('~')) {
      return match
    }
    const resolvedPath = resolve(dirname(filePath), importPath)
    return resolveImports(resolvedPath, seen)
  })
}

// ─── UnoCSS @apply processor ─────────────────────────────────────────────────

const transformer = transformerDirectives()

async function processCSS(content, filename) {
  const s = new MagicString(content)
  await transformer.transform(s, filename, {
    uno,
    tokens: new Set(),
    generate: async (tokens) => uno.generate(tokens, { preflights: false })
  })
  return s.toString()
}

// ─── Post-processing: fix dark mode selectors ─────────────────────────────────

/**
 * UnoCSS generates dark mode rules as descendant selectors:
 *   [data-mode="dark"] [data-style="rokkit"] [data-component]
 *
 * This doesn't match when both data-mode and data-style are on the SAME element
 * (e.g. <body data-mode="dark" data-style="rokkit">).
 *
 * For each such rule, we also add the compound selector form:
 *   [data-mode="dark"][data-style="rokkit"] [data-component]
 *
 * Both forms are emitted so either usage pattern works.
 */
function fixModeSelectors(css) {
  const modePattern = /\[data-mode="(?:dark|light)"\] \[data-style="[^"]+"\]/

  let result = ''
  let i = 0

  while (i < css.length) {
    const braceOpen = css.indexOf('{', i)
    if (braceOpen === -1) {
      result += css.slice(i)
      break
    }

    const selectorText = css.slice(i, braceOpen)

    if (modePattern.test(selectorText)) {
      const parts = splitTopLevelSelectors(selectorText)
      const expanded = []

      for (const part of parts) {
        const m = part.match(/^(\s*)(\[data-mode="(?:dark|light)"\]) (\[data-style="[^"]+"\])(.*)$/)
        if (m) {
          const [, ws, modeSelector, styleSelector, rest] = m
          // Compound form: [data-mode="X"][data-style="Y"]rest (same-element match)
          expanded.push(`${ws}${modeSelector}${styleSelector}${rest}`)
        }
        // Always include original :is() form
        expanded.push(part)
      }

      result += expanded.join(',') + '{'
    } else {
      result += selectorText + '{'
    }

    let depth = 1
    let j = braceOpen + 1
    while (j < css.length && depth > 0) {
      if (css[j] === '{') depth++
      else if (css[j] === '}') depth--
      j++
    }

    result += css.slice(braceOpen + 1, j)
    i = j
  }

  return result
}

/**
 * Split a selector list by top-level commas only (not inside parentheses).
 */
function splitTopLevelSelectors(text) {
  const parts = []
  let depth = 0
  let start = 0

  for (let i = 0; i < text.length; i++) {
    if (text[i] === '(') depth++
    else if (text[i] === ')') depth--
    else if (text[i] === ',' && depth === 0) {
      parts.push(text.slice(start, i))
      start = i + 1
    }
  }
  parts.push(text.slice(start))
  return parts
}

// ─── Build ────────────────────────────────────────────────────────────────────

const srcDir = join(__dirname, 'src')
const distDir = join(__dirname, 'dist')

async function buildFile(inputPath, outputName, label) {
  const fullCSS = resolveImports(inputPath)
  const compiled = await processCSS(fullCSS, outputName)
  const fixed = fixModeSelectors(compiled)
  writeFileSync(join(distDir, outputName), fixed, 'utf-8')
  console.log(`✓ dist/${outputName} (${label})`)
}

async function build() {
  mkdirSync(distDir, { recursive: true })

  // base.css: structural styles + palette CSS variable defaults
  const paletteCSS = readFileSync(join(srcDir, 'palette.css'), 'utf-8')
  const compiledPalette = await processCSS(paletteCSS, 'palette.css')
  const zScaleCSS = theme.getZScaleCSS()
  const baseCSS = resolveImports(join(srcDir, 'base', 'index.css'))
  const compiledBase = await processCSS(baseCSS, 'base.css')
  const baseFull = fixModeSelectors(compiledPalette + '\n' + zScaleCSS + '\n' + compiledBase)
  writeFileSync(join(distDir, 'base.css'), baseFull, 'utf-8')
  console.log('✓ dist/base.css (structural styles + palette defaults)')

  // Per-theme files
  for (const [name, label] of [
    ['rokkit', 'gradients + glowing borders'],
    ['minimal', 'clean + subtle'],
    ['material', 'elevation + shadows'],
    ['frosted', 'frosted glass + blur'],
    ['grada-ui', 'coral/purple gradient identity'],
    ['shadcn', 'flat borders + ring focus'],
    ['daisy-ui', 'rounded-full + bold fills'],
    ['bits-ui', 'rounded-lg + shadow-sm'],
    ['carbon', 'square + bottom-border inputs'],
    ['ant-design', 'thin borders + dense layout']
  ]) {
    await buildFile(join(srcDir, name, 'index.css'), `${name}.css`, label)
  }

  // Full bundle: base + all themes
  const allThemes = [
    'base',
    'rokkit',
    'minimal',
    'material',
    'frosted',
    'grada-ui',
    'shadcn',
    'daisy-ui',
    'bits-ui',
    'carbon',
    'ant-design'
  ]
  const bundleParts = allThemes.map((name) => readFileSync(join(distDir, `${name}.css`), 'utf-8'))
  writeFileSync(join(distDir, 'index.css'), bundleParts.join('\n'), 'utf-8')
  console.log('✓ dist/index.css (full bundle)')

  console.log('\n@rokkit/themes build complete.')
}

build().catch((err) => {
  console.error('Build failed:', err)
  process.exit(1)
})
