<script lang="ts">
	import { Sparkline } from '@rokkit/chart'

	let { code }: { code: string } = $props()

	const result = $derived.by(() => {
		try {
			return { spec: JSON.parse(code), error: null }
		} catch (e) {
			return { spec: null, error: e instanceof Error ? e.message : 'Invalid JSON' }
		}
	})

	// `title` is a plugin-level caption, not a Sparkline prop — split it out so it
	// isn't spread onto the component, and render a titled card when it's present.
	const title = $derived(typeof result.spec?.title === 'string' ? result.spec.title : null)
	const chartProps = $derived.by(() => {
		if (!result.spec) return {}
		const rest = { ...result.spec }
		delete rest.title
		return rest
	})
</script>

{#if result.error}
	<div data-block-error class="block-error">
		<span>Sparkline error: {result.error}</span>
		<details>
			<summary>Raw</summary>
			<pre>{code}</pre>
		</details>
	</div>
{:else if title}
	<figure data-sparkline-plugin data-sparkline-card>
		<Sparkline {...chartProps} />
		<figcaption data-sparkline-caption>{title}</figcaption>
	</figure>
{:else}
	<div data-sparkline-plugin>
		<Sparkline {...chartProps} />
	</div>
{/if}
