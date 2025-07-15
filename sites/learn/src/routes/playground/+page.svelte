<script>
	import { goto } from '$app/navigation'
	import { Button, Card } from '@rokkit/ui'

	const components = [
		{
			name: 'Tabs',
			description:
				'Interactive tab component with configurable orientation, position, and alignment',
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
		<p>
			Select a component below to open its interactive playground where you can test different
			configurations and see live results.
		</p>
	</section>

	<div class="component-grid">
		{#each components as component, index (index)}
			<Card>
				<h3>{component.name}</h3>
				<p>{component.description}</p>
				<Button onclick={() => navigateToComponent(component)} class="test-button">
					Test {component.name}
				</Button>
			</Card>
		{/each}
	</div>
</div>
