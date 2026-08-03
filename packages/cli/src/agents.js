/* eslint-disable no-console */
import {
	readFileSync,
	readdirSync,
	existsSync,
	mkdirSync,
	writeFileSync,
	copyFileSync
} from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import prompts from 'prompts'
import { parseFrontmatter } from './skills.js'

// The catalog ships inside the package: packages/cli/agents/ in dev/test,
// node_modules/@rokkit/cli/agents/ once installed. Agents are single .md files
// (unlike skills, which are directories with a SKILL.md).
// Guard against non-file: URLs (e.g. jsdom sets import.meta.url to http://localhost/...).
const DEFAULT_AGENTS_DIR = (() => {
	try {
		return fileURLToPath(new URL('../agents/', import.meta.url))
	} catch {
		return resolve(process.cwd(), 'packages/cli/agents')
	}
})()

// Public base the CLI can pull agents from when the bundled copy is unavailable
// (`--remote`). Same corpus that the sensei.library.json manifest advertises.
const DEFAULT_AGENTS_URL = 'https://rokkit.sensei-hq.com/agents'

/**
 * Read the bundled agent catalog (derived from each <name>.md frontmatter).
 * @param {{ agentsDir?: string }} [opts]
 * @returns {Array<{ name: string, description: string }>}
 */
export function listAgents({ agentsDir = DEFAULT_AGENTS_DIR } = {}) {
	if (!existsSync(agentsDir)) return []
	return readdirSync(agentsDir)
		.filter((entry) => entry.endsWith('.md'))
		.map((entry) => parseFrontmatter(readFileSync(join(agentsDir, entry), 'utf-8')))
		.filter((a) => a.name)
		.sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Copy named agents into <cwd>/.claude/agents/<name>.md from the bundled catalog (idempotent).
 * @param {string[]} names
 * @param {{ cwd?: string, force?: boolean, agentsDir?: string }} [opts]
 * @returns {Array<{ name: string, status: 'added' | 'skipped' | 'unknown' }>}
 */
export function installAgents(
	names,
	{ cwd = process.cwd(), force = false, agentsDir = DEFAULT_AGENTS_DIR } = {}
) {
	const targetRoot = resolve(cwd, '.claude', 'agents')
	return names.map((name) => {
		const src = join(agentsDir, `${name}.md`)
		if (!existsSync(src)) return { name, status: 'unknown' }
		const dest = join(targetRoot, `${name}.md`)
		if (existsSync(dest) && !force) return { name, status: 'skipped' }
		mkdirSync(targetRoot, { recursive: true })
		copyFileSync(src, dest)
		return { name, status: 'added' }
	})
}

/**
 * Fetch named agents from the public site and write them into <cwd>/.claude/agents/<name>.md.
 * Lets the CLI pull from the site when the bundled catalog is absent (or on `--remote`).
 * @param {string[]} names
 * @param {{ cwd?: string, force?: boolean, baseUrl?: string, fetchImpl?: typeof fetch }} [opts]
 * @returns {Promise<Array<{ name: string, status: 'added' | 'skipped' | 'unknown' }>>}
 */
export async function fetchAgents(
	names,
	{ cwd = process.cwd(), force = false, baseUrl = DEFAULT_AGENTS_URL, fetchImpl = fetch } = {}
) {
	const targetRoot = resolve(cwd, '.claude', 'agents')
	const results = []
	for (const name of names) {
		const dest = join(targetRoot, `${name}.md`)
		if (existsSync(dest) && !force) {
			results.push({ name, status: 'skipped' })
			continue
		}
		const res = await fetchImpl(`${baseUrl}/${name}.md`)
		if (!res.ok) {
			results.push({ name, status: 'unknown' })
			continue
		}
		mkdirSync(targetRoot, { recursive: true })
		writeFileSync(dest, await res.text())
		results.push({ name, status: 'added' })
	}
	return results
}

/**
 * Print the catalog, marking already-installed agents.
 * @param {{ agentsDir?: string, cwd?: string }} [opts]
 */
export async function runAgentsList({ agentsDir, cwd = process.cwd() } = {}) {
	const catalog = listAgents({ agentsDir })
	if (catalog.length === 0) {
		console.info('No agents available.')
		return
	}
	const installedRoot = resolve(cwd, '.claude', 'agents')
	console.info('Available Rokkit agents:\n')
	for (const a of catalog) {
		const mark = existsSync(join(installedRoot, `${a.name}.md`)) ? '✓ ' : '  '
		console.info(`${mark}${a.name}`)
		console.info(`     ${a.description}`)
	}
	console.info('\nInstall with: rokkit agents add <name> [...]   (or --all)')
}

/**
 * Resolve which agents to install, then copy (or fetch with --remote) and report.
 * @param {string[]} names
 * @param {{ all?: boolean, force?: boolean, remote?: boolean, agentsDir?: string, cwd?: string, fetchImpl?: typeof fetch }} [opts]
 */
export async function runAgentsAdd(
	names,
	{ all = false, force = false, remote = false, agentsDir, cwd = process.cwd(), fetchImpl } = {}
) {
	const catalog = listAgents({ agentsDir })
	let selected = names
	if (all) {
		selected = catalog.map((a) => a.name)
	} else if (selected.length === 0) {
		const res = await prompts({
			type: 'multiselect',
			name: 'picked',
			message: 'Select agents to add',
			choices: catalog.map((a) => ({ title: a.name, value: a.name, description: a.description }))
		})
		selected = res.picked ?? []
	}
	if (selected.length === 0) {
		console.info('No agents selected.')
		return
	}
	const results = remote
		? await fetchAgents(selected, { cwd, force, fetchImpl })
		: installAgents(selected, { cwd, force, agentsDir })
	for (const r of results) {
		if (r.status === 'added') console.info(`  added .claude/agents/${r.name}.md`)
		else if (r.status === 'skipped')
			console.info(`  skipped ${r.name} (exists — use --force to overwrite)`)
		else console.error(`  unknown agent: ${r.name}`)
	}
	if (results.some((r) => r.status === 'unknown')) {
		if (!remote) console.error(`\nValid agents: ${catalog.map((a) => a.name).join(', ')}`)
		process.exitCode = 1
	}
}

/**
 * CLI entry for `rokkit agents` subcommands.
 * @param {'list' | 'add'} sub
 * @param {{ _?: string[], all?: boolean, force?: boolean, remote?: boolean }} [opts]
 */
export async function agentsCommand(sub, opts = {}) {
	if (sub === 'add') {
		await runAgentsAdd(opts._ ?? [], { all: opts.all, force: opts.force, remote: opts.remote })
	} else {
		await runAgentsList()
	}
}
