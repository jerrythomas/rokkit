<script lang="ts">
	let { children } = $props()
</script>

<!--
	The site shell is pinned to the viewport (`height: 100dvh; overflow: hidden`) so each
	region owns its own scroll — /app and /chat scroll internally, /guides has its own
	scroller, and the landing page opts back into page scroll via `.has-footer`.

	/components had none of those, so its long-form content was simply clipped: the
	catalog index and every component page rendered past the fold with no way to reach
	the rest. This is that missing scroller.

	`min-height: 0` is load-bearing — a flex/grid child refuses to shrink below its
	content height without it, and the overflow silently does nothing.
-->
<div class="components-shell">
	{@render children()}
</div>

<style>
	.components-shell {
		height: 100%;
		min-height: 0;
		overflow-y: auto;
	}
</style>
