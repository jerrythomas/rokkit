<script lang="ts">
	import type { RangeProps } from '../types/range.js'
	import { generateTicks } from '@rokkit/core'
	import { pannable } from '@rokkit/actions'
	import { messages } from '@rokkit/states'

	let {
		value = $bindable(50),
		lower = $bindable(0),
		upper = $bindable(100),
		min = 0,
		max = 100,
		step = 1,
		range: rangeMode = false,
		ticks = 0,
		labelSkip = 0,
		disabled = false,
		labels: userLabels = {},
		onchange,
		class: className = ''
	}: RangeProps & { labels?: Record<string, string> } = $props()

	const labels = $derived({ ...messages.current.range, ...userLabels })

	// ─── Pixel state ────────────────────────────────────────────────
	let trackWidth = $state(0)

	// ─── Helpers ────────────────────────────────────────────────────

	function inverseLerp(val: number, lo: number, hi: number): number {
		if (hi === lo) return 0
		return (val - lo) / (hi - lo)
	}

	function valueToPercent(val: number): number {
		return inverseLerp(val, min, max) * 100
	}

	function pixelToValue(px: number): number {
		if (trackWidth === 0) return min
		return min + (px / trackWidth) * (max - min)
	}

	function clamp(val: number, lo: number, hi: number): number {
		return Math.min(Math.max(val, lo), hi)
	}

	function snapToStep(val: number): number {
		if (step <= 0) return val
		return Math.round((val - min) / step) * step + min
	}

	function fireChange() {
		if (rangeMode) {
			onchange?.([lower, upper])
		} else {
			onchange?.(value)
		}
	}

	// ─── Derived positions (percentages) ────────────────────────────

	let selectedLeft = $derived(rangeMode ? valueToPercent(lower) : 0)
	let selectedWidth = $derived(
		rangeMode ? valueToPercent(upper) - valueToPercent(lower) : valueToPercent(value)
	)

	// ─── Ticks ──────────────────────────────────────────────────────

	let tickStep = $derived(ticks > 0 ? Math.max(1, Math.round((max - min) / ticks)) : 0)
	let tickItems = $derived(
		ticks > 0 ? generateTicks(min, max, tickStep, labelSkip > 0 ? labelSkip + 1 : 1) : []
	)

	// ─── Thumb drag — upper (or single) ─────────────────────────────

	let slidingUpper = $state(false)

	function handleUpperPanStart() {
		if (disabled) return
		slidingUpper = true
	}

	function panUpperBy(dx: number) {
		const currentPx = inverseLerp(rangeMode ? upper : value, min, max) * trackWidth
		const minPx = rangeMode ? inverseLerp(lower, min, max) * trackWidth : 0
		const newPx = clamp(currentPx + dx, minPx, trackWidth)
		const snapped = snapToStep(clamp(pixelToValue(newPx), rangeMode ? lower : min, max))
		if (rangeMode) upper = snapped
		else value = snapped
	}

	function handleUpperPanMove(event: CustomEvent) {
		if (disabled || trackWidth === 0) return
		panUpperBy(event.detail.dx as number)
		fireChange()
	}

	function handleUpperPanEnd() {
		slidingUpper = false
		// Final snap
		if (rangeMode) {
			upper = snapToStep(clamp(upper, lower, max))
		} else {
			value = snapToStep(clamp(value, min, max))
		}
		fireChange()
	}

	function nudgeUpper(delta: number) {
		const increment = step > 0 ? step : (max - min) / 10
		if (rangeMode) upper = clamp(snapToStep(upper + delta * increment), lower, max)
		else value = clamp(snapToStep(value + delta * increment), min, max)
	}

	function jumpUpper(toEnd: boolean) {
		if (rangeMode) upper = toEnd ? max : lower
		else value = toEnd ? max : min
	}

	function isIncreaseKey(key: string): boolean {
		return key === 'ArrowRight' || key === 'ArrowUp'
	}

	function isDecreaseKey(key: string): boolean {
		return key === 'ArrowLeft' || key === 'ArrowDown'
	}

	function applyUpperKey(key: string): boolean {
		if (isIncreaseKey(key)) {
			nudgeUpper(1)
			return true
		}
		if (isDecreaseKey(key)) {
			nudgeUpper(-1)
			return true
		}
		if (key === 'Home') {
			jumpUpper(false)
			return true
		}
		if (key === 'End') {
			jumpUpper(true)
			return true
		}
		return false
	}

	function handleUpperKeyDown(event: KeyboardEvent) {
		if (disabled) return
		if (applyUpperKey(event.key)) {
			event.preventDefault()
			fireChange()
		}
	}

	// ─── Thumb drag — lower (range mode only) ───────────────────────

	let slidingLower = $state(false)

	function handleLowerPanStart() {
		if (disabled) return
		slidingLower = true
	}

	function handleLowerPanMove(event: CustomEvent) {
		if (disabled || trackWidth === 0) return
		const dx = event.detail.dx as number
		const currentPx = inverseLerp(lower, min, max) * trackWidth
		const newPx = clamp(currentPx + dx, 0, inverseLerp(upper, min, max) * trackWidth)
		const raw = pixelToValue(newPx)
		lower = snapToStep(clamp(raw, min, upper))
		fireChange()
	}

	function handleLowerPanEnd() {
		slidingLower = false
		lower = snapToStep(clamp(lower, min, upper))
		fireChange()
	}

	function nudgeLower(delta: number) {
		const increment = step > 0 ? step : (max - min) / 10
		lower = clamp(snapToStep(lower + delta * increment), min, upper)
	}

	function applyLowerKey(key: string): boolean {
		if (isIncreaseKey(key)) {
			nudgeLower(1)
			return true
		}
		if (isDecreaseKey(key)) {
			nudgeLower(-1)
			return true
		}
		if (key === 'Home') {
			lower = min
			return true
		}
		if (key === 'End') {
			lower = upper
			return true
		}
		return false
	}

	function handleLowerKeyDown(event: KeyboardEvent) {
		if (disabled) return
		if (applyLowerKey(event.key)) {
			event.preventDefault()
			fireChange()
		}
	}

	// ─── Track click ────────────────────────────────────────────────

	function handleTrackClick(event: MouseEvent) {
		if (disabled) return
		const target = event.currentTarget as HTMLElement
		const rect = target.getBoundingClientRect()
		const px = event.clientX - rect.left
		const raw = pixelToValue(px)
		const snapped = snapToStep(clamp(raw, min, max))

		if (rangeMode) {
			// Click closer to lower → adjust lower, else adjust upper
			const distLower = Math.abs(snapped - lower)
			const distUpper = Math.abs(snapped - upper)
			if (distLower < distUpper) {
				lower = clamp(snapped, min, upper)
			} else {
				upper = clamp(snapped, lower, max)
			}
		} else {
			value = snapped
		}
		fireChange()
	}

	// ─── Tick click ─────────────────────────────────────────────────

	function handleTickClick(tickValue: number) {
		if (disabled) return
		const snapped = snapToStep(clamp(tickValue, min, max))

		if (rangeMode) {
			const distLower = Math.abs(snapped - lower)
			const distUpper = Math.abs(snapped - upper)
			if (distLower < distUpper) {
				lower = clamp(snapped, min, upper)
			} else {
				upper = clamp(snapped, lower, max)
			}
		} else {
			value = snapped
		}
		fireChange()
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div data-range data-disabled={disabled || undefined} class={className || undefined}>
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div data-range-track onclick={handleTrackClick}>
		<div data-range-bar bind:clientWidth={trackWidth}></div>
		<div data-range-selected style:left="{selectedLeft}%" style:width="{selectedWidth}%"></div>

		{#if rangeMode}
			<!-- Lower thumb -->
			<div
				data-range-thumb
				data-thumb="lower"
				data-sliding={slidingLower || undefined}
				style:left="{valueToPercent(lower)}%"
				tabindex={disabled ? -1 : 0}
				use:pannable
				onpanstart={handleLowerPanStart}
				onpanmove={handleLowerPanMove}
				onpanend={handleLowerPanEnd}
				onkeydown={handleLowerKeyDown}
				onfocus={() => {
					if (!disabled) slidingLower = true
				}}
				onblur={() => {
					slidingLower = false
				}}
				role="slider"
				aria-valuenow={lower}
				aria-valuemin={min}
				aria-valuemax={upper}
				aria-disabled={disabled || undefined}
				aria-label={labels.lower}
			></div>
		{/if}

		<!-- Upper thumb (or single thumb) -->
		<div
			data-range-thumb
			data-thumb={rangeMode ? 'upper' : 'value'}
			data-sliding={slidingUpper || undefined}
			style:left="{valueToPercent(rangeMode ? upper : value)}%"
			tabindex={disabled ? -1 : 0}
			use:pannable
			onpanstart={handleUpperPanStart}
			onpanmove={handleUpperPanMove}
			onpanend={handleUpperPanEnd}
			onkeydown={handleUpperKeyDown}
			onfocus={() => {
				if (!disabled) slidingUpper = true
			}}
			onblur={() => {
				slidingUpper = false
			}}
			role="slider"
			aria-valuenow={rangeMode ? upper : value}
			aria-valuemin={rangeMode ? lower : min}
			aria-valuemax={max}
			aria-disabled={disabled || undefined}
			aria-label={rangeMode ? labels.upper : labels.value}
		></div>
	</div>

	{#if tickItems.length > 0}
		<div data-range-ticks style:--count={tickItems.length - 1}>
			{#each tickItems as tick (tick.value)}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<div
					data-range-tick
					data-disabled={disabled || undefined}
					role="option"
					aria-selected={false}
					aria-disabled={disabled || undefined}
					tabindex={disabled ? -1 : 0}
					onclick={() => handleTickClick(tick.value)}
				>
					<div data-tick-bar></div>
					{#if tick.label !== ''}
						<span data-tick-label>{tick.label}</span>
					{:else}
						<span data-tick-label></span>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
