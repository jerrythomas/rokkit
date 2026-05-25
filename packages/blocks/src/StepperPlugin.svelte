<script lang="ts">
	import { Stepper } from '@rokkit/ui'
	import { DEFAULT_STATE_ICONS } from '@rokkit/core'

	interface StepperStepSpec {
		text: string
		label?: string
		completed?: boolean
		disabled?: boolean
	}

	interface StepperSpec {
		steps: StepperStepSpec[]
		current?: number
		orientation?: 'horizontal' | 'vertical'
		linear?: boolean
	}

	let { code }: { code: string } = $props()

	let showCode = $state(false)
	const icons = DEFAULT_STATE_ICONS.view

	const result = $derived.by(() => {
		try {
			const parsed = JSON.parse(code) as StepperSpec
			if (!parsed || !Array.isArray(parsed.steps)) {
				throw new Error('Expected { steps: [{ text, completed? }], current?, orientation? }')
			}
			return { spec: parsed, error: null as string | null }
		} catch (e) {
			return { spec: null, error: e instanceof Error ? e.message : 'Invalid JSON' }
		}
	})

	let current = $state(0)

	$effect(() => {
		if (typeof result.spec?.current === 'number') current = result.spec.current
	})
</script>

{#if result.error}
	<div data-block-error class="block-error">
		<span>Stepper error: {result.error}</span>
		<details>
			<summary>Raw spec</summary>
			<pre>{code}</pre>
		</details>
	</div>
{:else}
	{@const spec = result.spec!}
	<div data-stepper-plugin>
		<button
			data-stepper-code-toggle
			onclick={() => (showCode = !showCode)}
			title={showCode ? 'Show stepper' : 'Show spec'}
			aria-pressed={showCode}
		>
			<span class="i-rokkit:{showCode ? icons.chart : icons.code}"></span>
		</button>

		{#if showCode}
			<pre data-stepper-code>{code}</pre>
		{:else}
			<Stepper
				steps={spec.steps}
				bind:current
				orientation={spec.orientation ?? 'horizontal'}
				linear={spec.linear ?? false}
			/>
		{/if}
	</div>
{/if}

<style>
	[data-stepper-plugin] {
		position: relative;
	}

	[data-stepper-code-toggle] {
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

	[data-stepper-code-toggle]:hover {
		opacity: 0.8;
	}

	[data-stepper-code][data-stepper-code] {
		margin: 0;
		padding: 1rem;
		overflow-x: auto;
		font-size: 0.75rem;
		white-space: pre-wrap;
		word-break: break-all;
	}
</style>
