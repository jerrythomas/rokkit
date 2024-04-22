export const mockStore = {
	moveUp: vi.fn(),
	moveDown: vi.fn(),
	moveLeft: vi.fn(),
	moveRight: vi.fn(),
	moveFirst: vi.fn(),
	moveLast: vi.fn(),
	select: vi.fn(),
	selectAll: vi.fn(),
	selectNone: vi.fn(),
	selectInvert: vi.fn(),
	selectRange: vi.fn(),
	onNavigate: vi.fn(),
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
	currentItem: vi.fn(() => ({ index: [0] }))
}
