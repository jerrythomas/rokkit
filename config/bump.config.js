import { defineConfig } from 'bumpp'

export default defineConfig({
	files: ['package.json', 'packages/*/package.json', 'apps/learn/package.json'],
	recursive: true
})
