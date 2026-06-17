<script lang="ts">
	import { guidesByCategory, type GuideCategory } from '$lib/guides'

	const grouped = guidesByCategory()
	const categories: GuideCategory[] = ['basics', 'data', 'design', 'workflows', 'advanced']
</script>

<h1>Guides</h1>
<p class="lead">Long-form reference for building with Rokkit.</p>

{#each categories as cat (cat)}
	{#if grouped[cat].length > 0}
		<section>
			<h2>{cat}</h2>
			<ul class="cards">
				{#each grouped[cat] as g (g.slug)}
					<li>
						<a href={`/guides/${g.slug}`}>
							<strong>{g.title}</strong>
							<span>{g.description}</span>
						</a>
					</li>
				{/each}
			</ul>
		</section>
	{/if}
{/each}

<style>
	h1 {
		font: 700 28px var(--font-display);
		margin: 0 0 6px;
	}
	.lead {
		font: 400 15px var(--font-ui);
		color: var(--ink-soft, #666);
		margin: 0 0 32px;
	}
	h2 {
		font: 500 12px var(--font-mono);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-soft, #888);
		margin: 24px 0 12px;
	}
	.cards {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 12px;
	}
	.cards li a {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 14px 16px;
		border: 1px solid var(--paper-edge, #e0dccc);
		border-radius: 8px;
		text-decoration: none;
		color: var(--ink);
		background: var(--paper, #fff);
	}
	.cards li a:hover {
		border-color: var(--ink-soft, #888);
	}
	.cards li strong {
		font: 600 14px var(--font-display);
	}
	.cards li span {
		font: 400 12.5px/1.5 var(--font-ui);
		color: var(--ink-soft, #666);
	}
</style>
