<script>
	// @ts-nocheck
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
		<h3 class="mb-4 text-lg font-medium">Regular Connectors</h3>
		<div class="flex w-80 gap-4 rounded-lg border border-gray-200 bg-gray-50 px-6 py-4">
			{#each variants as { title, props }, index (index)}
				<div class="flex flex-col items-center">
					<h4 class="mb-2 text-sm font-medium text-gray-700">{title}</h4>
					<div class="flex h-8 w-4 items-center justify-center">
						<Connector {...props} />
					</div>
				</div>
			{/each}
		</div>
	</div>

	<div>
		<h3 class="mb-4 text-lg font-medium">RTL (Right-to-Left) Connectors</h3>
		<div class="flex w-80 gap-4 rounded-lg border border-gray-200 bg-gray-50 px-6 py-4">
			{#each variants as { title, props }, index (index)}
				<div class="flex flex-col items-center">
					<h4 class="mb-2 text-sm font-medium text-gray-700">{title} RTL</h4>
					<div class="flex h-8 w-4 items-center justify-center">
						<Connector {...props} rtl />
					</div>
				</div>
			{/each}
		</div>
	</div>

	<div>
		<h3 class="mb-4 text-lg font-medium">Example Tree Structure</h3>
		<div class="rounded-lg border border-gray-200 bg-white p-4">
			<div class="mb-2 flex items-center">
				<div class="flex h-4 w-4 items-center justify-center">
					<Connector type="child" />
				</div>
				<span class="ml-2">Root Item</span>
			</div>
			<div class="mb-2 ml-4 flex items-center">
				<div class="flex h-4 w-4 items-center justify-center">
					<Connector type="sibling" />
				</div>
				<span class="ml-2">Child Item 1</span>
			</div>
			<div class="mb-2 ml-4 flex items-center">
				<div class="flex h-4 w-4 items-center justify-center">
					<Connector type="last" />
				</div>
				<span class="ml-2">Child Item 2</span>
			</div>
		</div>
	</div>
</div>
