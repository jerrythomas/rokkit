<script>
	import { Calendar } from '@rokkit/ui'

	let selectedDate = $state(null)
</script>

<Calendar bind:value={selectedDate} />

{#if selectedDate}
	<p>Selected Date: <b>{selectedDate}</b></p>
{:else}
	<p>No date selected</p>
{/if}