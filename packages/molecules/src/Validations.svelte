<script>
	import { defaultIcons } from '@rokkit/core'
	import { Icon } from '@rokkit/molecules'

	export let validations
	export let icons = defaultIcons.state
</script>

<div class="flex flex-col">
	{#each validations as { text, valid, optional }}
		{@const state = valid ? 'success' : optional ? 'warning' : 'error'}
		<message class="flex gap-2 {state}">
			<Icon name={icons[state]} />
			<p>
				{text}
			</p>
		</message>
	{/each}
</div>
