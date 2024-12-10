<script>
	let { value } = $props()
</script>

<message-item class="flex w-full items-center gap-3">
	<img
		src={value.from.avatar}
		alt={value.from.name}
		class="m-auto flex h-16 w-16 flex-shrink-0 rounded-full object-cover"
	/>
	<div class="flex w-full flex-col gap-0 gap-1 py-2 text-sm leading-tight">
		<h1 class="font-bold">
			{value.from.name}
		</h1>
		<h2 class="font-semibold">
			{value.subject}
		</h2>
		<p class="mt-1 line-clamp-3 text-sm font-thin">{value.message}</p>
	</div>
</message-item>
