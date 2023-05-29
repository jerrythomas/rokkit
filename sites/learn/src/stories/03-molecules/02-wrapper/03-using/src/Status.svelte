<script>
	export let value
</script>

<div
	class="h-4 w-4 rounded-full"
	class:bg-green={value == 'success'}
	class:bg-red={value == 'failure'}
	class:bg-yellow={value == 'warning'}
/>
<p>{value}</p>
