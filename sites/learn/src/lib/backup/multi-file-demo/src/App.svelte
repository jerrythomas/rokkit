<script>
	import { Button } from '@rokkit/ui'
	import { createCounter } from './counter.js'
	// Styles are loaded separately in the demo

	let counter = createCounter()
	let theme = $state('light')

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light'
	}
</script>

<div class="counter-app" class:dark={theme === 'dark'}>
	<header class="counter-header">
		<h1>Multi-File Counter Demo</h1>
		<p>This demo shows how multiple files work together in a Rokkit story.</p>
	</header>

	<main class="counter-main">
		<div class="counter-display">
			<span class="counter-value">{counter.value}</span>
			<span class="counter-label">clicks</span>
		</div>

		<div class="counter-controls">
			<Button
				onclick={counter.decrement}
				class="counter-button counter-button--secondary"
				disabled={counter.value <= 0}
			>
				-
			</Button>

			<Button onclick={counter.increment} class="counter-button counter-button--primary">+</Button>

			<Button onclick={counter.reset} class="counter-button counter-button--outline">Reset</Button>
		</div>

		<div class="theme-controls">
			<Button onclick={toggleTheme} class="theme-toggle">
				{theme === 'light' ? '🌙' : '☀️'}
				{theme === 'light' ? 'Dark' : 'Light'} Mode
			</Button>
		</div>
	</main>

	<footer class="counter-footer">
		<p>Built with Svelte + Rokkit UI</p>
	</footer>
</div>
