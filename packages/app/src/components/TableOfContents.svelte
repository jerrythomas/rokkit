<script>
	// @ts-nocheck
	import { navigable } from '@rokkit/actions'
	import { onMount } from 'svelte'

	let { container = 'main-content' } = $props()

	let headings = $state([])
	let activeId = $state('')
	let focusedIndex = $state(0)
	let navEl = $state(null)
	let observer = null
	let scrollLockTimer = null

	function slugify(text) {
		return (text ?? '')
			.toLowerCase()
			.trim()
			.replace(/\s+/g, '-')
			.replace(/[^a-z0-9-]/g, '')
			.replace(/-+/g, '-')
			.replace(/^-|-$/g, '')
	}

	function getContainer() {
		return document.getElementById(container)
	}

	function scan() {
		const main = getContainer()
		if (!main) return
		const els = [...main.querySelectorAll('h2, h3')]
		headings = els.map((el, i) => {
			if (!el.id) el.id = slugify(el.textContent) || `section-${i}`
			return { id: el.id, text: el.textContent?.trim() ?? '', level: el.tagName.toLowerCase() }
		})
	}

	function observe() {
		observer?.disconnect()
		const main = getContainer()
		if (!main || headings.length === 0) return
		observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((e) => e.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
				if (visible.length > 0 && !scrollLockTimer) activeId = visible[0].target.id
			},
			{ root: main, rootMargin: '-5% 0px -70% 0px' }
		)
		headings.forEach(({ id }) => {
			const el = document.getElementById(id)
			if (el) observer.observe(el)
		})
	}

	function scrollToHeading(id) {
		const el = document.getElementById(id)
		const main = getContainer()
		if (!el || !main) return
		clearTimeout(scrollLockTimer)
		scrollLockTimer = setTimeout(() => {
			scrollLockTimer = null
		}, 1000)
		main.scrollTo({ top: el.offsetTop - 16, behavior: 'smooth' })
	}

	export function rescan() {
		activeId = ''
		focusedIndex = 0
		scan()
		observe()
	}

	function getItems() {
		return navEl?.querySelectorAll('[data-toc-item]') ?? []
	}

	function handlePrevious() {
		if (focusedIndex > 0) {
			focusedIndex -= 1
			getItems()[focusedIndex]?.focus()
		}
	}

	function handleNext() {
		if (focusedIndex < headings.length - 1) {
			focusedIndex += 1
			getItems()[focusedIndex]?.focus()
		}
	}

	function handleSelect() {
		const id = headings[focusedIndex]?.id
		if (id) activeId = id
		scrollToHeading(id)
	}

	onMount(() => {
		scan()
		observe()
		return () => {
			observer?.disconnect()
			clearTimeout(scrollLockTimer)
		}
	})
</script>

{#if headings.length > 1}
	<nav
		bind:this={navEl}
		data-toc
		aria-label="On this page"
		use:navigable
		onprevious={handlePrevious}
		onnext={handleNext}
		onselect={handleSelect}
	>
		<p data-toc-label>On this page</p>
		<ul data-toc-list>
			{#each headings as h, i (h.id)}
				<li>
					<button
						data-toc-item
						data-toc-level={h.level}
						data-toc-index={i}
						data-toc-active={activeId === h.id ? '' : undefined}
						data-toc-focused={focusedIndex === i ? '' : undefined}
						tabindex={focusedIndex === i ? 0 : -1}
						onfocusin={() => (focusedIndex = i)}
						onclick={() => {
							focusedIndex = i
							activeId = h.id
							scrollToHeading(h.id)
						}}
					>
						{h.text}
					</button>
				</li>
			{/each}
		</ul>
	</nav>
{/if}
