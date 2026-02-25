<script>
	import { Connector } from '@rokkit/ui'

	let variants = [
		{ title: 'last', props: { type: 'last' } },
		{ title: 'child', props: { type: 'child' } },
		{ title: 'sibling', props: { type: 'sibling' } },
		{ title: 'empty', props: { type: 'empty' } }
	]
</script>

<div class="space-y-8">
	<div>
		<h3 class="text-lg font-medium mb-4">Regular Connectors</h3>
		<div class="flex w-80 gap-4 border border-gray-200 px-6 py-4 rounded-lg bg-gray-50">
			{#each variants as { title, props }, index (index)}
				<div class="flex flex-col items-center">
					<h4 class="text-sm font-medium mb-2 text-gray-700">{title}</h4>
					<div class="h-8 w-4 flex items-center justify-center">
						<Connector {...props} />
					</div>
				</div>
			{/each}
		</div>
	</div>
	
	<div>
		<h3 class="text-lg font-medium mb-4">RTL (Right-to-Left) Connectors</h3>
		<div class="flex w-80 gap-4 border border-gray-200 px-6 py-4 rounded-lg bg-gray-50">
			{#each variants as { title, props }, index (index)}
				<div class="flex flex-col items-center">
					<h4 class="text-sm font-medium mb-2 text-gray-700">{title} RTL</h4>
					<div class="h-8 w-4 flex items-center justify-center">
						<Connector {...props} rtl />
					</div>
				</div>
			{/each}
		</div>
	</div>
	
	<div>
		<h3 class="text-lg font-medium mb-4">Example Tree Structure</h3>
		<div class="border border-gray-200 p-4 rounded-lg bg-white">
			<div class="flex items-center mb-2">
				<div class="w-4 h-4 flex items-center justify-center">
					<Connector type="child" />
				</div>
				<span class="ml-2">Root Item</span>
			</div>
			<div class="flex items-center mb-2 ml-4">
				<div class="w-4 h-4 flex items-center justify-center">
					<Connector type="sibling" />
				</div>
				<span class="ml-2">Child Item 1</span>
			</div>
			<div class="flex items-center mb-2 ml-4">
				<div class="w-4 h-4 flex items-center justify-center">
					<Connector type="last" />
				</div>
				<span class="ml-2">Child Item 2</span>
			</div>
		</div>
	</div>
</div>