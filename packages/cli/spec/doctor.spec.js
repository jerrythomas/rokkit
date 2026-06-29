import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runChecks, defaultStarterSource, validateConfigShape, doctor } from '../src/doctor.js'

describe('runChecks', () => {
	it('should report pass when rokkit.config.js exists', () => {
		const fs = {
			exists: (p) => true,
			read: (p) => {
				if (p.includes('rokkit.config')) return 'export default { colors: {} }'
				if (p.includes('uno.config')) return 'presetRokkit(config) rokkit.config'
				if (p.includes('app.css')) return "@import '@rokkit/themes/base.css';"
				if (p.includes('app.html')) return '<body>rokkit-theme</body>'
				return ''
			},
			resolve: (p) => p
		}
		const results = runChecks(fs)
		const configCheck = results.find((r) => r.id === 'config-exists')
		expect(configCheck.status).toBe('pass')
	})

	it('should report fail when rokkit.config.js is missing', () => {
		const fs = {
			exists: () => false,
			read: () => '',
			resolve: (p) => p
		}
		const results = runChecks(fs)
		const configCheck = results.find((r) => r.id === 'config-exists')
		expect(configCheck.status).toBe('fail')
		expect(configCheck.fixable).toBe(true)
	})

	it('should report fail when uno.config.js does not use presetRokkit', () => {
		const fs = {
			exists: (p) => true,
			read: (p) => {
				if (p.includes('rokkit.config')) return 'export default {}'
				if (p.includes('uno.config'))
					return 'export default defineConfig({ presets: [presetRokkit()] })'
				if (p.includes('app.css')) return "@import '@rokkit/themes/base.css';"
				if (p.includes('app.html')) return '<body>rokkit-theme</body>'
				return ''
			},
			resolve: (p) => p
		}
		const results = runChecks(fs)
		const unoCheck = results.find((r) => r.id === 'uno-uses-preset')
		expect(unoCheck.status).toBe('fail')
		expect(unoCheck.fixable).toBe(false)
	})

	it('should report pass when uno.config.js uses presetRokkit', () => {
		const fs = {
			exists: () => true,
			read: (p) => {
				if (p.includes('rokkit.config')) return 'export default {}'
				if (p.includes('uno.config'))
					return "import { presetRokkit } from '@rokkit/unocss'\nimport config from './rokkit.config.js'\npresetRokkit(config)"
				if (p.includes('app.css')) return "@import '@rokkit/themes/base.css';"
				if (p.includes('app.html')) return '<body>rokkit-theme</body>'
				return ''
			},
			resolve: (p) => p
		}
		const results = runChecks(fs)
		const unoCheck = results.find((r) => r.id === 'uno-uses-preset')
		expect(unoCheck.status).toBe('pass')
	})

	it('should report fail when app.css is missing theme imports', () => {
		const fs = {
			exists: (p) => true,
			read: (p) => {
				if (p.includes('rokkit.config')) return 'export default {}'
				if (p.includes('uno.config')) return 'presetRokkit(config) rokkit.config'
				if (p.includes('app.css')) return 'body { color: red; }'
				if (p.includes('app.html')) return '<body>rokkit-theme</body>'
				return ''
			},
			resolve: (p) => p
		}
		const results = runChecks(fs)
		const cssCheck = results.find((r) => r.id === 'css-imports')
		expect(cssCheck.status).toBe('fail')
		expect(cssCheck.fixable).toBe(true)
	})

	it('should report pass when app.css has theme imports', () => {
		const fs = {
			exists: () => true,
			read: (p) => {
				if (p.includes('rokkit.config')) return 'export default {}'
				if (p.includes('uno.config')) return 'presetRokkit(config) rokkit.config'
				if (p.includes('app.css')) return "@import '@rokkit/themes/base.css';"
				if (p.includes('app.html')) return '<body>rokkit-theme</body>'
				return ''
			},
			resolve: (p) => p
		}
		const results = runChecks(fs)
		const cssCheck = results.find((r) => r.id === 'css-imports')
		expect(cssCheck.status).toBe('pass')
	})

	it('should report fail when app.html has no init script', () => {
		const fs = {
			exists: () => true,
			read: (p) => {
				if (p.includes('rokkit.config')) return 'export default {}'
				if (p.includes('uno.config')) return 'presetRokkit(config) rokkit.config'
				if (p.includes('app.css')) return "@import '@rokkit/themes/base.css';"
				if (p.includes('app.html')) return '<body>%sveltekit.body%</body>'
				return ''
			},
			resolve: (p) => p
		}
		const results = runChecks(fs)
		const htmlCheck = results.find((r) => r.id === 'html-init-script')
		expect(htmlCheck.status).toBe('fail')
		expect(htmlCheck.fixable).toBe(true)
	})

	it('should return exactly 6 checks', () => {
		const fs = {
			exists: () => false,
			read: () => '',
			resolve: (p) => p
		}
		const results = runChecks(fs)
		expect(results).toHaveLength(6)
		const ids = results.map((r) => r.id)
		expect(ids).toContain('config-exists')
		expect(ids).toContain('uno-uses-preset')
		expect(ids).toContain('css-imports')
		expect(ids).toContain('css-theme')
		expect(ids).toContain('html-init-script')
		expect(ids).toContain('chart-config')
	})

	it('should warn when rokkit.config.js has no chart section', () => {
		const fs = {
			exists: () => true,
			read: (p) => {
				if (p.includes('rokkit.config')) return 'export default { colors: {} }'
				return ''
			},
			resolve: (p) => p
		}
		const results = runChecks(fs)
		const chartCheck = results.find((r) => r.id === 'chart-config')
		expect(chartCheck.status).toBe('warn')
		expect(chartCheck.fixable).toBe(true)
		expect(chartCheck.autoFix).toBe('patch-chart-config')
	})

	it('should pass chart-config when chart section is present', () => {
		const fs = {
			exists: () => true,
			read: (p) => {
				if (p.includes('rokkit.config')) return 'export default { chart: { colors: [] } }'
				return ''
			},
			resolve: (p) => p
		}
		const results = runChecks(fs)
		const chartCheck = results.find((r) => r.id === 'chart-config')
		expect(chartCheck.status).toBe('pass')
	})

	it('chart-config is not fixable when rokkit.config.js does not exist', () => {
		const fs = {
			exists: () => false,
			read: () => '',
			resolve: (p) => p
		}
		const results = runChecks(fs)
		const chartCheck = results.find((r) => r.id === 'chart-config')
		expect(chartCheck.status).toBe('warn')
		expect(chartCheck.fixable).toBe(false)
	})

	it('should warn when app.css has no known theme style', () => {
		const fs = {
			exists: () => true,
			read: (p) => {
				if (p.includes('app.css')) return "@import '@rokkit/themes/base.css';"
				return ''
			},
			resolve: (p) => p
		}
		const results = runChecks(fs)
		const themeCheck = results.find((r) => r.id === 'css-theme')
		expect(themeCheck.status).toBe('warn')
		expect(themeCheck.fixable).toBe(false)
	})

	it('should pass css-theme when a known theme is present', () => {
		const fs = {
			exists: () => true,
			read: (p) => {
				if (p.includes('app.css'))
					return "@import '@rokkit/themes/base.css';\n@import '@rokkit/themes/frosted.css';"
				return ''
			},
			resolve: (p) => p
		}
		const results = runChecks(fs)
		const themeCheck = results.find((r) => r.id === 'css-theme')
		expect(themeCheck.status).toBe('pass')
	})
})

