import extractorSvelte from '@unocss/extractor-svelte'
import {
	defineConfig,
	presetIcons,
	presetWind3,
	transformerDirectives,
	transformerVariantGroup
} from 'unocss'

import { shades, defaultPalette, defaultIcons, iconShortcuts } from '@rokkit/core'
import { iconCollections } from '@rokkit/core/vite'
import { Theme } from '@rokkit/core'

const theme = new Theme()

const themeConfig = {
	dark: {
		light: '[data-mode="light"]',
		dark: '[data-mode="dark"]'
	}
}

export default defineConfig({
	darkMode: 'attribute',
	extractors: [extractorSvelte()],
	content: {
		pipeline: {
			include: [
				'src/**/*.{svelte,ts}',
				'../../packages/themes/src/**/*.css',
				'../../packages/ui/src/**/*.svelte'
			]
		}
	},
	safelist: [
		...defaultIcons,
		...defaultPalette.flatMap((color: string) =>
			shades.map((shade: number) => `bg-${color}-${shade}`)
		),
		'i-lucide:chevron-down',
		'i-lucide:chevron-right',
		'i-lucide:check',
		'i-lucide:x',
		'i-lucide:menu',
		'i-lucide:plus',
		'i-lucide:minus',
		'i-lucide:search',
		'i-lucide:settings',
		'i-lucide:sun',
		'i-lucide:moon',
		'i-lucide:folder',
		'i-lucide:folder-open',
		'i-lucide:file',
		'i-lucide:file-code',
		'i-lucide:file-text',
		'i-lucide:home',
		'i-lucide:user',
		'i-lucide:mail',
		'i-lucide:bell',
		'i-lucide:star',
		'i-lucide:heart',
		'i-lucide:trash',
		'i-lucide:edit',
		'i-lucide:copy',
		'i-lucide:clipboard',
		'i-lucide:bold',
		'i-lucide:italic',
		'i-lucide:underline',
		'i-lucide:align-left',
		'i-lucide:align-center',
		'i-lucide:align-right',
		'i-lucide:list',
		'i-lucide:grid-2x2',
		'i-lucide:layout-grid',
		'i-lucide:save',
		'i-lucide:download',
		'i-lucide:upload',
		'i-lucide:share',
		'i-lucide:palette',
		'i-lucide:circle',
		'i-lucide:monitor',
		'i-lucide:scissors',
		'i-lucide:square',
		'i-lucide:hash'
	],
	shortcuts: [
		['skin-default', theme.getPalette()],
		...theme.getShortcuts('surface'),
		...theme.getShortcuts('primary'),
		...theme.getShortcuts('secondary'),
		...theme.getShortcuts('accent'),
		...theme.getShortcuts('success'),
		...theme.getShortcuts('warning'),
		...theme.getShortcuts('danger'),
		...theme.getShortcuts('info'),
		...theme.getShortcuts('error'),
		...Object.entries(iconShortcuts(defaultIcons, 'i-rokkit'))
	],
	theme: {
		colors: theme.getColorRules()
	},
	presets: [
		presetWind3(themeConfig),
		presetIcons({
			collections: {
				lucide: () => import('@iconify-json/lucide/icons.json').then((m) => m.default as any),
				...iconCollections({
					rokkit: '@rokkit/icons/ui.json'
				})
			}
		})
	],
	transformers: [transformerDirectives(), transformerVariantGroup()]
})
