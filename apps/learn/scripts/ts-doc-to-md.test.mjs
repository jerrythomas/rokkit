import { test } from 'node:test'
import assert from 'node:assert/strict'
import { convert } from './ts-doc-to-md.mjs'

test('strips export const scaffolding', () => {
  const input = "export const buttonDocs = `# Button\n\nA button.`"
  assert.equal(convert(input), '# Button\n\nA button.')
})

test('unescapes backticks', () => {
  const input = "export const xDocs = `Use \\`code\\` inline.`"
  assert.equal(convert(input), 'Use `code` inline.')
})

test("unescapes template interpolation sequences", () => {
  const input = "export const xDocs = `Var: \\${name}`"
  assert.equal(convert(input), 'Var: ${name}')
})

test('handles trailing newline before closing backtick', () => {
  const input = "export const xDocs = `# H1\n\nbody\n`\n"
  assert.equal(convert(input), '# H1\n\nbody\n')
})

test('throws on file without the expected pattern', () => {
  assert.throws(() => convert('const x = 1'), /no matching/i)
})

test('strips leading JSDoc preamble before the export', () => {
  const input = [
    '/**',
    ' * docstring line 1',
    ' * docstring line 2 with `code`',
    ' */',
    'export const xDocs = `# Body`'
  ].join('\n')
  assert.equal(convert(input), '# Body')
})

test('unescapes literal backslash matching TS template-literal runtime', () => {
  // Source bytes: \\\` (3 backslashes + backtick)
  // TS lexer: \\ → \, then \` → `, runtime = "\`" (2 chars)
  const input = "export const xDocs = `\\\\\\`x`"
  assert.equal(convert(input), '\\`x')
})

test('handles double-escaped backslash before backtick', () => {
  // Source bytes: \\\\\\` (5 backslashes + backtick)
  // TS lexer: \\ → \, \\ → \, \` → `, runtime = "\\`" (3 chars)
  const input = "export const xDocs = `\\\\\\\\\\\\`x`"
  assert.equal(convert(input), '\\\\`x')
})
