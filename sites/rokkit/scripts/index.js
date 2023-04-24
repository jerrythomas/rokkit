import fs from 'fs'
import { assimilateTutorials } from '@rokkit/tutorial'

async function generate() {
	console.log('Processing stories...')
	const tutorials = assimilateTutorials(
		'stories',
		/(meta\.js|meta\.json|README\.md)$/
	)
	await tutorials.generate()
}

generate()
