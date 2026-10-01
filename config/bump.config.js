import { defineConfig } from 'bumpp'

export default defineConfig({
	// sensei.library.json: `documents` and `ref` name the release, so they move with it (#155).
	files: ['package.json', 'packages/*/package.json', 'apps/learn/package.json', 'sensei.library.json'],
	recursive: true,
	// bun.lock records each workspace's version, and `bun pm pack` (publish.yml) rewrites every
	// workspace:* dependency FROM it. Left stale, v1.8.1 shipped pinned to its 1.8.0 siblings.
	// So the bump refreshes the lockfile and commits it with the versions (config/spec/lockfile.spec.js).
	execute: 'bun install --ignore-scripts',
	all: true
})
