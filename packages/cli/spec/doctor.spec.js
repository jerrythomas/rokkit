import { describe, it, expect } from 'vitest'
import { runChecks, defaultStarterSource, validateConfigShape, findLegacyZUtilities } from '../src/doctor.js'

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

describe('findLegacyZUtilities', () => {
	it('detects surface z-utilities and maps them to named tokens', () => {
		const files = [{ path: 'src/A.svelte', content: '<div class="bg-surface-z1 text-surface-z9 border-surface-z3">' }]
		const { count, byFile } = findLegacyZUtilities(files)
		expect(count).toBe(3)
		const suggestions = byFile[0].hits.map((h) => h.suggestion)
		expect(suggestions).toContain('bg-paper-soft')
		expect(suggestions).toContain('text-ink')
		expect(suggestions).toContain('border-paper-mute')
	})

	it('maps primary/status z-utilities', () => {
		const files = [{ path: 'src/B.svelte', content: 'text-primary-z5 bg-success-z1' }]
		const { byFile } = findLegacyZUtilities(files)
		const suggestions = byFile[0].hits.map((h) => h.suggestion)
		expect(suggestions).toContain('text-primary')
		expect(suggestions).toContain('bg-success-soft')
	})

	it('returns zero hits for named-token-only code', () => {
		const files = [{ path: 'src/C.svelte', content: 'bg-paper text-ink bg-primary text-on-primary' }]
		expect(findLegacyZUtilities(files).count).toBe(0)
	})

	it('maps z0 on accent/status roles to the -soft tint', () => {
		const files = [{ path: 'src/D.svelte', content: 'bg-accent-z0 bg-info-z0' }]
		const suggestions = findLegacyZUtilities(files).byFile[0].hits.map((h) => h.suggestion)
		expect(suggestions).toContain('bg-accent-soft')
		expect(suggestions).toContain('bg-info-soft')
	})
})
