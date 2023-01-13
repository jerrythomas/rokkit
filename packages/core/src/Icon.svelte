<script>
	export let name = ''
	let h
</script>

<square-icon
	class="flex flex-col flex-shrink-0 h-full items-center justify-center"
	bind:clientHeight={h}
	style:width="{h}px"
>
	<icon class={name} aria-hidden="true" />
</square-icon>
