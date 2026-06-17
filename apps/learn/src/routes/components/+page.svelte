<script lang="ts">
	const { data } = $props()

	// Group the flat catalog by category, preserving first-seen category order.
	const groups = $derived.by(() => {
		const order: string[] = []
		const byCategory: Record<string, typeof data.components> = {}
		for (const c of data.components) {
			if (!byCategory[c.category]) {
				byCategory[c.category] = []
				order.push(c.category)
			}
			byCategory[c.category].push(c)
		}
		return order.map((category) => ({ category, items: byCategory[category] }))
	})
</script>

<div class="components-index">
	<header>
		<h1>Components</h1>
		<p class="lead">
			{data.components.length} data-driven Svelte 5 components. Each adapts to your data via field
			mapping, with selection, validation, theming, keyboard navigation, and accessibility built in.
		</p>
	</header>

	{#each groups as { category, items } (category)}
		<section>
			<h2>{category}</h2>
			<ul class="grid">
				{#each items as c (c.id)}
					<li>
						<a href="/components/{c.id}">
							<span class="name">{c.title}</span>
							<span class="desc">{c.description}</span>
						</a>
					</li>
				{/each}
			</ul>
		</section>
	{/each}
</div>

<style>
	.components-index {
		max-width: 72rem;
		margin: 0 auto;
		padding: 2.5rem 1.5rem 4rem;
	}
	header {
		margin-bottom: 2.5rem;
	}
	h1 {
		font: 600 2rem/1.1 var(--font-heading, serif);
		color: var(--ink);
		margin: 0 0 0.5rem;
	}
	.lead {
		font-size: 1.0625rem;
		color: var(--ink-mute);
		max-width: 48rem;
	}
	h2 {
		font: 500 0.8125rem/1 var(--font-mono, monospace);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-soft);
		margin: 2rem 0 0.875rem;
	}
	.grid {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.75rem;
		grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
	}
	.grid a {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.875rem 1rem;
		border: 1px solid var(--paper-edge);
		border-radius: var(--radius-md, 0.5rem);
		background: var(--paper-soft);
		text-decoration: none;
		transition:
			border-color 120ms ease,
			background 120ms ease;
	}
	.grid a:hover {
		border-color: var(--primary);
		background: var(--paper-mute);
	}
	.name {
		font-weight: 500;
		color: var(--ink);
	}
	.desc {
		font-size: 0.8125rem;
		line-height: 1.45;
		color: var(--ink-mute);
	}
</style>
