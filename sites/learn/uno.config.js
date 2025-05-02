import extractorSvelte from '@unocss/extractor-svelte'
import {
	defineConfig,
	presetIcons,
	presetTypography,
	presetWind3,
	transformerDirectives,
	transformerVariantGroup
} from 'unocss'

import { importIcons } from '@rokkit/core'
import { iconShortcuts, defaultIcons, themeColors, themeRules } from '@rokkit/themes'
import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'
export const palette = themeRules('rokkit', { neutral: 'shark' })

const icons = {
	rokkit: '@rokkit/icons/ui.json',
	logo: '@rokkit/icons/auth.json',
	component: '@rokkit/icons/components.json',
	app: '@rokkit/icons/app.json',
	solar: '@iconify-json/solar/icons.json'
}

const components = [
	'list',
	'accordion',
	'select',
	'tree',
	'tabs',
	'input-text',
	'rating',
	'switch-button',
	'range'
]

export default defineConfig({
	extractors: [extractorSvelte()],
	rules: [...palette],
	safelist: [
		...defaultIcons,
		'i-rokkit:navigate-right',
		'navigate-left',
		...components.map((icon) => `i-component:${icon}`),
		'text-neutral-base',
		'text-neutral-subtle',
		'text-neutral-muted',
		'text-primary',
		'text-primary-muted',
		'bg-neutral-base',
		'bg-neutral-subtle',
		'bg-neutral-muted',
		'bg-neutral-inset',
		'i-rokkit:github',
		'i-rokkit:menu',
		'i-rokkit:accordion-closed',
		'i-rokkit:heart-filled',
		'i-rokkit:heart-outlined',
		'i-rokkit:folder-opened',
		'i-rokkit:folder-closed',
		'bg-green',
		'svelte',
		'js',
		'folder',
		'css',
		'type-array',
		'type-object',
		'type-string',
		'type-number',
		'type-boolean',
		'-translate-x-full',
		'i-app:code-visible',
		'i-app:code-hidden',
		'i-file:css'
	],
	shortcuts: {
		...iconShortcuts(defaultIcons, 'i-rokkit'),
		'type-array': 'i-component:input-array',
		'type-object': 'i-component:input-object',
		'type-string': 'i-component:input-text',
		'type-number': 'i-component:input-number',
		'type-boolean': 'i-component:checkbox',
		'sort-descending': 'i-solar:sort-from-bottom-to-top-line-duotone',
		'sort-ascending': 'i-solar:sort-from-top-to-bottom-line-duotone',
		'sort-desc': 'i-solar:sort-from-bottom-to-top-line-duotone',
		'sort-asc': 'i-solar:sort-from-top-to-bottom-line-duotone',
		'sort-none': 'i-solar:sort-vertical-line-duotone'
	},
	theme: {
		fontFamily: {
			mono: ['Victor Mono', 'monospace'],
			heading: ['Open Sans', 'sans-serif'],
			sans: ['Overpass', 'ui-serif', 'sans-serif'],
			body: ['Open Sans', '-apple-system', 'system-ui', 'Segoe-UI', 'ui-serif', 'sans-serif']
		},
		colors: themeColors()
	},
	presets: [
		presetWind3({
			dark: 'class'
		}),
		presetTypography(),
		presetIcons({
			collections: {
				...importIcons(icons),
				file: () =>
					import('./static/icons/files/icons.json', { with: { type: 'json' } }).then(
						(i) => i.default
					)
				// file: FileSystemIconLoader('./static/icons/files', (svg) =>
				// 	svg.replace(/black/, 'currentColor')
				// )
			}
		})
	],
	transformers: [transformerDirectives(), transformerVariantGroup()]
})
