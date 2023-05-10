import { vi } from 'vitest'

export function createEvent(x, y) {
	return {
		clientX: x,
		clientY: y,
		stopPropagation: vi.fn(),
		preventDefault: vi.fn()
	}
}
export function createTouchEvent(clientX, clientY) {
	return {
		touches: [{ clientX, clientY }],
		preventDefault: vi.fn(),
		stopPropagation: vi.fn()
	}
}