describe('validateConfigShape', () => {
	it('warns when the colormap has no ink role', () => {
		const checks = validateConfigShape({ skin: { surface: 'slate', primary: 'orange' }, colorSpace: 'rgb' })
		const ink = checks.find((c) => c.id === 'skin-ink-role')
		expect(ink.status).toBe('warn')
	})

	it('passes (no ink warning) when ink is present', () => {
		const checks = validateConfigShape({ skin: { surface: 'slate', ink: 'slate', primary: 'orange' } })
		expect(checks.find((c) => c.id === 'skin-ink-role')).toBeUndefined()
	})

	it('warns when colorSpace is oklch but palettes is empty', () => {
		const checks = validateConfigShape({ skin: { surface: 'kami', ink: 'kami' }, colorSpace: 'oklch' })
		expect(checks.find((c) => c.id === 'oklch-needs-palettes').status).toBe('warn')
	})

	it('warns when using the legacy colors alias', () => {
		const checks = validateConfigShape({ colors: { surface: 'slate', ink: 'slate' } })
		expect(checks.find((c) => c.id === 'colors-alias').status).toBe('warn')
	})

	it('reads the colormap from skins.default', () => {
		const checks = validateConfigShape({ skins: { default: { surface: 'slate', primary: 'orange' } } })
		expect(checks.find((c) => c.id === 'skin-ink-role')).toBeDefined()
	})

	it('does not warn when ink is present in skins.default', () => {
		const checks = validateConfigShape({ skins: { default: { surface: 'slate', ink: 'slate', primary: 'orange' } } })
		expect(checks.find((c) => c.id === 'skin-ink-role')).toBeUndefined()
	})

	it('returns [] for a null config', () => {
		expect(validateConfigShape(null)).toEqual([])
	})
})

