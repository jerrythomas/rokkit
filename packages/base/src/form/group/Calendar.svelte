<script>
	import { format, isSameDay } from 'date-fns'
	import { weekdays, getCalendarDays } from './calendar'

	export let value = new Date()
	export let holidays = []

	$: console.log(weekdays)
	$: days = getCalendarDays(value, holidays)
</script>

<calendar
	class="flex flex-col items-center rounded-md overflow-hidden shadow-lg select-none"
>
	<month-year
		class="flex flex-row w-full h-10 items-center bg-secondary-400 text-white"
	>
		<icon class="chevron-left" />
		<span class="flex flex-grow justify-center">
			<p>{format(value, 'MMMM yyyy')}</p>
		</span>
		<icon class="chevron-right" />
	</month-year>
	<cal-body class="flex flex-col w-full p-1 cursor-pointer">
		<days-of-week class="grid grid-cols-7 ">
			{#each weekdays as day, index}
				<p class:weekend={index % 6 == 0}>
					{day.slice(0, 1)}
				</p>
			{/each}
		</days-of-week>
		<days-of-month class="grid grid-rows-5 grid-cols-7 gap-2px">
			{#each days as { day, offset, date, weekend }}
				{@const start = offset > 0 ? offset : 'auto'}
				<p
					class="hover:bg-primary-200 hover:rounded-full"
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
		@apply flex items-center justify-center h-8 w-8 text-xs;
	}
	.active {
		@apply bg-secondary-500 text-white rounded-full;
	}
</style>
