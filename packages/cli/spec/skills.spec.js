import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { parseFrontmatter, listSkills } from '../src/skills.js'

describe('parseFrontmatter', () => {
	it('extracts name and description from a frontmatter block', () => {
		const md = '---\nname: foo\ndescription: Bar baz qux\n---\n# Foo\n'
		expect(parseFrontmatter(md)).toEqual({ name: 'foo', description: 'Bar baz qux' })
	})

	it('returns empty strings when frontmatter is missing', () => {
		expect(parseFrontmatter('# no frontmatter here')).toEqual({ name: '', description: '' })
	})
})

describe('listSkills (bundled catalog)', () => {
	it('includes both v1 skills, each with a non-empty description', () => {
		const skills = listSkills()
		const names = skills.map((s) => s.name)
		expect(names).toContain('semantic-styles-rokkit')
		expect(names).toContain('rokkit-components')
		expect(names).toContain('command-system-rokkit')
		expect(names).toContain('skin-system-rokkit')
		for (const s of skills) {
			expect(s.name).toBeTruthy()
			expect(s.description.length).toBeGreaterThan(0)
		}
	})

	it('is sorted by name', () => {
		const names = listSkills().map((s) => s.name)
		expect(names).toEqual([...names].sort())
	})
})

import { mkdtempSync, rmSync, existsSync as fsExists } from 'node:fs'
import { tmpdir } from 'node:os'
import { join as pjoin } from 'node:path'
import { installSkills } from '../src/skills.js'

describe('installSkills', () => {
	let cwd
	beforeEach(() => {
		cwd = mkdtempSync(pjoin(tmpdir(), 'rokkit-skills-'))
	})
	afterEach(() => {
		rmSync(cwd, { recursive: true, force: true })
	})

	it('copies a skill into .claude/skills/<name>/', () => {
		const res = installSkills(['semantic-styles-rokkit'], { cwd })
		expect(res).toEqual([{ name: 'semantic-styles-rokkit', status: 'added' }])
		expect(fsExists(pjoin(cwd, '.claude/skills/semantic-styles-rokkit/SKILL.md'))).toBe(true)
	})

	it('installs rokkit-components too', () => {
		expect(installSkills(['rokkit-components'], { cwd })[0].status).toBe('added')
		expect(fsExists(pjoin(cwd, '.claude/skills/rokkit-components/SKILL.md'))).toBe(true)
	})

	it('skips an existing skill unless force is set', () => {
		installSkills(['semantic-styles-rokkit'], { cwd })
		expect(installSkills(['semantic-styles-rokkit'], { cwd })[0].status).toBe('skipped')
		expect(installSkills(['semantic-styles-rokkit'], { cwd, force: true })[0].status).toBe('added')
	})

	it('reports unknown skills and writes nothing for them', () => {
		const res = installSkills(['does-not-exist'], { cwd })
		expect(res).toEqual([{ name: 'does-not-exist', status: 'unknown' }])
		expect(fsExists(pjoin(cwd, '.claude/skills/does-not-exist'))).toBe(false)
	})

	it('every catalog skill is installable by its listed name (frontmatter name === dir)', () => {
		for (const s of listSkills()) {
			expect(installSkills([s.name], { cwd, force: true })).toEqual([
				{ name: s.name, status: 'added' }
			])
		}
	})
})

import { runSkillsAdd } from '../src/skills.js'

describe('runSkillsAdd (no prompt when names or --all given)', () => {
	let cwd
	beforeEach(() => {
		cwd = mkdtempSync(pjoin(tmpdir(), 'rokkit-skills-'))
	})
	afterEach(() => {
		rmSync(cwd, { recursive: true, force: true })
	})

	it('installs explicitly-named skills without prompting', async () => {
		await runSkillsAdd(['rokkit-components'], { cwd })
		expect(fsExists(pjoin(cwd, '.claude/skills/rokkit-components/SKILL.md'))).toBe(true)
	})

	it('--all installs the entire catalog', async () => {
		await runSkillsAdd([], { cwd, all: true })
		expect(fsExists(pjoin(cwd, '.claude/skills/semantic-styles-rokkit/SKILL.md'))).toBe(true)
		expect(fsExists(pjoin(cwd, '.claude/skills/rokkit-components/SKILL.md'))).toBe(true)
	})
})
