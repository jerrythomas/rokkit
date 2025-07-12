<script>
	let { value } = $props()
</script>

<div
	class="h-4 w-4 rounded-full"
	class:bg-success-500={value == 'success'}
	class:bg-error-500={value == 'failure'}
	class:bg-warning-500={value == 'warning'}
></div>
<p>{value}</p>
