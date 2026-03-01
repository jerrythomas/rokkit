import { describe, it, expect } from 'vitest'
// skipcq: JS-C1003 - Importing all components for verification
import * as components from '../src/index.js'

describe('components', () => {
	it('should contain all exported components', () => {
		expect(Object.keys(components)).toEqual([
			'TableController',
			'Proxy',
			'vibe',
			'ListController',
			'messages',
			'AbstractWrapper',
			'ProxyItem',
			'LazyProxyItem',
			'buildProxyList',
			'buildFlatView',
			'PROXY_ITEM_FIELDS',
			'BASE_FIELDS',
			'ProxyTree',
			'Wrapper',
			'LazyWrapper'
		])
	})
})
