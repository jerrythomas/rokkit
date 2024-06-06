<script>
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

	export let value = null
	export let items = []
	export let fields = {}
	export let using = {}
	export let size = '100%'
	export let horizontal = false
	export let minSize = 40
	export let limit = null
	export let anchor = null
	export let start = 0
	export let end = 0
	export let tabindex = 0
	export let gap = 1

	let height = null
	let width = null

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
	let current = -1
	let root
	let elements = []

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
	$: using = { default: Item, ...using }
	$: keyboardActions = getKeyboardActions(viewport, horizontal)
	$: start = $bounds?.lower
	$: end = $bounds?.upper
	$: sizes = elements.map((element) => element[props.offset])
	$: viewport.update({
		items,
		value,
		sizes,
		visibleSize: horizontal ? width : height
	})
	$: visible = items.slice(start, end).map((data, i) => {
		return { index: i + start, data }
	})
	$: if ($space.visible) size = $space.visible + 'px'
	$: if (root) root.scrollTo(0, $space.before)
	$: fields = { ...defaultFields, ...fields }
	$: listStyle = horizontal ? `width: ${size};` : `height: ${size};` + getListPosition(anchor, root)
</script>

<virtual-list>
	<virtual-list-viewport
		on:click={handleClick}
		on:keydown={handleKeydown}
		on:scroll={handleScroll}
		on:scrollend={handleScrollEnd}
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
					<slot item={row.data}>
						<svelte:component this={using.default} {fields} value={row.data} />
					</slot>
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
