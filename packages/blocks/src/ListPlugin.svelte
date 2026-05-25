<script lang="ts">
	import { List } from '@rokkit/ui'
	import { DEFAULT_STATE_ICONS } from '@rokkit/core'

	interface ListSpec {
		items: unknown[]
		fields?: Record<string, string>
		collapsible?: boolean
	}

	let { code }: { code: string } = $props()

	let showCode = $state(false)
	const icons = DEFAULT_STATE_ICONS.view

	const result = $derived.by(() => {
		try {
			const parsed = JSON.parse(code) as ListSpec
			if (!parsed || !Array.isArray(parsed.items)) {
				throw new Error('Expected { items: [], collapsible?: boolean }')
			}
			return { spec: parsed, error: null as string | null }
		} catch (e) {
			return { spec: null, error: e instanceof Error ? e.message : 'Invalid JSON' }
		}
	})

	let value = $state<unknown>(null)
</script>

{#if result.error}
	<div data-block-error class="block-error">
		<span>List error: {result.error}</span>
		<details>
			<summary>Raw spec</summary>
			<pre>{code}</pre>
		</details>
	</div>
{:else}
	{@const spec = result.spec!}
	<div data-list-plugin>
		<button
			data-list-code-toggle
			onclick={() => (showCode = !showCode)}
			title={showCode ? 'Show list' : 'Show spec'}
			aria-pressed={showCode}
		>
			<span class="i-rokkit:{showCode ? icons.chart : icons.code}"></span>
		</button>

		{#if showCode}
			<pre data-list-code>{code}</pre>
		{:else}
			<List
				items={spec.items}
				fields={spec.fields ?? {}}
				collapsible={spec.collapsible ?? false}
				bind:value
			/>
		{/if}
	</div>
{/if}

<style>
	[data-list-plugin] {
		position: relative;
	}

	[data-list-code-toggle] {
		position: absolute;
		top: 0.375rem;
		right: 0.375rem;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 0.25rem;
		border: 1px solid currentColor;
		background: transparent;
		color: inherit;
		opacity: 0.4;
		cursor: pointer;
		transition: opacity 150ms ease;
		font-size: 1rem;
	}

	[data-list-code-toggle]:hover {
		opacity: 0.8;
	}

	[data-list-code][data-list-code] {
		margin: 0;
		padding: 1rem;
		overflow-x: auto;
		font-size: 0.75rem;
		white-space: pre-wrap;
		word-break: break-all;
	}
</style>
