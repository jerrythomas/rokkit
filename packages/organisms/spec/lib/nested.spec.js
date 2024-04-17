import { describe, it, expect } from 'vitest'

import {
	deriveNestedSchema,
	flattenElement,
	generateTreeTable,
	generateIndex
} from '../../src/lib/nested'

describe('nested', () => {
	describe('flattenElement', () => {
		it('should flatten an element', () => {
			const input = {
				key: 'test',
				value: 'test',
				type: 'string',
				scope: '#/test'
			}
			const result = flattenElement(input)
			expect(result).toEqual({
				[input.scope]: input
			})
		})

		it('should flatten an array element', () => {
			const input = {
				key: 'test',
				value: ['red', 'blue', 'green'],
				type: 'array',
				scope: '#/test'
			}
			const result = flattenElement(input)
			expect(result).toEqual({
				'#/test': {
					key: 'test',
					scope: '#/test',
					type: 'array',
					value: ['red', 'blue', 'green']
				},
				'#/test/[0]': { value: 'red', type: 'string', scope: '#/test/[0]', key: '[0]' },
				'#/test/[1]': { value: 'blue', type: 'string', scope: '#/test/[1]', key: '[1]' },
				'#/test/[2]': { value: 'green', type: 'string', scope: '#/test/[2]', key: '[2]' }
			})
		})

		it('should flatten an object element', () => {
			const input = {
				key: 'test',
				value: {
					red: '#FF0000',
					blue: '#0000FF',
					green: '#00FF00'
				},
				type: 'object',
				scope: '#/test'
			}
			const result = flattenElement(input)
			expect(result).toEqual({
				'#/test': {
					key: 'test',
					scope: '#/test',
					type: 'object',
					value: {
						blue: '#0000FF',
						green: '#00FF00',
						red: '#FF0000'
					}
				},
				'#/test/red': {
					key: 'red',
					scope: '#/test/red',
					type: 'string',
					value: '#FF0000'
				},
				'#/test/blue': {
					key: 'blue',
					scope: '#/test/blue',
					type: 'string',
					value: '#0000FF'
				},
				'#/test/green': {
					key: 'green',
					scope: '#/test/green',
					type: 'string',
					value: '#00FF00'
				}
			})
		})
	})

	describe('deriveNestedSchema', () => {
		it('should handle simple object', () => {
			const result = deriveNestedSchema({ count: 10, enabled: true, label: 'test' })
			expect(result).toEqual([
				{
					layout: {
						elements: [
							{
								label: 'count',
								scope: '#/count'
							},
							{
								label: 'enabled',
								scope: '#/enabled'
							},
							{
								label: 'label',
								scope: '#/label'
							}
						],
						type: 'vertical'
					},
					properties: {
						count: {
							default: 10,
							type: 'number'
						},
						enabled: {
							default: true,
							type: 'boolean'
						},
						label: {
							default: 'test',
							type: 'string'
						}
					},
					type: 'object'
				}
			])
		})

		it('should handle empty array', () => {
			const result = deriveNestedSchema({ items: [] })
			expect(result).toEqual([
				{
					default: [],
					items: {
						type: 'string'
					},
					layout: {
						type: 'vertical',
						elements: [
							{
								scope: '#'
							}
						]
					},
					key: 'items',
					scope: '#/items',
					type: 'array'
				}
			])
		})

		it('should handle string array', () => {
			const result = deriveNestedSchema({ items: ['red', 'blue', 'green'] })
			expect(result).toEqual([
				{
					default: [],
					items: {
						type: 'string'
					},
					layout: {
						type: 'vertical',
						elements: [
							{
								scope: '#'
							}
						]
					},
					key: 'items',
					scope: '#/items',
					type: 'array'
				}
			])
		})

		it('should handle object array', () => {
			const result = deriveNestedSchema({
				modules: [
					{
						name: 'module1',
						enabled: true
					},
					{
						name: 'module2',
						enabled: false
					}
				]
			})
			expect(result).toEqual([
				{
					default: [],
					items: {
						type: 'object',

						properties: {
							enabled: {
								type: 'boolean'
							},
							name: {
								type: 'string'
							}
						}
					},
					layout: {
						type: 'vertical',
						elements: [
							{
								label: 'name',
								scope: '#/name'
							},
							{
								label: 'enabled',
								scope: '#/enabled'
							}
						]
					},
					key: 'modules',
					scope: '#/modules',
					type: 'array'
				}
			])
		})

		it('should generate a nested schema', () => {
			const result = deriveNestedSchema({
				theme: {
					primary: {
						main: '#2196F3',
						count: 10,
						enabled: true
					}
				}
			})

			expect(result).toEqual([
				{
					children: [
						{
							key: 'primary',
							layout: {
								elements: [
									{
										label: 'main',
										scope: '#/main'
									},
									{
										label: 'count',
										scope: '#/count'
									},
									{
										label: 'enabled',
										scope: '#/enabled'
									}
								],
								type: 'vertical'
							},
							scope: '#/theme/primary',
							properties: {
								count: {
									default: 10,
									type: 'number'
								},
								enabled: {
									default: true,
									type: 'boolean'
								},
								main: {
									default: '#2196F3',
									type: 'string'
								}
							},
							type: 'object'
						}
					],
					key: 'theme',
					scope: '#/theme',
					type: 'object'
				}
			])
		})
	})
	describe('generateIndex', () => {
		it('should generate an index', () => {
			const input = [
				{ scope: '#/root' },
				{ scope: '#/root/child1' },
				{ scope: '#/root/child2' },
				{ scope: '#/anotherRoot' },
				{ scope: '#/anotherRoot/child1' }
			]
			const result = generateIndex(input)
			expect(result).toEqual([
				{
					_depth: 0,
					_isExpanded: true,
					_isParent: true,

					_levels: [0],
					_path: '#/anotherRoot',
					scope: '#/anotherRoot'
				},
				{
					_depth: 1,
					_isExpanded: true,
					_isParent: false,

					_levels: [0, 0],
					_path: '#/anotherRoot/child1',
					scope: '#/anotherRoot/child1'
				},
				{
					_depth: 0,
					_isExpanded: true,
					_isParent: true,

					_levels: [1],
					_path: '#/root',
					scope: '#/root'
				},
				{
					_depth: 1,
					_isExpanded: true,
					_isParent: false,

					_levels: [1, 0],
					_path: '#/root/child1',
					scope: '#/root/child1'
				},
				{
					_depth: 1,
					_isExpanded: true,
					_isParent: false,
					_levels: [1, 1],
					_path: '#/root/child2',
					scope: '#/root/child2'
				}
			])
		})
	})

	describe('generateTreeTable', () => {
		it('should generate an empty tree table', () => {
			let result = generateTreeTable(null)
			expect(result).toEqual([])
			result = generateTreeTable('')
			expect(result).toEqual([])
		})
		// it('should generate a tree table for object array', () => {
		// 	let result = generateTreeTable([
		// 		{ scope: '#/color', value: 'red' },
		// 		{ scope: '#/theme', value: 'ocean' }
		// 	])
		// 	expect(result).toEqual([
		// 		{
		// 			_depth: 0,
		// 			_isExpanded: true,
		// 			_isParent: true,

		// 			_levels: [0],
		// 			_path: '#/color',
		// 			scope: '#/color',
		// 			value: 'red'
		// 		},
		// 		{
		// 			_depth: 0,
		// 			_isExpanded: true,
		// 			_isParent: false,

		// 			_levels: [1],
		// 			_path: '#/theme',
		// 			scope: '#/theme',
		// 			value: 'ocean'
		// 		}
		// 	])
		// })
		it('should generate a tree table for object', () => {
			const result = generateTreeTable({
				red: '#FF0000',
				blue: '#0000FF',
				green: '#00FF00'
			})
			expect(result).toEqual([
				{
					_depth: 0,
					_isExpanded: true,
					_isParent: false,

					_levels: [0],
					_path: '#/blue',
					scope: '#/blue',
					key: 'blue',
					type: 'string',
					value: '#0000FF'
				},
				{
					_depth: 0,
					_isExpanded: true,
					_isParent: false,

					_levels: [1],
					_path: '#/green',
					scope: '#/green',
					key: 'green',
					type: 'string',
					value: '#00FF00'
				},
				{
					_depth: 0,
					_isExpanded: true,
					_isParent: false,

					_levels: [2],
					_path: '#/red',
					scope: '#/red',
					key: 'red',
					type: 'string',
					value: '#FF0000'
				}
			])
		})
	})
})
