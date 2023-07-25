<script>
	import { defaultStateIcons } from '@rokkit/core'
	import { Icon } from '@rokkit/atoms'

	let className = ''
	export { className as class }
	export let items
	export let icons = defaultStateIcons.validity
</script>

<div class="flex flex-col {className}">
	{#each items as { text, status }}
		<message class="flex gap-2 {status}">
			<Icon name={icons[status]} />
			<p>{text}</p>
		</message>
	{/each}
</div>
