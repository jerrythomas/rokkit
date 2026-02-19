<script lang="ts">
	import { components } from '$lib/components'
</script>

<div class="home">
	<h2>Components</h2>
	<p>Select a component from the sidebar, or pick one below.</p>

	<div class="grid">
		{#each components as component}
			<a href={component.href} class="card">
				<span class={component.icon}></span>
				<span>{component.text}</span>
			</a>
		{/each}
	</div>
</div>

<style>
	.home {
		max-width: 720px;
	}

	h2 {
		margin: 0 0 0.25rem;
		font-size: 1.5rem;
		color: rgb(var(--color-surface-900));
	}

	p {
		color: rgb(var(--color-surface-500));
		margin: 0 0 1.5rem;
		font-size: 0.875rem;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 0.75rem;
	}

	.card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1.25rem 1rem;
		border: 1px solid rgb(var(--color-surface-200));
		border-radius: 0.5rem;
		text-decoration: none;
		color: rgb(var(--color-surface-700));
		font-size: 0.8125rem;
		transition: all 0.15s;
	}

	.card:hover {
		border-color: rgb(var(--color-primary-400));
		background: rgb(var(--color-primary-50));
		color: rgb(var(--color-primary-700));
	}

	.card span:first-child {
		font-size: 1.5rem;
	}
</style>
