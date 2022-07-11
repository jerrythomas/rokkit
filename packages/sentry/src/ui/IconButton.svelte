<script>
	export let type
	export let label
</script>

<button
	{type}
	class="flex flex-row w-full rounded-sm space-x-2 w-full items-center border outline-none focus:ring-2 focus:ring-primary-300 {$$props.class}"
>
	<span class="w-12 p-0 justify-center align-center flex">
		<slot name="icon" />
	</span>
	<p class={$$props.class}>{label}</p>
</button>
