import { describe, it, expect } from 'vitest'
import { runChecks } from '../src/doctor.js'

describe('runChecks', () => {
	it('should report pass when rokkit.config.js exists', () => {
		const fs = {
			exists: (p) => true,
			read: (p) => {
				if (p.includes('rokkit.config')) return 'export default { colors: {} }'
				if (p.includes('uno.config')) return "presetRokkit(config) rokkit.config"
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
				if (p.includes('uno.config')) return "export default defineConfig({ presets: [presetRokkit()] })"
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
				if (p.includes('uno.config')) return "import { presetRokkit } from '@rokkit/unocss'\nimport config from './rokkit.config.js'\npresetRokkit(config)"
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
				if (p.includes('uno.config')) return "presetRokkit(config) rokkit.config"
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
				if (p.includes('uno.config')) return "presetRokkit(config) rokkit.config"
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
				if (p.includes('uno.config')) return "presetRokkit(config) rokkit.config"
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

	it('should return exactly 5 checks', () => {
		const fs = {
			exists: () => false,
			read: () => '',
			resolve: (p) => p
		}
		const results = runChecks(fs)
		expect(results).toHaveLength(5)
		const ids = results.map((r) => r.id)
		expect(ids).toContain('config-exists')
		expect(ids).toContain('uno-uses-preset')
		expect(ids).toContain('css-imports')
		expect(ids).toContain('css-theme')
		expect(ids).toContain('html-init-script')
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
					return "@import '@rokkit/themes/base.css';\n@import '@rokkit/themes/glass.css';"
				return ''
			},
			resolve: (p) => p
		}
		const results = runChecks(fs)
		const themeCheck = results.find((r) => r.id === 'css-theme')
		expect(themeCheck.status).toBe('pass')
	})
})
