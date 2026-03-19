import { vi } from 'vitest'

// Mock the animate function and getAnimations (used by Svelte's flip/transition)
if (!global.Element.prototype.getAnimations) {
	global.Element.prototype.getAnimations = vi.fn().mockReturnValue([])
}

if (!global.Element.prototype.animate) {
	global.Element.prototype.animate = vi.fn().mockImplementation(() => {
		// Use getter/setter so Svelte's `animation.onfinish = callback` assignment
		// immediately queues the callback, simulating instant animation completion.
		let _onfinish = null
		let _oncancel = null
		return {
			play: vi.fn(),
			pause: vi.fn(),
			finish: vi.fn(),
			cancel: vi.fn(),
			reverse: vi.fn(),
			persist: vi.fn(),
			get onfinish() {
				return _onfinish
			},
			set onfinish(cb) {
				_onfinish = cb
				if (cb) queueMicrotask(() => cb())
			},
			get oncancel() {
				return _oncancel
			},
			set oncancel(cb) {
				_oncancel = cb
			},
			currentTime: 0,
			startTime: 0,
			playbackRate: 1,
			playState: 'finished',
			finished: Promise.resolve(),
			effect: {
				getTiming: vi.fn(),
				getComputedTiming: vi.fn()
			}
		}
	})
}
