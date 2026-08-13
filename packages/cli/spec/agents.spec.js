import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import prompts from 'prompts'
import { mkdtempSync, rmSync, existsSync as fsExists, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join as pjoin } from 'node:path'
import {
	listAgents,
	installAgents,
	fetchAgents,
	runAgentsAdd,
	runAgentsList,
	agentsCommand
} from '../src/agents.js'

describe('listAgents (bundled catalog)', () => {
	it('includes both review agents, each with a non-empty description', () => {
		const names = listAgents().map((a) => a.name)
		expect(names).toContain('rokkit-styles-reviewer')
		expect(names).toContain('rokkit-components-reviewer')
		for (const a of listAgents()) {
			expect(a.name).toBeTruthy()
			expect(a.description.length).toBeGreaterThan(0)
		}
	})

	it('is sorted by name', () => {
		const names = listAgents().map((a) => a.name)
		expect(names).toEqual([...names].sort())
	})
})

describe('installAgents', () => {
	let cwd
	beforeEach(() => {
		cwd = mkdtempSync(pjoin(tmpdir(), 'rokkit-agents-'))
	})
	afterEach(() => {
		rmSync(cwd, { recursive: true, force: true })
	})

	it('copies an agent into .claude/agents/<name>.md', () => {
		const res = installAgents(['rokkit-styles-reviewer'], { cwd })
		expect(res).toEqual([{ name: 'rokkit-styles-reviewer', status: 'added' }])
		expect(fsExists(pjoin(cwd, '.claude/agents/rokkit-styles-reviewer.md'))).toBe(true)
	})

	it('skips an existing agent unless force is set', () => {
		installAgents(['rokkit-styles-reviewer'], { cwd })
		expect(installAgents(['rokkit-styles-reviewer'], { cwd })[0].status).toBe('skipped')
		expect(installAgents(['rokkit-styles-reviewer'], { cwd, force: true })[0].status).toBe('added')
	})

	it('reports unknown agents and writes nothing for them', () => {
		const res = installAgents(['does-not-exist'], { cwd })
		expect(res).toEqual([{ name: 'does-not-exist', status: 'unknown' }])
		expect(fsExists(pjoin(cwd, '.claude/agents/does-not-exist.md'))).toBe(false)
	})

	it('every catalog agent is installable by its listed name (frontmatter name === filename)', () => {
		for (const a of listAgents()) {
			expect(installAgents([a.name], { cwd, force: true })).toEqual([
				{ name: a.name, status: 'added' }
			])
		}
	})
})

describe('fetchAgents (pull from site)', () => {
	let cwd
	beforeEach(() => {
		cwd = mkdtempSync(pjoin(tmpdir(), 'rokkit-agents-'))
	})
	afterEach(() => {
		rmSync(cwd, { recursive: true, force: true })
	})

	it('downloads a named agent from the site and writes it locally', async () => {
		const fetchImpl = vi.fn(async () => ({ ok: true, text: async () => '# remote agent body' }))
		const res = await fetchAgents(['rokkit-styles-reviewer'], { cwd, fetchImpl })
		expect(res).toEqual([{ name: 'rokkit-styles-reviewer', status: 'added' }])
		expect(fetchImpl).toHaveBeenCalledWith(
			expect.stringMatching(/\/agents\/rokkit-styles-reviewer\.md$/)
		)
		const dest = pjoin(cwd, '.claude/agents/rokkit-styles-reviewer.md')
		expect(readFileSync(dest, 'utf-8')).toBe('# remote agent body')
	})

	it('reports unknown when the site responds not-ok', async () => {
		const fetchImpl = vi.fn(async () => ({ ok: false }))
		const res = await fetchAgents(['nope'], { cwd, fetchImpl })
		expect(res).toEqual([{ name: 'nope', status: 'unknown' }])
		expect(fsExists(pjoin(cwd, '.claude/agents/nope.md'))).toBe(false)
	})

	it('skips an already-installed agent unless force is set', async () => {
		const fetchImpl = vi.fn(async () => ({ ok: true, text: async () => 'x' }))
		await fetchAgents(['rokkit-styles-reviewer'], { cwd, fetchImpl })
		fetchImpl.mockClear()
		const res = await fetchAgents(['rokkit-styles-reviewer'], { cwd, fetchImpl })
		expect(res[0].status).toBe('skipped')
		expect(fetchImpl).not.toHaveBeenCalled()
	})
})

