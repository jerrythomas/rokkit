/* eslint-disable no-console */
import { readFileSync, readdirSync, existsSync, mkdirSync, cpSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// The catalog ships inside the package: packages/cli/skills/ in dev/test,
// node_modules/@rokkit/cli/skills/ once installed. One relative path, both worlds.
// Guard against non-file: URLs (e.g. jsdom sets import.meta.url to http://localhost/...).
const DEFAULT_SKILLS_DIR = (() => {
	try {
		return fileURLToPath(new URL('../skills/', import.meta.url))
	} catch {
		return resolve(process.cwd(), 'packages/cli/skills')
	}
})()

/**
 * Parse `name` and `description` from a SKILL.md YAML frontmatter block.
 * @param {string} md
 * @returns {{ name: string, description: string }}
 */
export function parseFrontmatter(md) {
	const block = md.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? ''
	const name = block.match(/^name:\s*(.+)$/m)?.[1].trim() ?? ''
	const description = block.match(/^description:\s*(.+)$/m)?.[1].trim() ?? ''
	return { name, description }
}

/**
 * Read the bundled skill catalog (derived from each SKILL.md's frontmatter).
 * @param {{ skillsDir?: string }} [opts]
 * @returns {Array<{ name: string, description: string }>}
 */
export function listSkills({ skillsDir = DEFAULT_SKILLS_DIR } = {}) {
	if (!existsSync(skillsDir)) return []
	return readdirSync(skillsDir)
		.filter((entry) => existsSync(join(skillsDir, entry, 'SKILL.md')))
		.map((entry) => parseFrontmatter(readFileSync(join(skillsDir, entry, 'SKILL.md'), 'utf-8')))
		.filter((s) => s.name)
		.sort((a, b) => a.name.localeCompare(b.name))
}
