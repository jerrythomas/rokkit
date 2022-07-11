<script>
	export let value = ''
	export let placeholder
	export let type = 'email'
	export let id
	export let name
</script>

<div
	class="flex flex-row w-full rounded-sm border focus-within:ring-2 focus-within:ring-primary-300 {$$props.class}"
>
	<span
		class="w-12 p-0 flex-grow-0 flex-shrink-0 justify-center align-center flex bg-skin-base rounded-l-sm"
	>
		<slot name="icon" />
	</span>
	<slot>
		<input
			{id}
			{type}
			{name}
			{placeholder}
			{value}
			class="flex flex-grow w-auto border-0 border-skin-base px-2 outline-none rounded-r-sm font-thin"
		/>
	</slot>
</div>
