import { tick } from 'svelte'

export function scrollable(viewport, options) {
	let { items, start, limit, end } = options
	// local state
	let height_map = []
	let rows
	let top = 0
	let average_height
	let itemHeight

	let contents = viewport.querySelector('virtual-list-contents')
	let viewport_height = viewport.offsetHeight
	// let visible
	// let mounted
	if (limit && limit < items.length) {
		end = start + limit
	}
	async function refresh(items, viewport_height, itemHeight) {
		const { scrollTop } = viewport

		await tick() // wait until the DOM is up to date
		let content_height = top - scrollTop
		let i = start

		while (content_height < viewport_height && i < items.length) {
			let row = rows[i - start]

			if (!row) {
				end = i + 1
				await tick() // render the newly visible row
				row = rows[i - start]
			}

			const row_height = (height_map[i] = itemHeight || row.offsetHeight)
			content_height += row_height
			i += 1
		}

		end = i

		const remaining = items.length - end
		average_height = (top + content_height) / end

		contents.style.paddingBottom = remaining * average_height + 'px'
		height_map.length = items.length
	}

	async function handle_scroll() {
		const { scrollTop } = viewport
		const old_start = start

		for (let v = 0; v < rows.length; v += 1) {
			height_map[start + v] = itemHeight || rows[v].offsetHeight
		}

		let i = 0
		let y = 0

		while (i < items.length) {
			const row_height = height_map[i] || average_height
			if (y + row_height > scrollTop) {
				start = i
				top = y

				break
			}

			y += row_height
			i += 1
		}

		while (i < items.length) {
			y += height_map[i] || average_height
			i += 1

			if (y > scrollTop + viewport_height) break
		}

		end = i

		const remaining = items.length - end
		average_height = y / end

		while (i < items.length) height_map[i++] = average_height
		const bottom = remaining * average_height

		// prevent jumping if we scrolled up into unknown territory
		if (start < old_start) {
			await tick()

			let expected_height = 0
			let actual_height = 0

			for (let i = start; i < old_start; i += 1) {
				if (rows[i - start]) {
					expected_height += height_map[i]
					actual_height += itemHeight || rows[i - start].offsetHeight
				}
			}

			const d = actual_height - expected_height
			viewport.scrollTo(0, scrollTop + d)
		}
		viewport.dispatchEvent(new CustomEvent('sync', { detail: { start, end } }))
		contents.style.paddingTop = top + 'px'
		contents.style.paddingBottom = bottom + 'px'
		// TODO if we overestimated the space these
		// rows would occupy we may need to add some
		// more. maybe we can just call handle_scroll again?
	}
	const handle_click = async (e) => {}
	const handle_keydown = async (e) => {}

	viewport.addEventListener('scroll', handle_scroll)
	viewport.addEventListener('click', handle_click)
	viewport.addEventListener('keydown', handle_keydown)
	rows = viewport.getElementsByTagName('virtual-list-row')

	return {
		update: async ({ items, itemHeight }) => {
			// await refresh(items, viewport_height, itemHeight)
			// await handle_scroll()
		},
		destroy: () => {
			viewport.removeEventListener('scroll', handle_scroll)
			viewport.removeEventListener('click', handle_click)
			viewport.removeEventListener('keydown', handle_keydown)
		}
	}
}
