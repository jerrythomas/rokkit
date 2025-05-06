<script>
	import Button from '../../src/Button.svelte'
</script>

<div id="left-icon">
	<Button label="Left">
		{#snippet leftIcon()}
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
				<path
					d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-2a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm-4-8a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
				/>
			</svg>
		{/snippet}
	</Button>
</div>

<div id="right-icon">
	<Button label="Right icon">
		{#snippet rightIcon()}
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
				<path
					d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-2a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm4-8a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
				/>
			</svg>
		{/snippet}
	</Button>
</div>

<div id="content">
	<Button>
		<p>Hello World</p>
	</Button>
</div>