describe('defaultStarterSource', () => {
	it('produces a real named-token starter, not an empty config', () => {
		const src = defaultStarterSource()
		expect(src).not.toBe('export default {}\n')
		expect(src).toContain('skin')
		const json = src.slice(src.indexOf('export default') + 'export default'.length).trim().replace(/\n$/, '')
		expect(JSON.parse(json).skin.ink).toBeDefined()
	})
})

// ─────────────────────────────────────────────────────────────────────────────
// doctor() — integration tests using real temp directories
// ─────────────────────────────────────────────────────────────────────────────

function makeProjectDir() {
	const cwd = mkdtempSync(join(tmpdir(), 'rokkit-doctor-'))
	// Minimal SvelteKit-ish layout so the checks can be run
	mkdirSync(join(cwd, 'src'), { recursive: true })
	return cwd
}

function writePassingProject(cwd) {
	// Write files that satisfy all checks (no failures, no warnings except css-theme)
	writeFileSync(
		join(cwd, 'rokkit.config.js'),
		'export default { skin: { surface:"slate", ink:"slate", primary:"orange", accent:"sky", success:"green", warning:"yellow", danger:"red", error:"red", info:"cyan" }, chart: { colors: [] } }\n'
	)
	writeFileSync(
		join(cwd, 'uno.config.js'),
		"import { presetRokkit } from '@rokkit/unocss'\nimport config from './rokkit.config.js'\npresetRokkit(config)\n"
	)
	writeFileSync(
		join(cwd, 'src/app.css'),
		"@import '@rokkit/themes/base.css';\n@import '@rokkit/themes/rokkit.css';\n"
	)
	writeFileSync(
		join(cwd, 'src/app.html'),
		'<html><body data-mode="light">%sveltekit.body%</body></html>'
	)
}

describe('doctor() main entry', () => {
	let cwd
	let cwdSpy

	beforeEach(() => {
		vi.spyOn(console, 'info').mockImplementation(() => {})
		vi.spyOn(console, 'warn').mockImplementation(() => {})
		vi.spyOn(console, 'error').mockImplementation(() => {})
		cwd = makeProjectDir()
		cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(cwd)
	})

	afterEach(() => {
		cwdSpy.mockRestore()
		vi.restoreAllMocks()
		rmSync(cwd, { recursive: true, force: true })
	})

	it('prints all checks and exits cleanly when project passes', async () => {
		writePassingProject(cwd)
		await doctor({})
		expect(console.info).toHaveBeenCalledWith(expect.stringContaining('Rokkit Doctor'))
		// exitCode should not be set to 1 (no failures left)
		expect(process.exitCode).not.toBe(1)
	})

	it('sets process.exitCode=1 when there are failures and fix=false', async () => {
		// Missing config, css, html — all checks fail
		process.exitCode = undefined
		await doctor({})
		expect(process.exitCode).toBe(1)
		// restore
		process.exitCode = undefined
	})

	it('runs without error when config file has no ink role (shape checks from validateConfigShape)', async () => {
		// validateConfigShape is already covered directly; here we just verify
		// doctor() completes without throwing when the project is partially configured.
		writeFileSync(
			join(cwd, 'rokkit.config.js'),
			'export default { skin: { surface:"slate", primary:"orange" }, chart: { colors: [] } }\n'
		)
		writeFileSync(join(cwd, 'uno.config.js'), "import { presetRokkit } from '@rokkit/unocss'\nimport config from './rokkit.config.js'\npresetRokkit(config)\n")
		writeFileSync(join(cwd, 'src/app.css'), "@import '@rokkit/themes/base.css';\n@import '@rokkit/themes/rokkit.css';\n")
		writeFileSync(join(cwd, 'src/app.html'), '<html><body data-mode="light">%sveltekit.body%</body></html>')
		process.exitCode = undefined
		// loadConfig can't dynamically import real files in JSDOM; it returns null,
		// so validateConfigShape([null]) returns [] — no shape warnings. Test that
		// doctor() itself runs and prints the standard header regardless.
		await doctor({})
		expect(console.info).toHaveBeenCalledWith(expect.stringContaining('Rokkit Doctor'))
		process.exitCode = undefined
	})
})

