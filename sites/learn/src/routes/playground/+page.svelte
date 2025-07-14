<script>
	import { goto } from '$app/navigation'
	import { Button } from '@rokkit/ui'

	const components = [
		{
			name: 'Tabs',
			description: 'Interactive tab component with configurable orientation, position, and alignment',
			path: '/tabs'
		}
		// Future components can be added here
	]

	function navigateToComponent(component) {
		goto(`/playground${component.path}`)
	}
</script>

<div class="playground-home">
	<section class="intro">
		<h2>Choose a Component to Test</h2>
		<p>Select a component below to open its interactive playground where you can test different configurations and see live results.</p>
	</section>

	<div class="component-grid">
		{#each components as component}
			<div class="component-card">
				<h3>{component.name}</h3>
				<p>{component.description}</p>
				<Button onclick={() => navigateToComponent(component)} class="test-button">
					Test {component.name}
				</Button>
			</div>
		{/each}
	</div>
</div>

<style>
	.playground-home {
		@apply max-w-4xl mx-auto;
	}

	.intro {
		@apply mb-12 text-center;
	}

	.intro h2 {
		@apply text-2xl font-semibold text-neutral-overlay mb-4;
	}

	.intro p {
		@apply text-neutral-floating text-lg;
	}

	.component-grid {
		@apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
	}

	.component-card {
		@apply bg-neutral-inset border border-neutral-subtle rounded-lg p-6 hover:border-accent-base transition-colors;
	}

	.component-card h3 {
		@apply text-xl font-semibold text-neutral-overlay mb-3;
	}

	.component-card p {
		@apply text-neutral-floating mb-4 text-sm leading-relaxed;
	}

	:global(.test-button) {
		@apply bg-accent-base text-accent-contrast px-4 py-2 rounded hover:bg-accent-elevated transition-colors;
	}
</style>