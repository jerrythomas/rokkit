<script lang="ts">
	let {
		icon,
		title,
		description,
		onclick
	}: {
		icon: string
		title: string
		description: string
		onclick?: () => void
	} = $props()
</script>

<button type="button" class="card" {onclick}>
	<span class="icon">{icon}</span>
	<span class="title">{title}</span>
	<span class="description">{description}</span>
	<span class="hint">tap to open</span>
</button>

<style>
	.card {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 20px;
		@apply bg-paper border border-paper-mute;
		border-radius: var(--radius-md, 6px);
		text-align: left;
		color: inherit;
		cursor: pointer;
		transition:
			border-color 120ms ease,
			transform 120ms ease;
	}
	.card:hover {
		@apply border-accent;
		transform: translateY(-1px);
	}
	.icon {
		font-size: 32px;
		line-height: 1;
		@apply text-ink-mute;
	}
	.title {
		font-size: 16px;
		font-weight: 500;
		@apply text-ink-mute;
	}
	.description {
		font-size: 13px;
		@apply text-ink-soft;
		line-height: 1.4;
		flex: 1 1 auto;
	}
	.hint {
		margin-top: 8px;
		font-family: var(--font-script, 'Caveat', cursive);
		font-size: 16px;
		@apply text-accent;
	}
</style>
