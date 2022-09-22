<script>
	export let action
</script>

<form class="flex flex-col w-full border" {action}>
	<slot name="header" />
	<slot />
	<slot name="footer" />
</form>
