import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import prompts from 'prompts'
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
		vi.spyOn(console, 'info').mockImplementation(() => {})
		vi.spyOn(console, 'error').mockImplementation(() => {})
		prompts._injected = null
		cwd = mkdtempSync(pjoin(tmpdir(), 'rokkit-skills-'))
	})
	afterEach(() => {
		prompts._injected = null
		vi.restoreAllMocks()
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

	it('prints "skipped" for already-installed skills', async () => {
		await runSkillsAdd(['rokkit-components'], { cwd })
		vi.clearAllMocks()
		vi.spyOn(console, 'info').mockImplementation(() => {})
		await runSkillsAdd(['rokkit-components'], { cwd })
		expect(console.info).toHaveBeenCalledWith(expect.stringContaining('skipped'))
	})

	it('prints error and sets exitCode for unknown skills', async () => {
		process.exitCode = undefined
		await runSkillsAdd(['does-not-exist'], { cwd })
		expect(console.error).toHaveBeenCalledWith(expect.stringContaining('unknown skill'))
		expect(process.exitCode).toBe(1)
		process.exitCode = undefined
	})

	it('prints "No skills selected" when prompt returns empty selection', async () => {
		// no names, not --all → prompts user; inject empty array for the multiselect answer
		prompts.inject([[]])
		await runSkillsAdd([], { cwd })
		expect(console.info).toHaveBeenCalledWith(expect.stringContaining('No skills selected'))
	})

	it('installs from interactive prompt selection', async () => {
		// Inject a multiselect result with one skill chosen
		prompts.inject([['rokkit-components']])
		await runSkillsAdd([], { cwd })
		expect(fsExists(pjoin(cwd, '.claude/skills/rokkit-components/SKILL.md'))).toBe(true)
	})
})

import { runSkillsList, skillsCommand } from '../src/skills.js'

describe('runSkillsList', () => {
	let cwd
	beforeEach(() => {
		vi.spyOn(console, 'info').mockImplementation(() => {})
		cwd = mkdtempSync(pjoin(tmpdir(), 'rokkit-skills-'))
	})
	afterEach(() => {
		vi.restoreAllMocks()
		rmSync(cwd, { recursive: true, force: true })
	})

	it('prints each available skill with a description', async () => {
		await runSkillsList({ cwd })
		const calls = console.info.mock.calls.map((c) => c[0])
		expect(calls.some((s) => s.includes('rokkit-components'))).toBe(true)
	})

	it('marks installed skills with a checkmark', async () => {
		// Install one skill first
		await runSkillsAdd(['rokkit-components'], { cwd })
		vi.clearAllMocks()
		vi.spyOn(console, 'info').mockImplementation(() => {})
		await runSkillsList({ cwd })
		const calls = console.info.mock.calls.map((c) => c[0])
		// The installed skill should be marked '✓ '
		expect(calls.some((s) => s.startsWith('✓ '))).toBe(true)
	})

	it('prints "No skills available" when skillsDir is empty', async () => {
		await runSkillsList({ skillsDir: cwd, cwd })
		expect(console.info).toHaveBeenCalledWith('No skills available.')
	})
})

describe('skillsCommand entry', () => {
	let cwd
	beforeEach(() => {
		vi.spyOn(console, 'info').mockImplementation(() => {})
		vi.spyOn(console, 'error').mockImplementation(() => {})
		cwd = mkdtempSync(pjoin(tmpdir(), 'rokkit-skills-'))
	})
	afterEach(() => {
		vi.restoreAllMocks()
		rmSync(cwd, { recursive: true, force: true })
	})

	it('routes "list" to runSkillsList', async () => {
		const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(cwd)
		await skillsCommand('list', {})
		cwdSpy.mockRestore()
		// Should have printed the catalog header/skills
		expect(console.info).toHaveBeenCalled()
	})

	it('routes "add" with --all to runSkillsAdd', async () => {
		const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(cwd)
		await skillsCommand('add', { _: [], all: true })
		cwdSpy.mockRestore()
		expect(fsExists(pjoin(cwd, '.claude/skills/rokkit-components/SKILL.md'))).toBe(true)
	})

	it('routes "add" with named skills to runSkillsAdd', async () => {
		const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(cwd)
		await skillsCommand('add', { _: ['rokkit-components'] })
		cwdSpy.mockRestore()
		expect(fsExists(pjoin(cwd, '.claude/skills/rokkit-components/SKILL.md'))).toBe(true)
	})
})
