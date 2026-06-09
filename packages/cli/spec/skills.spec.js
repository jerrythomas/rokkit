import { describe, it, expect } from 'vitest'
import { parseFrontmatter, listSkills } from '../src/skills.js'

describe('parseFrontmatter', () => {
	it('extracts name and description from a frontmatter block', () => {
		const md = '---\nname: foo\ndescription: Bar baz qux\n---\n# Foo\n'
		expect(parseFrontmatter(md)).toEqual({ name: 'foo', description: 'Bar baz qux' })
	})

	it('returns empty strings when frontmatter is missing', () => {
		expect(parseFrontmatter('# no frontmatter here')).toEqual({ name: '', description: '' })
	})
})

describe('listSkills (bundled catalog)', () => {
	it('includes both v1 skills, each with a non-empty description', () => {
		const skills = listSkills()
		const names = skills.map((s) => s.name)
		expect(names).toContain('semantic-styles-rokkit')
		expect(names).toContain('rokkit-components')
		for (const s of skills) {
			expect(s.name).toBeTruthy()
			expect(s.description.length).toBeGreaterThan(0)
		}
	})

	it('is sorted by name', () => {
		const names = listSkills().map((s) => s.name)
		expect(names).toEqual([...names].sort())
	})
})
