import { describe, it, expect, beforeEach } from 'vitest'
import { getListPosition } from '../../src/lib/select'

describe('getPosition', () => {
	let anchorProps = {}
	const viewport = {
		getBoundingClientRect: () => ({ width: 100, height: 100 })
	}
	const anchor = {
		getBoundingClientRect: () => anchorProps
	}

	beforeEach(() => {})

	it('should return viewport position for top left', () => {
		anchorProps = { top: 10, left: 20, width: 80, height: 40 }
		const result = getListPosition(anchor, viewport)
		expect(result).toEqual('left: 20px;top: 50px;')
	})

	it('should return viewport position for top right', () => {
		anchorProps = { top: 10, left: 1024 - 80, width: 80, height: 40 }
		const result = getListPosition(anchor, viewport)
		expect(result).toEqual('right: 0px;top: 50px;')
	})

	it('should return viewport position for bottom right', () => {
		anchorProps = { top: 768 - 40, left: 1024 - 80, width: 80, height: 40 }
		const result = getListPosition(anchor, viewport)
		expect(result).toEqual('right: 0px;bottom: 40px;')
	})

	it('should return viewport position for bottom left', () => {
		anchorProps = { top: 768 - 40, left: 10, width: 80, height: 40 }
		const result = getListPosition(anchor, viewport)
		expect(result).toEqual('left: 10px;bottom: 40px;')
	})
})
