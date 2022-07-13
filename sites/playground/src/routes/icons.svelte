<script>
	import * as outline from '@sparsh-ui/icons/heroicons/outline'
	import * as filled from '@sparsh-ui/icons/heroicons/filled'

	import ShowAllIcons from '../pages/ShowAllIcons.svelte'

	const iconSets = { outline, filled }
</script>

<div class="flex flex-col overflow-y-auto">
	<ShowAllIcons
		icons={iconSets.outline}
		name="Heroicons Outline"
		iconClass="text-gray-800"
	/>
	<ShowAllIcons
		icons={iconSets.filled}
		name="Heroicons Filled"
		iconClass="fill-current stroke-none text-gray-500"
	/>
</div>
