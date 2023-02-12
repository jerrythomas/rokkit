<script>
	import { Select } from '@rokkit/input'
	let items = ['Alpha ', 'Beta', 'Gamma']
</script>

<wrapper class="flex flex-col items-center justify-center h-1/2 mt-10">
	<box class="flex flex-col w-100">
		<Select {items} class="" />
	</box>
</wrapper>
