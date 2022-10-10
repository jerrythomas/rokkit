<script>
	export let action
</script>

<form class="flex flex-col w-full border" {action} on:submit on:reset>
	<slot name="header" />
	<slot />
	<slot name="footer" />
</form>
