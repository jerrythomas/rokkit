#!/usr/bin/env node
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, basename } from 'node:path'

const PATTERN = /^\s*export\s+const\s+\w+\s*=\s*`([\s\S]*)`\s*;?\s*$/

export function convert(source) {
  const stripped = source.replace(/^\s*\/\*\*[\s\S]*?\*\/\s*/, '')
  const m = stripped.match(PATTERN)
  if (!m) throw new Error('no matching "export const NAME = `...`" pattern found')
  return m[1]
    .replace(/\\\\/g, '\\')
    .replace(/\\`/g, '`')
    .replace(/\\\$\{/g, '${')
}

async function main() {
  const args = process.argv.slice(2)
  if (args.length === 0) {
    console.error('usage: ts-doc-to-md.mjs <input.ts> [<input.ts> ...]')
    process.exit(1)
  }
  for (const inPath of args) {
    const source = await readFile(inPath, 'utf8')
    const md = convert(source)
    const outPath = inPath.replace(/\.ts$/, '.md')
    await mkdir(dirname(outPath), { recursive: true })
    await writeFile(outPath, md, 'utf8')
    console.log(`✓ ${inPath} → ${basename(outPath)}`)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => { console.error(e); process.exit(1) })
}
