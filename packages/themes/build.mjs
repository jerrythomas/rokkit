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
import { buildNamedShortcuts } from '@rokkit/unocss'
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs'
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
    // NOTE: the former `skin-default` shortcut was removed — palette.css no
    // longer `@apply`s it. The default skin's named-token vars now come from
    // the preset's `:root` preflight (see @rokkit/unocss buildPreflights).
    ...theme.getShortcuts('surface'),
    ...theme.getShortcuts('primary'),
    ...theme.getShortcuts('secondary'),
    ...theme.getShortcuts('accent'),
    ...theme.getShortcuts('success'),
    ...theme.getShortcuts('warning'),
    ...theme.getShortcuts('danger'),
    ...theme.getShortcuts('error'),
    ...theme.getShortcuts('info'),
    ...buildNamedShortcuts()
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

// ─── Regression guard: no @apply may survive into dist ────────────────────────

/**
 * Strip /* … *​/ block comments so the scan matches real CSS, not prose
 * (some files document the @apply pitfall in comments). Mirrors the
 * `stripComments` helper in spec/coverage.spec.js.
 */
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '')

/**
 * Fail the build if any real `@apply` directive survived into a dist file.
 *
 * A leftover `@apply` means a utility didn't resolve (e.g. a named-token
 * `/opacity` shortcut, which UnoCSS can't expand) and would ship raw to
 * consumers — triggering `[lightningcss minify] Unknown at rule: @apply`
 * and rendering nothing. This is the recurrence guard for issue #135.
 */
function assertNoApply(outputName) {
  const content = readFileSync(join(distDir, outputName), 'utf-8') // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal — outputName is derived from a hardcoded string array, not user input
  const lines = stripComments(content).split('\n')
  const offending = []
  lines.forEach((line, i) => {
    if (/@apply\b/.test(line)) offending.push(`  dist/${outputName}:${i + 1}  ${line.trim()}`)
  })
  if (offending.length > 0) {
    throw new Error(
      `Unresolved @apply leaked into dist/${outputName} (issue #135 recurrence).\n` +
        `These utilities did not resolve during build — rewrite them to raw CSS ` +
        `(e.g. color-mix for named-token /opacity):\n${offending.join('\n')}`
    )
  }
}

// ─── Build ────────────────────────────────────────────────────────────────────

const srcDir = join(__dirname, 'src')
const distDir = join(__dirname, 'dist')

/** Names of every dist file emitted by this build, scanned by the guard. */
const emitted = []

async function buildFile(inputPath, outputName, label) {
  const fullCSS = resolveImports(inputPath)
  const compiled = await processCSS(fullCSS, outputName)
  const fixed = fixModeSelectors(compiled)
  writeFileSync(join(distDir, outputName), fixed, 'utf-8') // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal — outputName is derived from a hardcoded string array, not user input
  emitted.push(outputName)
  console.log(`✓ dist/${outputName} (${label})`)
}

/**
 * Compile every per-component CSS file (e.g. src/frosted/button.css) into
 * dist/<style>/<component>.css, expanding @apply just like the bundled files.
 *
 * Consumers that import a single component path (e.g.
 * `@rokkit/themes/frosted/button.css`) get resolved CSS, not raw @apply — the
 * `./<style>/*` exports point here. index.css is skipped (it is only an
 * aggregator of @imports, already compiled into dist/<style>.css).
 */
async function buildComponentFiles(style) {
  mkdirSync(join(distDir, style), { recursive: true }) // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal — style is from a hardcoded string array, not user input
  const files = readdirSync(join(srcDir, style)) // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal — style is from a hardcoded string array, not user input
    .filter((f) => f.endsWith('.css') && f !== 'index.css')
    .sort()
  for (const file of files) {
    const outputName = `${style}/${file}`
    const compiled = await processCSS(readFileSync(join(srcDir, style, file), 'utf-8'), outputName) // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal — style/file enumerate a hardcoded src dir, not user input
    writeFileSync(join(distDir, outputName), fixModeSelectors(compiled), 'utf-8') // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal — derived from enumerated src files, not user input
    emitted.push(outputName)
  }
  console.log(`✓ dist/${style}/*.css (${files.length} components)`)
}

async function build() {
  mkdirSync(distDir, { recursive: true })

  // base.css: structural styles + palette CSS variable defaults
  const paletteCSS = readFileSync(join(srcDir, 'palette.css'), 'utf-8')
  const compiledPalette = await processCSS(paletteCSS, 'palette.css')
  const baseCSS = resolveImports(join(srcDir, 'base', 'index.css'))
  const compiledBase = await processCSS(baseCSS, 'base.css')
  const baseFull = fixModeSelectors(compiledPalette + '\n' + compiledBase)
  writeFileSync(join(distDir, 'base.css'), baseFull, 'utf-8')
  emitted.push('base.css')
  console.log('✓ dist/base.css (structural styles + palette defaults)')

  // Per-theme files
  for (const [name, label] of [
    ['rokkit', 'gradients + glowing borders'],
    ['minimal', 'clean + subtle'],
    ['material', 'elevation + shadows'],
    ['frosted', 'frosted glass + blur'],
    ['zen-sumi', 'ink on paper — no shadows, no gradients']
  ]) {
    await buildFile(join(srcDir, name, 'index.css'), `${name}.css`, label)
  }

  // Per-component files: dist/<style>/<component>.css (for `./<style>/*` exports)
  for (const style of ['base', 'rokkit', 'minimal', 'material', 'frosted', 'zen-sumi']) {
    await buildComponentFiles(style)
  }

  // Full bundle: base + all themes
  const allThemes = [
    'base',
    'rokkit',
    'minimal',
    'material',
    'frosted',
    'zen-sumi'
  ]
  // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal — name is from a hardcoded string array, not user input
  const bundleParts = allThemes.map((name) => readFileSync(join(distDir, `${name}.css`), 'utf-8'))
  writeFileSync(join(distDir, 'index.css'), bundleParts.join('\n'), 'utf-8')
  emitted.push('index.css')
  console.log('✓ dist/index.css (full bundle)')

  // Regression guard (#135): no unresolved @apply may ship in dist.
  for (const outputName of emitted) assertNoApply(outputName)

  console.log('\n@rokkit/themes build complete.')
}

build().catch((err) => {
  console.error('Build failed:', err)
  process.exit(1)
})
