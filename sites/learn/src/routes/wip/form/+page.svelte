<script>
	import { InputField } from '@rokkit/organisms'
	let value = 10
</script>

<div class="p-4">
	<InputField label="range" type="range" min={0} max={100} ticks={20} bind:value />
</div>
