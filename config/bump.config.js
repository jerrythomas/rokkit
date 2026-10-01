import { defineConfig } from 'bumpp'

export default defineConfig({
	// sensei.library.json: `documents` and `ref` name the release, so they move with it (#155).
	files: ['package.json', 'packages/*/package.json', 'apps/learn/package.json', 'sensei.library.json'],
	recursive: true
})
