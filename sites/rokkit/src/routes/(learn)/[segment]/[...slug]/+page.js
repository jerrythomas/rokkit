// import { tutorials } from '$lib'
// import { findTutorial } from '@rokkit/tutorial'
// import path from 'path'
// const prefix = '../../../../'

// const config = {
// 	rootFolder: 'stories',
// 	tutorialMetadata: 'src/lib/tutorials.json',
// 	partialFolder: 'pre',
// 	solutionFolder: 'src',
// 	preview: 'App.svelte'
// }

import { guide } from '$lib'
/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
	// const keys = params.slug.split('/')
	// let tutorial = findTutorial(tutorials, keys)
	// const tutorialPath = path.join(config.rootFolder, tutorial.path)
	// // console.log(tutorialPath)
	// tutorial.readme = prefix + path.join(tutorialPath, tutorial.name)
	// if (tutorial.before)
	// 	tutorial.before.preview =
	// 		prefix + path.join(tutorialPath, config.partialFolder, config.preview)
	// if (tutorial.after)
	// 	tutorial.after.preview =
	// 		prefix + path.join(tutorialPath, config.solutionFolder, config.preview)
	let tutorial = await guide.find(params.slug)
	tutorial.src.files[0]._open = true
	// console.log(tutorial)
	return { tutorial }
}
