<script>
	// @ts-nocheck
	import { onMount } from 'svelte'
	import { afterNavigate } from '$app/navigation'

	let headings = $state([])
	let activeId = $state('')
	let observer = null

	function slugify(text) {
		return (text ?? '')
			.toLowerCase()
			.trim()
			.replace(/\s+/g, '-')
			.replace(/[^a-z0-9-]/g, '')
			.replace(/-+/g, '-')
			.replace(/^-|-$/g, '')
	}

	function scan() {
		const main = document.getElementById('main-content')
		if (!main) return
		const els = [...main.querySelectorAll('h2, h3')]
		headings = els.map((el, i) => {
			if (!el.id) {
				el.id = slugify(el.textContent) || `section-${i}`
			}
			return { id: el.id, text: el.textContent?.trim() ?? '', level: el.tagName.toLowerCase() }
		})
	}

	function observe() {
		observer?.disconnect()
		const main = document.getElementById('main-content')
		if (!main || headings.length === 0) return
		observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((e) => e.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
				if (visible.length > 0) activeId = visible[0].target.id
			},
			{ root: main, rootMargin: '-5% 0px -70% 0px' }
		)
		headings.forEach(({ id }) => {
			const el = document.getElementById(id)
			if (el) observer.observe(el)
		})
	}

	function scrollTo(id) {
		const el = document.getElementById(id)
		const container = document.getElementById('main-content')
		if (!el || !container) return
		container.scrollTo({ top: el.offsetTop - 16, behavior: 'smooth' })
	}

	onMount(() => {
		scan()
		observe()
		return () => observer?.disconnect()
	})

	afterNavigate(() => {
		activeId = ''
		scan()
		observe()
	})
</script>

{#if headings.length > 1}
	<nav aria-label="On this page">
		<p class="text-surface-z4 mb-3 text-[11px] font-bold tracking-widest uppercase opacity-60">
			On this page
		</p>
		<ul class="border-surface-z3 m-0 flex list-none flex-col gap-0.5 border-l p-0">
			{#each headings as h}
				<li>
					<button
						class="hover:text-surface-z8 -ml-px block w-full cursor-pointer border-l-2 border-transparent bg-transparent py-[0.3rem] text-left font-[inherit] text-[0.8125rem] leading-[1.5] no-underline transition-colors"
						class:text-surface-z5={activeId !== h.id}
						class:text-secondary-z7={activeId === h.id}
						class:border-l-secondary-z7={activeId === h.id}
						class:font-medium={activeId === h.id}
						class:pl-[1.75rem]={h.level === 'h3'}
						class:pl-[0.625rem]={h.level === 'h2'}
						onclick={() => scrollTo(h.id)}
					>
						{h.text}
					</button>
				</li>
			{/each}
		</ul>
	</nav>
{/if}
