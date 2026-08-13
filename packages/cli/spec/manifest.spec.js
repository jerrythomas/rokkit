import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { listSkills } from '../src/skills.js'
import { listAgents } from '../src/agents.js'
import { parseFrontmatter } from '../src/skills.js'

// Vitest runs from the repo root; the jsdom environment sets import.meta.url to a
// non-file: URL, so resolve the manifest against cwd rather than the module URL.
const REPO_ROOT = process.cwd()
const manifest = JSON.parse(readFileSync(join(REPO_ROOT, 'sensei.library.json'), 'utf-8'))

const rootPath = (p) => join(REPO_ROOT, p)

describe('sensei.library.json — top level', () => {
	it('declares library, version range, repo, branch and site', () => {
		expect(manifest.library).toBe('rokkit')
		expect(manifest.version).toMatch(/^[<>=~^]/)
		expect(manifest.repo).toMatch(/^https:\/\/github\.com\//)
		expect(manifest.branch).toBeTruthy()
		expect(manifest.site).toMatch(/^https:\/\//)
	})
})

describe('sensei.library.json — skills', () => {
	it('lists exactly the bundled skill catalog', () => {
		const declared = manifest.skills.map((s) => s.name).sort()
		const bundled = listSkills()
			.map((s) => s.name)
			.sort()
		expect(declared).toEqual(bundled)
	})

	it('every skill has a focus, an existing git-relative path, and a site-relative url', () => {
		for (const s of manifest.skills) {
			expect(s.focus, `${s.name} focus`).toBeTruthy()
			expect(s.path, `${s.name} path`).toBe(`packages/cli/skills/${s.name}/SKILL.md`)
			expect(existsSync(rootPath(s.path)), `${s.path} exists`).toBe(true)
			expect(s.url).toBe(`/skills/${s.name}/SKILL.md`)
		}
	})
})

describe('sensei.library.json — agents', () => {
	it('lists exactly the bundled agent catalog', () => {
		const declared = manifest.agents.map((a) => a.name).sort()
		const bundled = listAgents()
			.map((a) => a.name)
			.sort()
		expect(declared).toEqual(bundled)
	})

	it('every agent path exists, matches its frontmatter name, and has a site-relative url', () => {
		for (const a of manifest.agents) {
			expect(a.focus, `${a.name} focus`).toBeTruthy()
			expect(a.path, `${a.name} path`).toBe(`packages/cli/agents/${a.name}.md`)
			expect(existsSync(rootPath(a.path)), `${a.path} exists`).toBe(true)
			const { name } = parseFrontmatter(readFileSync(rootPath(a.path), 'utf-8'))
			expect(name, `${a.path} frontmatter name`).toBe(a.name)
			expect(a.url).toBe(`/agents/${a.name}.md`)
		}
	})
})

describe('sensei.library.json — llms', () => {
	it('points at the tracked corpus and an existing index', () => {
		expect(manifest.llms.path).toBe('docs/llms')
		expect(existsSync(rootPath(manifest.llms.path))).toBe(true)
		expect(manifest.llms.url).toBe('/llms')
		expect(manifest.llms.index).toBe('/llms/index.txt')
		// index resolves under the tracked corpus
		expect(existsSync(rootPath(join(manifest.llms.path, 'index.txt')))).toBe(true)
	})
})
