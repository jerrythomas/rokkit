<script>
	// @ts-nocheck
	import { Pill } from '@rokkit/ui'
	import { FormRenderer } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	let props = $state({
		removable: true,
		disabled: false
	})

	const schema = {
		type: 'object',
		properties: {
			removable: { type: 'boolean' },
			disabled: { type: 'boolean' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{ scope: '#/removable', label: 'Removable' },
			{ scope: '#/disabled', label: 'Disabled' }
		]
	}

	let pills = $state(['Svelte', 'TypeScript', 'Tailwind', 'Vite'])

	function removePill(value) {
		pills = pills.filter((p) => p !== value)
	}

	function resetPills() {
		pills = ['Svelte', 'TypeScript', 'Tailwind', 'Vite']
	}
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex flex-wrap items-center gap-2 p-4">
			{#each pills as pill (pill)}
				<Pill
					value={pill}
					removable={props.removable}
					disabled={props.disabled}
					onremove={removePill}
				/>
			{/each}
			{#if pills.length === 0}
				<button class="text-sm opacity-50" onclick={resetPills}>Reset pills</button>
			{/if}
		</div>

		<div class="flex flex-wrap items-center gap-2 p-4 pt-0">
			<Pill
				value={{ label: 'With Icon', icon: 'i-glyph:tag' }}
				removable={props.removable}
				disabled={props.disabled}
			/>
			<Pill
				value={{ label: 'Star', icon: 'i-glyph:star' }}
				removable={props.removable}
				disabled={props.disabled}
			/>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
	{/snippet}
</PlaySection>
