import { vi } from 'vitest'

export const mockStore = {
	getEvents: vi.fn().mockReturnValue([]),
	moveTo: vi.fn(),
	moveByOffset: vi.fn(),
	moveFirst: vi.fn(),
	moveLast: vi.fn(),
	collapse: vi.fn(),
	expand: vi.fn(),
	select: vi.fn(),
	selectAll: vi.fn(),
	selectNone: vi.fn(),
	selectInvert: vi.fn(),
	selectRange: vi.fn(),
	toggleExpansion: vi.fn(),
	toggleSelection: vi.fn(),
	cut: vi.fn(),
	copy: vi.fn(),
	paste: vi.fn(),
	undo: vi.fn(),
	redo: vi.fn(),
	escape: vi.fn(),
	dragStart: vi.fn(),
	dragOver: vi.fn(),
	dropOver: vi.fn(),
	currentItem: vi.fn(() => ({ indexPath: [0] }))
}
