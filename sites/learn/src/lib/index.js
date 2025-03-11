// place files you want to import through the `$lib` alias in this folder.
//
/**
 * Finds an item in the menu based on the URL.
 * @param {Array<any>} menu
 * @param {*} url
 * @returns {any}
 */
export function findItemInMenu(menu, url) {
	for (const item of menu) {
		if (item.route && url.pathname.endsWith(item.route)) return item
		if (item.children) {
			const found = findItemInMenu(item.children, url)
			if (found) return found
		}
	}
	return null
}
