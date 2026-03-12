import { describe, it, expect } from 'vitest'
import { MetadataRegistry } from '../../src/metadata/registry.js'
import { JavaScriptMetadata } from '../../src/metadata/javascript.js'
import { JsonMetadata } from '../../src/metadata/json.js'

describe('MetadataRegistry', () => {
	it('should register a metadata reader for a file type', () => {
		const registry = new MetadataRegistry()
		registry.register('js', JavaScriptMetadata)

		expect(registry.hasReader('js')).toBe(true)
	})

	it('should retrieve registered metadata reader', () => {
		const registry = new MetadataRegistry()
		registry.register('json', JsonMetadata)

		const Reader = registry.getReader('json')
		expect(Reader).toBe(JsonMetadata)
	})

	it('should return undefined for unregistered file type', () => {
		const registry = new MetadataRegistry()
		expect(registry.getReader('unknown')).toBeUndefined()
	})

	it('should not allow registering non-metadata readers', () => {
		const registry = new MetadataRegistry()
		class InvalidReader {}

		expect(() => registry.register('test', InvalidReader)).toThrow(
			'Reader must extend BaseMetadataReader'
		)
	})

	it('should normalize file type when registering and retrieving', () => {
		const registry = new MetadataRegistry()
		registry.register('JS', JavaScriptMetadata)

		expect(registry.hasReader('js')).toBe(true)
		expect(registry.getReader('js')).toBe(JavaScriptMetadata)
	})

	it('should not allow registering undefined or null readers', () => {
		const registry = new MetadataRegistry()

		expect(() => registry.register('test', null)).toThrow('Reader class is required')
		expect(() => registry.register('test')).toThrow('Reader class is required')
	})
})
