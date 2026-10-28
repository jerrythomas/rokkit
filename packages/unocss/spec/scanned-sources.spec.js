import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { createGenerator } from 'unocss'
import { presetRokkit } from '../src/preset.js'

// An app's UnoCSS scans rokkit's shipped sources as they pass through its build (an app
// that scans .ts/.js for its own classes scans ours too). A class-shaped template literal
// in our source — `text-[${color}]` — then becomes a rule whose value is the literal text
// `${color}`, postcss rejects the stylesheet, and the app renders with no CSS at all
// (sensei on 1.11.0). Every shipped source must scan to CSS with no template text in it.
const PACKAGES = resolve(__dirname, '../..')
// What @unocss/vite drops before it extracts (its SKIP_COMMENT_RE, not exported): a block
// between `@unocss-skip-start` and `@unocss-skip-end` comments.
const SKIPPED = /(\/\/\s*?@unocss-skip-start|\/\*\s*?@unocss-skip-start\s*?\*\/|<!--\s*?@unocss-skip-start\s*?-->)[\s\S]*?(\/\/\s*?@unocss-skip-end|\/\*\s*?@unocss-skip-end\s*?\*\/|<!--\s*?@unocss-skip-end\s*?-->)/g
const SOURCE = /\.(svelte|[jt]sx?)$/

function sources(dir) {
	return readdirSync(dir).flatMap((name) => {
		const path = join(dir, name)
		if (statSync(path).isDirectory()) return name === 'node_modules' ? [] : sources(path)
		return SOURCE.test(name) && !/\.(spec|test)\./.test(name) ? [path] : []
	})
}

const files = readdirSync(PACKAGES)
	.map((pkg) => join(PACKAGES, pkg, 'src'))
	.filter((dir) => statSync(dir, { throwIfNoEntry: false })?.isDirectory())
	.flatMap(sources)

describe('rokkit sources scanned by an app', () => {
	it('finds the shipped sources', () => {
		expect(files.length).toBeGreaterThan(100)
	})

	it('scan to CSS with no template-literal text', async () => {
		const uno = await createGenerator({ presets: [presetRokkit()] })
		const offenders = []
		for (const file of files) {
			const { css } = await uno.generate(readFileSync(file, 'utf8').replace(SKIPPED, ''), { id: file, preflights: false })
			if (css.includes('${')) offenders.push(file.slice(PACKAGES.length + 1))
		}
		expect(offenders).toEqual([])
	}, 120_000)
})
