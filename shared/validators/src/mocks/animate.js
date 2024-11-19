import { vi } from 'vitest'

// Mock the animate function
if (!global.Element.prototype.animate) {
	global.Element.prototype.animate = vi.fn().mockImplementation(() => {
		return {
			play: vi.fn(),
			pause: vi.fn(),
			finish: vi.fn(),
			cancel: vi.fn(),
			reverse: vi.fn(),
			persist: vi.fn(),
			onfinish: null,
			oncancel: null,
			currentTime: 0,
			startTime: 0,
			playbackRate: 1,
			playState: 'idle',
			finished: Promise.resolve(),
			effect: {
				getTiming: vi.fn(),
				getComputedTiming: vi.fn()
			}
		}
	})
}
