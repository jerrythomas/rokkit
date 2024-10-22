<script>
	import { run } from 'svelte/legacy';

	import { createEventDispatcher } from 'svelte'
	import { defaultFields, compact } from '@rokkit/core'
	import {
		dimensionAttributes,
		virtualListViewport,
		getClosestAncestorWithAttribute
	} from '@rokkit/actions'
	import { Item } from '@rokkit/molecules'
	import { getListPosition } from './lib/select'

	const dispatch = createEventDispatcher()

	/**
	 * @typedef {Object} Props
	 * @property {any} [value]
	 * @property {any} [items]
	 * @property {any} [fields]
	 * @property {any} [using]
	 * @property {string} [size]
	 * @property {boolean} [horizontal]
	 * @property {number} [minSize]
	 * @property {any} [limit]
	 * @property {any} [anchor]
	 * @property {number} [start]
	 * @property {number} [end]
	 * @property {number} [tabindex]
	 * @property {number} [gap]
	 * @property {import('svelte').Snippet<[any]>} [children]
	 */

	/** @type {Props} */
	let {
		value = $bindable(null),
		items = [],
		fields = $bindable({}),
		using = $bindable({}),
		size = $bindable('100%'),
		horizontal = false,
		minSize = 40,
		limit = null,
		anchor = null,
		start = $bindable(0),
		end = $bindable(0),
		tabindex = 0,
		gap = 1,
		children
	} = $props();

	let height = $state(null)
	let width = $state(null)

	const viewport = virtualListViewport({
		gap,
		items,
		value,
		minSize,
		maxVisible: limit
	})
	const bounds = viewport.bounds
	const space = viewport.space

	let index = -1
	let current = $state(-1)
	let root = $state()
	let elements = $state([])

	function getKeyboardActions(viewport, horizontal = false) {
		return compact({
			ArrowUp: horizontal ? null : () => viewport.previous(),
			ArrowDown: horizontal ? null : () => viewport.next(),
			ArrowLeft: !horizontal ? null : () => viewport.previous(),
			ArrowRight: !horizontal ? null : () => viewport.next(),
			Home: () => viewport.first(),
			End: () => viewport.last(),
			PageUp: () => viewport.previousPage(),
			PageDown: () => viewport.nextPage()
		})
	}
	const handleClick = (event) => {
		const target = getClosestAncestorWithAttribute(event.target, 'data-path')
		if (target) {
			index = parseInt(target.getAttribute('data-path'), 10)
			if (index > -1) {
				value = items[index]
				viewport.update({ value })
				dispatch('select', { index, value })
			}
		}
	}
	const handleScroll = () => {
		viewport.scrollTo(root[props.scroll])
	}

	const handleScrollEnd = () => {
		root.scrollTo(0, $space.before)
	}

	const handleKeydown = (event) => {
		event.preventDefault()

		if (event.key in keyboardActions) {
			keyboardActions[event.key]()
			if (index !== viewport.index) {
				index = viewport.index
				value = items[index]
				viewport.update({ value })
				dispatch('move', { index, value })
			}
		} else if (['Enter', ' '].includes(event.key) && viewport.index !== -1) {
			index = viewport.index
			value = items[index]
			current = index
			viewport.update({ value })
			dispatch('select', { index, value })
		} else if (event.key === 'Escape') {
			dispatch('cancel')
		}
	}

	const props = horizontal ? dimensionAttributes.horizontal : dimensionAttributes.vertical
	run(() => {
		using = { default: Item, ...using }
	});
	let keyboardActions = $derived(getKeyboardActions(viewport, horizontal))
	run(() => {
		start = $bounds?.lower
	});
	run(() => {
		end = $bounds?.upper
	});
	let sizes = $derived(elements.map((element) => element[props.offset]))
	run(() => {
		viewport.update({
			items,
			value,
			sizes,
			visibleSize: horizontal ? width : height
		})
	});
	let visible = $derived(items.slice(start, end).map((data, i) => {
		return { index: i + start, data }
	}))
	run(() => {
		if ($space.visible) size = $space.visible + 'px'
	});
	run(() => {
		if (root) root.scrollTo(0, $space.before)
	});
	run(() => {
		fields = { ...defaultFields, ...fields }
	});
	let listStyle = $derived(horizontal ? `width: ${size};` : `height: ${size};` + getListPosition(anchor, root))
</script>

<virtual-list>
	<virtual-list-viewport
		onclick={handleClick}
		onkeydown={handleKeydown}
		onscroll={handleScroll}
		onscrollend={handleScrollEnd}
		role="listbox"
		style={listStyle}
		class="relative block"
		bind:clientHeight={height}
		bind:clientWidth={width}
		bind:this={root}
		class:overflow-y-auto={!horizontal}
		class:overflow-x-auto={horizontal}
		{tabindex}
	>
		<virtual-list-contents
			class="block"
			style:padding-top={$space.before + 'px'}
			style:padding-bottom={$space.after + 'px'}
		>
			{#each visible as row, index (row.index)}
				<virtual-list-item
					data-path={row.index}
					aria-selected={value === row.data}
					aria-current={current === row.index}
					bind:this={elements[index]}
				>
					{#if children}{@render children({ item: row.data, })}{:else}
						<using.default {fields} value={row.data} />
					{/if}
				</virtual-list-item>
			{/each}
		</virtual-list-contents>
	</virtual-list-viewport>
</virtual-list>

<style>
	virtual-list-viewport {
		-webkit-overflow-scrolling: touch;
	}
</style>
