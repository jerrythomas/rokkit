import { watchMedia } from '@rokkit/stores'
import { assimilateTutorials } from '@rokkit/tutorial'

const mediaqueries = {
	small: '(max-width: 767px)',
	medium: '(min-width: 768px) and (max-width: 1023px)',
	large: '(min-width: 1024px)',
	extraLarge: '(min-width: 1280px)',
	short: '(max-height: 399px)',
	landscape: '(orientation: landscape) and (max-height: 499px)',
	tiny: '(orientation: portrait) and (max-height: 599px)',
	dark: '(prefers-color-scheme: dark)',
	noanimations: '(prefers-reduced-motion: reduce)'
}

const modules = import.meta.glob('../stories/**/{App.svelte,meta.json,README.md}')
const samples = import.meta.glob('../stories/**/src/*', {
	query: '?raw',
	import: 'default'
})
const config = {
	root: '../stories/',
	previewFilename: 'App.svelte',
	readmeFilename: 'README.md',
	metadataFilename: 'meta.json',
	partialFolder: 'pre',
	solutionFolder: 'src'
}
export const media = watchMedia(mediaqueries)
export const guide = assimilateTutorials(modules, samples, config)
