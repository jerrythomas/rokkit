import { vi } from 'vitest'

export function createEvent(x, y) {
	return {
		clientX: x,
		clientY: y,
		stopPropagation: vi.fn(),
		preventDefault: vi.fn()
	}
}
