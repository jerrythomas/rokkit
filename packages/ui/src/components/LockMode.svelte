<script lang="ts">
	import { lockMode } from '@rokkit/actions'
	import type { LockModeProps } from '../types/lock-mode.js'

	const { mode, children, class: className = '' }: LockModeProps = $props()
</script>

<!--
	`data-mode` is rendered statically so token vars + in-component `dark:`
	utilities are correct on first (SSR) paint. `lockMode` then mirrors the
	root's style/skin/density on hydration so @rokkit/themes component CSS
	(which keys off [data-mode][data-style]) engages too.
-->
<div data-mode={mode} use:lockMode={mode} class={className || undefined}>
	{@render children()}
</div>
