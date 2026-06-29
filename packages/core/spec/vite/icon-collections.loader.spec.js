import { describe, it, expect, afterAll } from 'vitest'
import { writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { iconCollections } from '../../src/vite/icon-collections.js'

// Real fixture files so the loaders exercise the actual readFileSync code paths
// (relative branch resolves against cwd; absolute branch reads directly).
const absPath = join(tmpdir(), 'rokkit-iconset-abs.test.json')
const relName = 'rokkit-iconset-rel.test.json'
const relAbsPath = join(process.cwd(), relName)
writeFileSync(absPath, '{"home":"M0 0h24v24H0z"}')
writeFileSync(relAbsPath, '{"star":"M1 1"}')

afterAll(() => {
	rmSync(absPath, { force: true })
	rmSync(relAbsPath, { force: true })
})

describe('iconCollections — file-path loaders', () => {
	it('loads a relative-path collection (resolved against cwd)', () => {
		const loaders = iconCollections({ rel: `./${relName}` })
		expect(loaders.rel()).toEqual({ star: 'M1 1' })
	})

	it('loads an absolute-path collection', () => {
		const loaders = iconCollections({ abs: absPath })
		expect(loaders.abs()).toEqual({ home: 'M0 0h24v24H0z' })
	})
})
