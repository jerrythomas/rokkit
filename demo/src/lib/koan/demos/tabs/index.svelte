<script lang="ts">
	import { Tabs } from '@rokkit/ui'

	const options = [
		{ id: 'first', label: 'First', content: 'Content of the first tab.' },
		{ id: 'second', label: 'Second', content: 'Content of the second tab.' },
		{ id: 'third', label: 'Third', content: 'Content of the third tab.' }
	]

	const fields = { value: 'id', text: 'label' }

	let h = $state('first')
	let v = $state('first')
</script>

<section class="tabs-demo">
	<header>
		<h1>Tabs</h1>
		<p class="caption">Two orientations of the same data.</p>
	</header>

	<div class="grid">
		<article class="example">
			<h2>Horizontal (default)</h2>
			<Tabs {options} {fields} bind:value={h}>
				{#snippet tabPanel(proxy)}
					<p>{proxy.get('content')}</p>
				{/snippet}
			</Tabs>
		</article>

		<article class="example">
			<h2>Vertical</h2>
			<Tabs {options} {fields} orientation="vertical" bind:value={v}>
				{#snippet tabPanel(proxy)}
					<p>{proxy.get('content')}</p>
				{/snippet}
			</Tabs>
		</article>
	</div>
</section>

<style>
	.tabs-demo {
		display: flex;
		flex-direction: column;
		gap: 24px;
		max-width: 1080px;
		margin: 0 auto;
	}

	header h1 {
		margin: 0 0 4px;
	}

	.caption {
		margin: 0;
		font-family: var(--font-script, 'Caveat', cursive);
		font-size: 22px;
		@apply text-ink-z3;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 24px;
	}

	.example {
		@apply bg-surface-z0 border border-surface-z2 text-ink-z1;
		padding: 16px;
		border-radius: var(--radius-md, 6px);
	}

	.example h2 {
		@apply text-ink-z3;
		margin: 0 0 12px;
		font-size: 14px;
	}
</style>
