<script>
	export let action
</script>

<form class="w-full flex flex-col border" {action} on:submit on:reset>
	<slot name="header" />
	<slot />
	<slot name="footer" />
</form>
