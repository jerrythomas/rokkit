<script>
	// @ts-nocheck
	import { SearchFilter } from '@rokkit/ui'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	let props = $state({
		placeholder: 'Search...',
		debounce: 300,
		size: 'md'
	})

	const schema = {
		type: 'object',
		properties: {
			placeholder: { type: 'string' },
			debounce: { type: 'number' },
			size: { type: 'string' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{ scope: '#/placeholder', label: 'Placeholder' },
			{
				scope: '#/debounce',
				label: 'Debounce (ms)',
				props: { options: [0, 150, 300, 500] }
			},
			{ scope: '#/size', label: 'Size', props: { options: ['sm', 'md', 'lg'] } },
			{ type: 'separator' }
		]
	}

	let filters = $state([])

	const filterSyntaxExamples = [
		'apple',
		'name:alice',
		'age>30',
		'status:active name:bob',
		'/regex/'
	]
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex w-full flex-col gap-6">
			<SearchFilter
				bind:filters
				placeholder={props.placeholder}
				debounce={props.debounce}
				size={props.size}
			/>
			<div>
				<h4 class="text-surface-z5 m-0 mb-2 text-xs tracking-wide uppercase">Filter syntax examples</h4>
				<div class="flex flex-wrap gap-2">
					{#each filterSyntaxExamples as example}
						<code class="bg-surface-z2 text-surface-z7 rounded px-2 py-0.5 text-xs">{example}</code>
					{/each}
				</div>
			</div>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
		<InfoField label="Active filters" value={filters.length ? JSON.stringify(filters) : '—'} />
	{/snippet}
</PlaySection>
