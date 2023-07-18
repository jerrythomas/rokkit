<!-- svelte-ignore a11y-click-events-have-key-events -->
<overlay
	class="absolute left-0 top-0 h-screen w-screen"
	role="presentation"
	aria-hidden="true"
	on:click
>
	<slot />
</overlay>
