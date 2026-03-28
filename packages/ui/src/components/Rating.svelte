<script lang="ts">
	import { DEFAULT_STATE_ICONS } from '@rokkit/core'
	import { messages } from '@rokkit/states'

	interface RatingIcons {
		filled?: string
		empty?: string
		half?: string
	}

	interface RatingProps {
		/** Current rating value (bindable) */
		value?: number
		/** Maximum number of stars (default: 5) */
		max?: number
		/** Disabled state */
		disabled?: boolean
		/** Custom icons for rating states */
		icons?: RatingIcons
		/** Called when value changes */
		onchange?: (value: number) => void
		/** Additional CSS class */
		class?: string
	}

	let {
		value = $bindable(0),
		max = 5,
		disabled = false,
		label = messages.rating.label,
		icons: userIcons = {} as RatingIcons,
		onchange,
		class: className = ''
	}: RatingProps & { label?: string } = $props()

	const icons = $derived({ ...DEFAULT_STATE_ICONS.rating, ...userIcons })

	let hoverIndex = $state(-1)

	function handleClick(index: number) {
		if (disabled) return
		// Clicking same star toggles to 0, otherwise set to index + 1
		const newValue = value === index + 1 ? 0 : index + 1
		value = newValue
		onchange?.(newValue)
	}

	function setRating(newValue: number) {
		value = newValue
		onchange?.(newValue)
	}

	function tryDigitKey(key: string): boolean {
		const digit = parseInt(key, 10)
		if (isNaN(digit) || digit < 0 || digit > max) return false
		setRating(digit)
		return true
	}

	function isIncreaseKey(key: string): boolean {
		return key === 'ArrowRight' || key === 'ArrowUp'
	}

	function isDecreaseKey(key: string): boolean {
		return key === 'ArrowLeft' || key === 'ArrowDown'
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (disabled) return

		if (isIncreaseKey(event.key)) {
			event.preventDefault()
			setRating(Math.min(value + 1, max))
		} else if (isDecreaseKey(event.key)) {
			event.preventDefault()
			setRating(Math.max(value - 1, 0))
		} else if (tryDigitKey(event.key)) {
			event.preventDefault()
		}
	}
</script>

<div
	data-rating
	data-rating-disabled={disabled || undefined}
	class={className || undefined}
	role="radiogroup"
	aria-label={label}
	aria-disabled={disabled || undefined}
	tabindex={disabled ? undefined : 0}
	onkeydown={handleKeyDown}
>
	{#each Array(max) as _, index (index)}
		{@const filled = index < value}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<span
			data-rating-item
			data-filled={filled || undefined}
			data-hovering={index <= hoverIndex || undefined}
			role="radio"
			tabindex={-1}
			aria-checked={filled}
			aria-label="Rate {index + 1} of {max}"
			onclick={() => handleClick(index)}
			onmouseenter={() => {
				if (!disabled) hoverIndex = index
			}}
			onmouseleave={() => {
				hoverIndex = -1
			}}
		>
			<span data-rating-icon class={filled ? icons.filled : icons.empty} aria-hidden="true"></span>
		</span>
	{/each}
</div>
