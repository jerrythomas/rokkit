/* eslint-disable no-console */
import { readFileSync, readdirSync, existsSync, mkdirSync, cpSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import prompts from 'prompts'

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
	// Keep these as literal regexes — do NOT collapse into a dynamic
	// `new RegExp(`^${key}:...`)` helper: the keys are fixed, so the dynamic form
	// adds nothing but trips the no-dynamic-regex lint, and the literals are
	// plainly linear-time.
	//
	// The block is captured UNTRIMMED on purpose: the field regexes are anchored
	// with `^`, so indented frontmatter should miss, exactly as before.
	const block = capture(md, /^---\n([\s\S]*?)\n---/)
	return {
		name: capture(block, /^name:\s*(.+)$/m).trim(),
		description: capture(block, /^description:\s*(.+)$/m).trim()
	}
}

/**
 * First capture group of `re` in `text`, or `''` when there is no match — so a
 * missing block, a missing field and a bare `key:` all collapse to `''`.
 * @param {string} text
 * @param {RegExp} re
 * @returns {string}
 */
function capture(text, re) {
	return text.match(re)?.[1] ?? ''
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

/**
 * Copy named skills into <cwd>/.claude/skills/<name>/ (idempotent).
 * @param {string[]} names
 * @param {{ cwd?: string, force?: boolean, skillsDir?: string }} [opts]
 * @returns {Array<{ name: string, status: 'added' | 'skipped' | 'unknown' }>}
 */
export function installSkills(
	names,
	{ cwd = process.cwd(), force = false, skillsDir = DEFAULT_SKILLS_DIR } = {}
) {
	const targetRoot = resolve(cwd, '.claude', 'skills')
	return names.map((name) => {
		const src = join(skillsDir, name)
		if (!existsSync(join(src, 'SKILL.md'))) return { name, status: 'unknown' }
		const dest = join(targetRoot, name)
		if (existsSync(dest) && !force) return { name, status: 'skipped' }
		mkdirSync(targetRoot, { recursive: true })
		cpSync(src, dest, { recursive: true })
		return { name, status: 'added' }
	})
}

/**
 * Print the catalog, marking already-installed skills.
 * @param {{ skillsDir?: string, cwd?: string }} [opts]
 */
export function runSkillsList({ skillsDir, cwd = process.cwd() } = {}) {
	const catalog = listSkills({ skillsDir })
	if (catalog.length === 0) {
		console.info('No skills available.')
		return
	}
	const installedRoot = resolve(cwd, '.claude', 'skills')
	console.info('Available Rokkit skills:\n')
	for (const s of catalog) {
		const mark = existsSync(join(installedRoot, s.name, 'SKILL.md')) ? '✓ ' : '  '
		console.info(`${mark}${s.name}`)
		console.info(`     ${s.description}`)
	}
	console.info('\nInstall with: rokkit skills add <name> [...]   (or --all)')
}

/**
 * Resolve which skills to install, then copy and report.
 * @param {string[]} names
 * @param {{ all?: boolean, force?: boolean, skillsDir?: string, cwd?: string }} [opts]
 */
export async function runSkillsAdd(
	names,
	{ all = false, force = false, skillsDir, cwd = process.cwd() } = {}
) {
	const catalog = listSkills({ skillsDir })
	const selected = await resolveSkillSelection(names, catalog, all)
	if (selected.length === 0) {
		console.info('No skills selected.')
		return
	}
	const results = installSkills(selected, { cwd, force, skillsDir })
	results.forEach(reportSkillResult)
	if (results.some((r) => r.status === 'unknown')) {
		console.error(`\nValid skills: ${catalog.map((s) => s.name).join(', ')}`)
		process.exitCode = 1
	}
}

/**
 * Which skills to install: everything with `--all`, the named ones, or an
 * interactive pick when neither was given.
 * @param {string[]} names
 * @param {Array<{ name: string, description: string }>} catalog
 * @param {boolean} all
 * @returns {Promise<string[]>}
 */
async function resolveSkillSelection(names, catalog, all) {
	if (all) return catalog.map((s) => s.name)
	if (names.length > 0) return names
	const res = await prompts({
		type: 'multiselect',
		name: 'picked',
		message: 'Select skills to add',
		choices: catalog.map((s) => ({ title: s.name, value: s.name, description: s.description }))
	})
	return res.picked ?? []
}

/** Report one install outcome. Unknown names go to stderr — they're a user error. */
function reportSkillResult(r) {
	if (r.status === 'added') console.info(`  added .claude/skills/${r.name}`)
	else if (r.status === 'skipped')
		console.info(`  skipped ${r.name} (exists — use --force to overwrite)`)
	else console.error(`  unknown skill: ${r.name}`)
}

/**
 * CLI entry for `rokkit skills` subcommands.
 * @param {'list' | 'add'} sub
 * @param {{ _?: string[], all?: boolean, force?: boolean }} [opts]
 */
export async function skillsCommand(sub, opts = {}) {
	if (sub === 'add') {
		await runSkillsAdd(opts._ ?? [], { all: opts.all, force: opts.force })
	} else {
		await runSkillsList()
	}
}
