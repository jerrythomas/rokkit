<script lang="ts">
	let {
		glyph = '○',
		label = '',
		compact = false
	}: {
		glyph?: string
		label?: string
		compact?: boolean
	} = $props()
</script>

<div class="brand" class:compact aria-label={label}>
	<span class="glyph">{glyph}</span>
	{#if label}
		<span class="label">{label}</span>
	{/if}
</div>

<style>
	.brand {
		display: inline-flex;
		align-items: center;
		gap: 12px;
		transition:
			transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1),
			gap 500ms ease-out;
	}
	.glyph {
		font-size: 96px;
		line-height: 1;
		color: var(--color-ink-z1);
		transition: font-size 500ms cubic-bezier(0.34, 1.56, 0.64, 1);
		font-family: var(--font-display, inherit);
	}
	.label {
		font-size: 28px;
		font-weight: 500;
		color: var(--color-ink-z1);
		letter-spacing: -0.02em;
		opacity: 1;
		transition:
			font-size 500ms ease-out,
			opacity 300ms ease-out;
	}
	.compact .glyph {
		font-size: 24px;
	}
	.compact .label {
		font-size: 16px;
	}
	@media (prefers-reduced-motion: reduce) {
		.brand,
		.glyph,
		.label {
			transition: none;
		}
	}
</style>
