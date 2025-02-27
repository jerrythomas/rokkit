import { assimilateTutorials } from '@rokkit/tutorial'

const modules = import.meta.glob('./**/{App.svelte,meta.json,README.md}')
const samples = import.meta.glob('./**/src/*', {
	query: '?raw',
	import: 'default'
})

const config = {
	root: './',
	previewFilename: 'App.svelte',
	readmeFilename: 'README.md',
	metadataFilename: 'meta.json',
	partialFolder: 'pre',
	solutionFolder: 'src'
}

export const guide = assimilateTutorials(modules, samples, config)
