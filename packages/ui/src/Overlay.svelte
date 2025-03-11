<script>
	import { dismissable } from '@rokkit/actions'
	let { children } = $props()
	let dismissed = $state(false)
	let ondismiss = () => {
		dismissed = true
	}
</script>

<rk-overlay
	class="absolute left-0 top-0 h-screen w-screen"
	role="presentation"
	class:z-1={!dismissed}
	class:display-none={dismissed}
	aria-hidden="true"
	onclick={ondismiss}
	use:dismissable
	{ondismiss}
>
	{@render children?.()}
</rk-overlay>
