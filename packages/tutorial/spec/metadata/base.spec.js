import { describe, it, expect } from 'vitest'
import { BaseMetadataReader } from '../../src/metadata/base.js'

describe('BaseMetadataReader', () => {
	it('should throw error when instantiating abstract base class directly', () => {
		expect(() => new BaseMetadataReader('./some/path')).toThrow('Cannot instantiate abstract class')
	})

	it('should throw error when read() method is not implemented', async () => {
		class TestReader extends BaseMetadataReader {}
		const reader = new TestReader('./some/path')
		expect(() => reader.read()).toThrow('read() method must be implemented')
	})

	it('should store filePath in constructor', () => {
		class TestReader extends BaseMetadataReader {}
		const filePath = './some/path'
		const reader = new TestReader(filePath)
		expect(reader.filePath).toBe(filePath)
	})

	it('should throw error if filePath is not provided', () => {
		class TestReader extends BaseMetadataReader {}
		expect(() => new TestReader()).toThrow('filePath is required')
	})

	it('should throw error if filePath is empty', () => {
		class TestReader extends BaseMetadataReader {}
		expect(() => new TestReader('')).toThrow('filePath is required')
	})
})
