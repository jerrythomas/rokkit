<script>
	// @ts-nocheck
	import { Tabs } from '@rokkit/ui'
	import { options } from './data.js'

	let fields = { label: 'name', image: 'photo' }
	let value = $state()
</script>

<div class="space-y-6">
	<div class="bg-surface-z2 rounded-lg p-4">
		<h3 class="mb-2 font-semibold">Field Mapping Configuration</h3>
		<pre class="text-sm"><code>{JSON.stringify(fields, null, 2)}</code></pre>
	</div>

	<Tabs items={options} {fields} bind:value>
		<div class="space-y-4 p-6">
			{#if value}
				<div class="flex items-center gap-4">
					<img src={value.photo} alt={value.name} class="h-16 w-16 rounded-lg object-cover" />
					<div>
						<h3 class="text-lg font-semibold">{value.name}</h3>
						<p class="text-surface-z7 text-sm">
							Photo by <a
								href={value.artist}
								target="_blank"
								class="hover:text-surface-z8 underline">photographer</a
							>
						</p>
					</div>
				</div>

				<div class="bg-surface-z2 rounded-lg p-4">
					<h4 class="mb-2 font-semibold">Selected Value</h4>
					<pre class="text-sm">{JSON.stringify(value, null, 2)}</pre>
				</div>
			{:else}
				<p class="text-surface-z7">Select a tab to see the mapped field values</p>
			{/if}
		</div>
	</Tabs>
</div>