describe('runAgentsAdd', () => {
	let cwd
	beforeEach(() => {
		vi.spyOn(console, 'info').mockImplementation(() => {})
		vi.spyOn(console, 'error').mockImplementation(() => {})
		prompts._injected = null
		cwd = mkdtempSync(pjoin(tmpdir(), 'rokkit-agents-'))
	})
	afterEach(() => {
		prompts._injected = null
		vi.restoreAllMocks()
		rmSync(cwd, { recursive: true, force: true })
	})

	it('installs explicitly-named agents without prompting', async () => {
		await runAgentsAdd(['rokkit-styles-reviewer'], { cwd })
		expect(fsExists(pjoin(cwd, '.claude/agents/rokkit-styles-reviewer.md'))).toBe(true)
	})

	it('--all installs the entire catalog', async () => {
		await runAgentsAdd([], { cwd, all: true })
		expect(fsExists(pjoin(cwd, '.claude/agents/rokkit-styles-reviewer.md'))).toBe(true)
		expect(fsExists(pjoin(cwd, '.claude/agents/rokkit-components-reviewer.md'))).toBe(true)
	})

	it('prints "skipped" for already-installed agents', async () => {
		await runAgentsAdd(['rokkit-styles-reviewer'], { cwd })
		vi.clearAllMocks()
		vi.spyOn(console, 'info').mockImplementation(() => {})
		await runAgentsAdd(['rokkit-styles-reviewer'], { cwd })
		expect(console.info).toHaveBeenCalledWith(expect.stringContaining('skipped'))
	})

	it('prints error and sets exitCode for unknown agents', async () => {
		process.exitCode = undefined
		await runAgentsAdd(['does-not-exist'], { cwd })
		expect(console.error).toHaveBeenCalledWith(expect.stringContaining('unknown agent'))
		expect(process.exitCode).toBe(1)
		process.exitCode = undefined
	})

	it('prints "No agents selected" when prompt returns empty selection', async () => {
		prompts.inject([[]])
		await runAgentsAdd([], { cwd })
		expect(console.info).toHaveBeenCalledWith(expect.stringContaining('No agents selected'))
	})

	it('installs from interactive prompt selection', async () => {
		prompts.inject([['rokkit-components-reviewer']])
		await runAgentsAdd([], { cwd })
		expect(fsExists(pjoin(cwd, '.claude/agents/rokkit-components-reviewer.md'))).toBe(true)
	})

	it('--remote pulls named agents from the site', async () => {
		const fetchImpl = vi.fn(async () => ({ ok: true, text: async () => '# remote' }))
		await runAgentsAdd(['rokkit-styles-reviewer'], { cwd, remote: true, fetchImpl })
		expect(fetchImpl).toHaveBeenCalledWith(
			expect.stringMatching(/\/agents\/rokkit-styles-reviewer\.md$/)
		)
		expect(fsExists(pjoin(cwd, '.claude/agents/rokkit-styles-reviewer.md'))).toBe(true)
	})
})

describe('runAgentsList', () => {
	let cwd
	beforeEach(() => {
		vi.spyOn(console, 'info').mockImplementation(() => {})
		cwd = mkdtempSync(pjoin(tmpdir(), 'rokkit-agents-'))
	})
	afterEach(() => {
		vi.restoreAllMocks()
		rmSync(cwd, { recursive: true, force: true })
	})

	it('prints each available agent with a description', async () => {
		await runAgentsList({ cwd })
		const calls = console.info.mock.calls.map((c) => c[0])
		expect(calls.some((s) => s.includes('rokkit-styles-reviewer'))).toBe(true)
	})

	it('marks installed agents with a checkmark', async () => {
		await runAgentsAdd(['rokkit-styles-reviewer'], { cwd })
		vi.clearAllMocks()
		vi.spyOn(console, 'info').mockImplementation(() => {})
		await runAgentsList({ cwd })
		const calls = console.info.mock.calls.map((c) => c[0])
		expect(calls.some((s) => s.startsWith('✓ '))).toBe(true)
	})

	it('prints "No agents available" when agentsDir is empty', async () => {
		await runAgentsList({ agentsDir: cwd, cwd })
		expect(console.info).toHaveBeenCalledWith('No agents available.')
	})
})

describe('agentsCommand entry', () => {
	let cwd
	beforeEach(() => {
		vi.spyOn(console, 'info').mockImplementation(() => {})
		vi.spyOn(console, 'error').mockImplementation(() => {})
		cwd = mkdtempSync(pjoin(tmpdir(), 'rokkit-agents-'))
	})
	afterEach(() => {
		vi.restoreAllMocks()
		rmSync(cwd, { recursive: true, force: true })
	})

	it('routes "list" to runAgentsList', async () => {
		const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(cwd)
		await agentsCommand('list', {})
		cwdSpy.mockRestore()
		expect(console.info).toHaveBeenCalled()
	})

	it('routes "add" with --all to runAgentsAdd', async () => {
		const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(cwd)
		await agentsCommand('add', { _: [], all: true })
		cwdSpy.mockRestore()
		expect(fsExists(pjoin(cwd, '.claude/agents/rokkit-styles-reviewer.md'))).toBe(true)
	})

	it('routes "add" with named agents to runAgentsAdd', async () => {
		const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(cwd)
		await agentsCommand('add', { _: ['rokkit-components-reviewer'] })
		cwdSpy.mockRestore()
		expect(fsExists(pjoin(cwd, '.claude/agents/rokkit-components-reviewer.md'))).toBe(true)
	})
})
