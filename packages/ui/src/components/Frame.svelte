<script lang="ts">
	/**
	 * Frame — generic header / body / footer container.
	 *
	 * The canonical "card-shaped UI block" primitive. Hands the structure
	 * to themes via `[data-frame]`, `[data-frame-header]`,
	 * `[data-frame-body]`, `[data-frame-footer]`; consumers decide what
	 * goes inside each slot.
	 *
	 * Used by PlotPlugin to wrap a chart, by CodeBlock to wrap a code
	 * block's chrome, and anywhere else a header/body/footer card is
	 * the right pattern. For an interactive card (link or button), use
	 * `<Card/>` instead.
	 */
	import type { FrameProps } from '../types/frame.js'

	const { header, children, footer, flush = false }: FrameProps = $props()
</script>

<div data-frame>
	{#if header}
		<div data-frame-header>{@render header()}</div>
	{/if}
	{#if children}
		<div data-frame-body data-flush={flush || undefined}>{@render children()}</div>
	{/if}
	{#if footer}
		<div data-frame-footer>{@render footer()}</div>
	{/if}
</div>
