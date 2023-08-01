<script>
	import { format, isSameDay, addMonths } from 'date-fns'
	import { weekdays, getCalendarDays } from '@rokkit/core'

	export let value = new Date()
	export let holidays = []
	export let fixed = true

	function handleChange(event) {
		value = new Date(event.target.value, value.getMonth(), value.getDate())
	}
	function nextMonth() {
		value = addMonths(value, 1)
	}
	function previousMonth() {
		value = addMonths(value, -1)
	}

	$: year = value.getFullYear()
	$: days = getCalendarDays(value, holidays, fixed)
</script>

<calendar class="mx-auto flex flex-col select-none items-center">
	<month-year class="h-10 w-full flex flex-row items-center">
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<square
			class="cursor-pointer select-none"
			on:click={previousMonth}
			role="option"
			aria-selected={false}
			tabindex="0"
		>
			<icon class="i-carbon-chevron-left" />
		</square>
		<span class="flex flex-grow items-center justify-center gap-1px">
			<p>{format(value, 'MMMM')}</p>
			<input
				type="number"
				value={year}
				class="w-14 flex flex-grow-0 border-none bg-transparent"
				on:change={handleChange}
			/>
		</span>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<square
			class="cursor-pointer select-none"
			on:click={nextMonth}
			role="option"
			aria-selected={false}
			tabindex="0"
		>
			<icon class="i-carbon-chevron-right" />
		</square>
	</month-year>
	<cal-body class="w-full flex flex-col cursor-pointer p-1">
		<days-of-week class="grid grid-cols-7">
			{#each weekdays as day, index}
				<p class:weekend={index % 6 == 0}>
					{day.slice(0, 1)}
				</p>
			{/each}
		</days-of-week>
		<days-of-month class="grid grid-cols-7 grid-rows-5">
			{#each days as { day, offset, date, weekend }}
				{@const start = offset > 0 ? offset : 'auto'}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<day-of-month
					class:weekend
					style:grid-column-start={start}
					on:click={() => (value = date)}
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
