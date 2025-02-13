import { describe, it, expect, beforeEach } from 'vitest'
import { MetadataFactory } from '../../src/metadata/factory.js'
import { MetadataRegistry } from '../../src/metadata/registry.js'
import { JavaScriptMetadata } from '../../src/metadata/javascript.js'
import { JsonMetadata } from '../../src/metadata/json.js'
import { MarkdownMetadata } from '../../src/metadata/markdown.js'

describe('MetadataFactory', () => {
	let registry
	let factory

	beforeEach(() => {
		registry = new MetadataRegistry()
		registry.register('js', JavaScriptMetadata)
		registry.register('json', JsonMetadata)
		registry.register('md', MarkdownMetadata)
		factory = new MetadataFactory(registry)
	})

	it('should create metadata reader for registered file type', () => {
		const reader = factory.create('/tmp/story.js')
		expect(reader).toBeInstanceOf(JavaScriptMetadata)
		expect(reader.filePath).toBe('/tmp/story.js')
	})

	it('should throw error for unregistered file type', () => {
		expect(() => factory.create('/tmp/story.unknown')).toThrow(
			'No metadata reader found for file type: unknown'
		)
	})

	it('should throw error when registry is not provided', () => {
		expect(() => new MetadataFactory()).toThrow('Registry is required')
	})

	it('should throw error when filePath is not provided', () => {
		expect(() => factory.create()).toThrow('File path is required')
	})

	it('should throw error when filePath is not absolute', () => {
		expect(() => factory.create('./story.js')).toThrow('File path must be absolute')
	})

	it('should create reader using normalized file type', () => {
		const reader = factory.create('/tmp/story.JSON')
		expect(reader).toBeInstanceOf(JsonMetadata)
	})
})
