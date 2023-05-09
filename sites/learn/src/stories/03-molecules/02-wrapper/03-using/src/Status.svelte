<script>
	export let value
</script>

<div
	class="w-4 h-4 rounded-full"
	class:bg-green={value == 'success'}
	class:bg-red={value == 'failure'}
	class:bg-yellow={value == 'warning'}
/>
<p>{value}</p>
