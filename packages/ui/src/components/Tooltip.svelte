<script lang="ts">
	/**
	 * Tooltip — contextual text revealed on hover or focus.
	 *
	 * Wraps any trigger element. Tooltip appears after a configurable delay
	 * on mouseenter/focusin, hides immediately on mouseleave/focusout/Escape.
	 * Position auto-flips when the preferred side would overflow the viewport.
	 *
	 * Data attributes:
	 *   data-tooltip-root     — wrapper element (position: relative)
	 *   data-tooltip-content  — tooltip bubble
	 *   data-tooltip-position — actual position after auto-flip
	 *   data-tooltip-visible  — "true" while visible
	 */
	import type { TooltipProps } from '../types/tooltip.js'

	let {
		content = '',
		position = 'top',
		delay = 300,
		class: className,
		children,
		tooltipContent
	}: TooltipProps = $props()

	const id = `tt-${Math.random().toString(36).slice(2, 9)}`
	let visible = $state(false)
	let resolvedPosition = $state<'top' | 'bottom' | 'left' | 'right'>(position)
	let timer: ReturnType<typeof setTimeout> | null = null
	let rootEl = $state<HTMLElement | null>(null)
	let tooltipEl = $state<HTMLElement | null>(null)

	const GAP = 6

	function resolveFlip(
		triggerRect: DOMRect,
		tooltipRect: DOMRect,
		preferred: typeof position
	): typeof position {
		const vw = window.innerWidth
		const vh = window.innerHeight
		const fits: Record<string, boolean> = {
			top: triggerRect.top >= tooltipRect.height + GAP,
			bottom: triggerRect.bottom + tooltipRect.height + GAP <= vh,
			left: triggerRect.left >= tooltipRect.width + GAP,
			right: triggerRect.right + tooltipRect.width + GAP <= vw
		}
		if (fits[preferred]) return preferred
		const flip: Record<string, typeof position> = {
			top: 'bottom',
			bottom: 'top',
			left: 'right',
			right: 'left'
		}
		if (fits[flip[preferred]]) return flip[preferred]
		return (Object.keys(fits).find((p) => fits[p]) as typeof position) ?? preferred
	}

	function updatePosition() {
		if (!rootEl || !tooltipEl) return
		const triggerRect = rootEl.getBoundingClientRect()
		const tooltipRect = tooltipEl.getBoundingClientRect()
		resolvedPosition = resolveFlip(triggerRect, tooltipRect, position)
	}

	function show() {
		updatePosition()
		visible = true
	}

	function hide() {
		if (timer) clearTimeout(timer)
		visible = false
	}

	function onMouseEnter() {
		timer = setTimeout(show, delay)
	}

	function onMouseLeave() {
		if (timer) clearTimeout(timer)
		hide()
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') hide()
	}
</script>

<span
	data-tooltip-root
	aria-describedby={id}
	class={className || undefined}
	onmouseenter={onMouseEnter}
	onmouseleave={onMouseLeave}
	onfocusin={show}
	onfocusout={hide}
	onkeydown={onKeydown}
	bind:this={rootEl}
>
	{@render children?.()}
	<div
		data-tooltip-content
		data-tooltip-position={resolvedPosition}
		data-tooltip-visible={visible ? 'true' : 'false'}
		{id}
		role="tooltip"
		bind:this={tooltipEl}
	>
		{#if tooltipContent}
			{@render tooltipContent()}
		{:else}
			{content}
		{/if}
	</div>
</span>
