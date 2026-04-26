<script>
	const { kanji, title, description = 'This screen will be implemented in a future phase.' } = $props()
</script>

<div class="placeholder-page">
	<div class="placeholder-header">
		<span class="kanji placeholder-kanji">{kanji}</span>
		<div>
			<h1 class="placeholder-title display">{title}</h1>
			<p class="placeholder-desc">{description}</p>
		</div>
	</div>
</div>

<style>
	.placeholder-page {
		max-width: 1060px;
		margin: 0 auto;
		padding: 36px 48px 48px;
	}
	.placeholder-header {
		display: flex;
		align-items: center;
		gap: 16px;
	}
	.placeholder-kanji {
		font-size: 36px;
		color: var(--shu);
	}
	.placeholder-title {
		font-size: 28px;
		font-weight: 300;
		color: var(--sumi);
		margin: 0;
	}
	.placeholder-desc {
		font-size: 13px;
		color: var(--sumi-3);
		margin: 4px 0 0;
	}
</style>
