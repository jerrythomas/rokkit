<script>
	// @ts-nocheck
	import { StatusList } from '@rokkit/ui'
	import { FormRenderer } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	// ── @rokkit/ui StatusList: pass/fail/warn/unknown ────────────────────────
	let items = $state([
		{ text: 'At least 8 characters', status: 'pass' },
		{ text: 'Contains an uppercase letter', status: 'fail' },
		{ text: 'Contains a number', status: 'warn' },
		{ text: 'Special character check', status: 'unknown' }
	])

	let props = $state({ class: '' })

	const schema = {
		type: 'object',
		properties: {
			class: { type: 'string' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [{ scope: '#/class', label: 'Extra class' }]
	}
</script>

<PlaySection>
	{#snippet preview()}
		<StatusList {items} class={props.class} />
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
		<div class="mt-4 flex flex-col gap-1">
			<p class="text-surface-z5 text-xs font-semibold uppercase tracking-widest">Items</p>
			{#each items as item, i (i)}
				<div class="flex items-center gap-2">
					<select
						class="border-surface-z3 bg-surface-z1 text-surface-z7 rounded border px-2 py-1 text-xs"
						value={item.status}
						onchange={(e) => (items[i] = { ...item, status: e.currentTarget.value })}
					>
						<option>pass</option>
						<option>fail</option>
						<option>warn</option>
						<option>unknown</option>
					</select>
					<span class="text-surface-z6 text-xs">{item.text}</span>
				</div>
			{/each}
		</div>
	{/snippet}
</PlaySection>