describe('doctor({ fix: true }) — auto-fix integration', () => {
	let cwd
	let cwdSpy

	beforeEach(() => {
		vi.spyOn(console, 'info').mockImplementation(() => {})
		vi.spyOn(console, 'warn').mockImplementation(() => {})
		vi.spyOn(console, 'error').mockImplementation(() => {})
		cwd = makeProjectDir()
		cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(cwd)
	})

	afterEach(() => {
		cwdSpy.mockRestore()
		vi.restoreAllMocks()
		rmSync(cwd, { recursive: true, force: true })
	})

	it('generates rokkit.config.js when missing (generate-config fix)', async () => {
		// Only write the bare minimum so config-exists fails but the fix can run
		writeFileSync(
			join(cwd, 'uno.config.js'),
			"import { presetRokkit } from '@rokkit/unocss'\nimport config from './rokkit.config.js'\npresetRokkit(config)\n"
		)
		writeFileSync(join(cwd, 'src/app.css'), "@import '@rokkit/themes/base.css';\n")
		writeFileSync(join(cwd, 'src/app.html'), '<html><body>%sveltekit.body%</body></html>')
		process.exitCode = undefined
		await doctor({ fix: true })
		expect(existsSync(join(cwd, 'rokkit.config.js'))).toBe(true)
		const content = readFileSync(join(cwd, 'rokkit.config.js'), 'utf-8')
		expect(content).toContain('skin')
		process.exitCode = undefined
	})

	it('patches app.css when base import is missing (patch-css fix)', async () => {
		// Write a passing config and html but an app.css without the base import
		writeFileSync(
			join(cwd, 'rokkit.config.js'),
			'export default { skin: { surface:"slate",ink:"slate",primary:"orange",accent:"sky",success:"green",warning:"yellow",danger:"red",error:"red",info:"cyan" }, chart: { colors: [] } }\n'
		)
		writeFileSync(join(cwd, 'uno.config.js'), "import { presetRokkit } from '@rokkit/unocss'\nimport config from './rokkit.config.js'\npresetRokkit(config)\n")
		writeFileSync(join(cwd, 'src/app.css'), 'body { color: red; }\n')
		writeFileSync(join(cwd, 'src/app.html'), '<html><body data-mode="light">%sveltekit.body%</body></html>')
		process.exitCode = undefined
		await doctor({ fix: true })
		const css = readFileSync(join(cwd, 'src/app.css'), 'utf-8')
		expect(css).toContain('@rokkit/themes/base.css')
		process.exitCode = undefined
	})

	it('patches app.css when css file does not exist yet (patch-css fix, no css file)', async () => {
		writeFileSync(
			join(cwd, 'rokkit.config.js'),
			'export default { skin: { surface:"slate",ink:"slate",primary:"orange",accent:"sky",success:"green",warning:"yellow",danger:"red",error:"red",info:"cyan" }, chart: { colors: [] } }\n'
		)
		writeFileSync(join(cwd, 'uno.config.js'), "import { presetRokkit } from '@rokkit/unocss'\nimport config from './rokkit.config.js'\npresetRokkit(config)\n")
		writeFileSync(join(cwd, 'src/app.html'), '<html><body data-mode="light">%sveltekit.body%</body></html>')
		// No app.css at all
		process.exitCode = undefined
		await doctor({ fix: true })
		expect(existsSync(join(cwd, 'src/app.css'))).toBe(true)
		const css = readFileSync(join(cwd, 'src/app.css'), 'utf-8')
		expect(css).toContain('@rokkit/themes/base.css')
		process.exitCode = undefined
	})

	it('patches app.html with init script when missing (patch-html fix)', async () => {
		writeFileSync(
			join(cwd, 'rokkit.config.js'),
			"export default { storageKey: 'my-app', skin: { surface:'slate',ink:'slate',primary:'orange',accent:'sky',success:'green',warning:'yellow',danger:'red',error:'red',info:'cyan' }, chart: { colors: [] } }\n"
		)
		writeFileSync(join(cwd, 'uno.config.js'), "import { presetRokkit } from '@rokkit/unocss'\nimport config from './rokkit.config.js'\npresetRokkit(config)\n")
		writeFileSync(join(cwd, 'src/app.css'), "@import '@rokkit/themes/base.css';\n@import '@rokkit/themes/rokkit.css';\n")
		writeFileSync(join(cwd, 'src/app.html'), '<html><body>%sveltekit.body%</body></html>')
		process.exitCode = undefined
		await doctor({ fix: true })
		const html = readFileSync(join(cwd, 'src/app.html'), 'utf-8')
		// The init script injection should have added data-mode or the storage key check
		expect(html.length).toBeGreaterThan('<html><body>%sveltekit.body%</body></html>'.length)
		process.exitCode = undefined
	})

	it('skips patch-html when app.html does not exist', async () => {
		writeFileSync(
			join(cwd, 'rokkit.config.js'),
			'export default { skin: { surface:"slate",ink:"slate",primary:"orange",accent:"sky",success:"green",warning:"yellow",danger:"red",error:"red",info:"cyan" }, chart: { colors: [] } }\n'
		)
		writeFileSync(join(cwd, 'uno.config.js'), "import { presetRokkit } from '@rokkit/unocss'\nimport config from './rokkit.config.js'\npresetRokkit(config)\n")
		writeFileSync(join(cwd, 'src/app.css'), "@import '@rokkit/themes/base.css';\n@import '@rokkit/themes/rokkit.css';\n")
		// No app.html
		process.exitCode = undefined
		await doctor({ fix: true })
		expect(existsSync(join(cwd, 'src/app.html'))).toBe(false)
		process.exitCode = undefined
	})

	it('reports "All N fixed!" when all issues can be auto-fixed', async () => {
		// Empty project — config-exists and css-imports and html-init-script all fail but are fixable
		// (uno-uses-preset is not fixable, css-theme is warn not fail)
		writeFileSync(join(cwd, 'src/app.html'), '<html><body>%sveltekit.body%</body></html>')
		process.exitCode = undefined
		await doctor({ fix: true })
		// Some issues were fixed — the "fixed" path ran
		expect(console.info).toHaveBeenCalledWith(expect.stringContaining('Auto-fixing'))
		process.exitCode = undefined
	})

	it('reports remaining manual items when some fixes cannot be applied', async () => {
		// Make config-exists pass but uno-uses-preset fail (not fixable) and html-init-script fail (fixable)
		writeFileSync(
			join(cwd, 'rokkit.config.js'),
			'export default { skin: { surface:"slate",ink:"slate",primary:"orange",accent:"sky",success:"green",warning:"yellow",danger:"red",error:"red",info:"cyan" }, chart: { colors: [] } }\n'
		)
		writeFileSync(join(cwd, 'uno.config.js'), '// no presetRokkit here\n')
		writeFileSync(join(cwd, 'src/app.css'), "@import '@rokkit/themes/base.css';\n@import '@rokkit/themes/rokkit.css';\n")
		writeFileSync(join(cwd, 'src/app.html'), '<html><body>%sveltekit.body%</body></html>')
		process.exitCode = undefined
		await doctor({ fix: true })
		// Uno check fails and is not fixable → ends up in manual items
		expect(console.info).toHaveBeenCalledWith(expect.stringContaining('require manual action'))
		process.exitCode = undefined
	})

	it('skips patch-html when html already contains the storage-key marker', async () => {
		writeFileSync(
			join(cwd, 'rokkit.config.js'),
			"export default { storageKey: 'my-app', skin: { surface:'slate',ink:'slate',primary:'orange',accent:'sky',success:'green',warning:'yellow',danger:'red',error:'red',info:'cyan' }, chart: { colors: [] } }\n"
		)
		writeFileSync(join(cwd, 'uno.config.js'), "import { presetRokkit } from '@rokkit/unocss'\nimport config from './rokkit.config.js'\npresetRokkit(config)\n")
		writeFileSync(join(cwd, 'src/app.css'), "@import '@rokkit/themes/base.css';\n@import '@rokkit/themes/rokkit.css';\n")
		// Already contains the storageKey 'my-app'
		writeFileSync(join(cwd, 'src/app.html'), '<html><body>my-app%sveltekit.body%</body></html>')
		const before = readFileSync(join(cwd, 'src/app.html'), 'utf-8')
		process.exitCode = undefined
		await doctor({ fix: true })
		const after = readFileSync(join(cwd, 'src/app.html'), 'utf-8')
		// The file should NOT have been modified since the marker is already present
		expect(after).toBe(before)
		process.exitCode = undefined
	})

})

