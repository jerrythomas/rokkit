/**
 * Lock a subtree to a fixed color mode, regardless of the document mode.
 *
 * Makes the element a theme context identical to the document root, but with
 * `mode` forced: it mirrors the root's `data-style` / `data-skin` /
 * `data-density` (the attributes `themable` writes — see themable.svelte.js)
 * onto the element and sets `data-mode` to the locked value. It follows runtime
 * style/skin/density changes via a MutationObserver on the document root; only
 * `mode` stays pinned.
 *
 * Note: the locked mode is fixed at mount — to change it, re-mount the element
 * (e.g. via a Svelte {#key} block).
 *
 * @param {HTMLElement} node
 * @param {'dark'|'light'} mode
 */

const MIRRORED = ['style', 'skin', 'density']

function syncFromRoot(node, mode) {
	const root = document.documentElement
	for (const key of MIRRORED) {
		const value = root.dataset[key]
		if (value == null) delete node.dataset[key]
		else node.dataset[key] = value
	}
	node.dataset.mode = mode
}

export function lockMode(node, mode) {
	$effect(() => {
		if (typeof document === 'undefined') return
		syncFromRoot(node, mode)
		const observer = new MutationObserver(() => syncFromRoot(node, mode))
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-style', 'data-skin', 'data-density']
		})
		// Mirrored attrs are intentionally NOT removed on disconnect — the
		// wrapper element is orphaned on unmount.
		return () => observer.disconnect()
	})
}
