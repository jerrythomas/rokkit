<script>
	import { format, isSameDay, addMonths } from 'date-fns'
	import { weekdays, getCalendarDays } from './lib/calendar'

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

<calendar class="flex flex-col items-center select-none">
	<month-year class="flex flex-row w-full h-10 items-center">
		<square class="cursor-pointer select-none" on:click={previousMonth}>
			<icon class="i-carbon-chevron-left" />
		</square>
		<span class="flex flex-grow items-center justify-center gap-1px">
			<p>{format(value, 'MMMM')}</p>
			<input
				type="number"
				value={year}
				class="flex flex-grow-0 w-14 border-none bg-transparent"
				on:change={handleChange}
			/>
		</span>
		<square class="cursor-pointer select-none" on:click={nextMonth}>
			<icon class="i-carbon-chevron-right" />
		</square>
	</month-year>
	<cal-body class="flex flex-col w-full p-1 cursor-pointer">
		<days-of-week class="grid grid-cols-7">
			{#each weekdays as day, index}
				<p class:weekend={index % 6 == 0}>
					{day.slice(0, 1)}
				</p>
			{/each}
		</days-of-week>
		<days-of-month class="grid grid-rows-5 grid-cols-7">
			{#each days as { day, offset, date, weekend }}
				{@const start = offset > 0 ? offset : 'auto'}
				<p
					class:active={isSameDay(date, value)}
					class:weekend
					style:grid-column-start={start}
					on:click={() => (value = date)}
				>
					{day}
				</p>
			{/each}
		</days-of-month>
	</cal-body>
</calendar>

<style>
	days-of-week p,
	days-of-month p {
		@apply flex items-center justify-center;
	}
</style>
