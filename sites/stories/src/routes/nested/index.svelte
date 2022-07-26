<script>
	import StoryWrapper from '$lib/StoryWrapper.svelte';
	import { NestedList, Node, Text, Collapsible } from '@sparsh-ui/list';

	export let variants;
	let props;
	let using = { default: Node, collapsible: Collapsible };
</script>

<StoryWrapper component={'NestedList'} {variants} bind:props>
	<div class="flex w-60 border px-4 py-2 border-gray-400" slot="component">
		{#if props}
			<NestedList {...props} {using} />
		{/if}
	</div>
</StoryWrapper>
