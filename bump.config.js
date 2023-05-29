import { defineConfig } from 'bumpp'

export default defineConfig({
	files: [
		'package.json',
		'pnpm-lock.yaml',
		'packages/*/package.json',
		'shared/*/package.json'
	],
	recursive: true
})
