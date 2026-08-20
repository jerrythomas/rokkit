<script lang="ts">
	import Sparkline from '../../src/Sparkline.svelte'

	/**
	 * Sparkline resolves its `color` prop into `--color-{color}-500` / `--color-{color}-300`
	 * CSS custom properties (see Sparkline.svelte's `strokeColor`/`fillColor`). `@rokkit/themes`
	 * ships NO color for chart — `base/*.css` is structure-only by design (see
	 * agents/journal.md's "headless base" note) — those variables come from a consuming app's
	 * own `rokkit.config.js` → `@rokkit/unocss` build, as bare "r,g,b" triples (confirmed by
	 * the documented override shape in `apps/learn/static/llms/packages/themes.txt`:
	 * `--color-primary-500: 109,40,217`). There is no `@rokkit/themes` file to import here —
	 * these two literal token sets stand in for what that generated stylesheet would provide,
	 * with two DISTINCT roles so a test can tell "the color prop was honoured" apart from
	 * "both happen to look the same" (a broken resolver that always fell back to ONE hardcoded
	 * token would make every sparkline render identically regardless of `color`).
	 */
	let { ...rest }: Record<string, unknown> = $props()
</script>

<div
	data-sparkline-harness
	style="--color-primary-500: 34, 197, 94; --color-primary-300: 134, 239, 172; --color-rose-500: 225, 29, 72; --color-rose-300: 253, 164, 175;"
>
	<Sparkline {...rest} />
</div>
