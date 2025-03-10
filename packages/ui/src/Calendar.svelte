<script>
	import { format, isSameDay, addMonths } from 'date-fns'
	import { weekdays, getCalendarDays } from '@rokkit/core'

	/**
	 * @typedef {Object} Props
	 * @property {any} [value]
	 * @property {any} [holidays]
	 * @property {boolean} [fixed]
	 */

	/** @type {Props} */
	let { value = $bindable(new Date()), holidays = [], fixed = true } = $props()

	function handleChange(event) {
		value = new Date(event.target.value, value.getMonth(), value.getDate())
	}
	function nextMonth() {
		value = addMonths(value, 1)
	}
	function previousMonth() {
		value = addMonths(value, -1)
	}

	let year = $derived(value.getFullYear())
	let days = $derived(getCalendarDays(value, holidays, fixed))
</script>

<calendar class="mx-auto flex select-none flex-col items-center">
	<month-year class="flex h-10 w-full flex-row items-center">
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<square
			class="cursor-pointer select-none"
			onclick={previousMonth}
			role="option"
			aria-selected={false}
			tabindex="0"
		>
			<icon class="chevron-left"></icon>
		</square>
		<span class="gap-1px flex flex-grow items-center justify-center">
			<p>{format(value, 'MMMM')}</p>
			<input
				type="number"
				value={year}
				class="flex w-14 flex-grow-0 border-none bg-transparent"
				onchange={handleChange}
			/>
		</span>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<square
			class="cursor-pointer select-none"
			onclick={nextMonth}
			role="option"
			aria-selected={false}
			tabindex="0"
		>
			<icon class="chevron-right"></icon>
		</square>
	</month-year>
	<cal-body class="flex w-full cursor-pointer flex-col p-1">
		<days-of-week class="grid grid-cols-7">
			{#each weekdays as day, index}
				<p class:weekend={index % 6 === 0}>
					{day.slice(0, 1)}
				</p>
			{/each}
		</days-of-week>
		<days-of-month class="grid grid-cols-7 grid-rows-5">
			{#each days as { day, offset, date, weekend }}
				{@const start = offset > 0 ? offset : 'auto'}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<day-of-month
					class:weekend
					style:grid-column-start={start}
					onclick={() => (value = date)}
					role="option"
					aria-selected={isSameDay(date, value)}
					tabindex="0"
				>
					{day}
				</day-of-month>
			{/each}
		</days-of-month>
	</cal-body>
</calendar>

<style>
	days-of-week p,
	day-of-month {
		@apply flex items-center justify-center;
	}
</style>
