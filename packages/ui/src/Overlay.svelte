<script>
	import { dismissable } from '@rokkit/actions'
	let { children } = $props()
	let dismissed = $state(false)
	let ondismiss = () => {
		dismissed = true
	}
</script>

<div
	data-overlay-root
	role="presentation"
	aria-hidden="true"
	data-dismissed={dismissed}
	onclick={ondismiss}
	use:dismissable
	{ondismiss}
>
	{@render children?.()}
</div>
