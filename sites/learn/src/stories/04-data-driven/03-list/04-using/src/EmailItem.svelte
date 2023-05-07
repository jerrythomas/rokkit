<script>
	export let value
	export let fields
</script>

<message-item class="flex w-full items-center gap-3">
	<img
		src={value.from.avatar}
		alt={value.from.name}
		class="w-16 h-16 flex flex-shrink-0 rounded-full object-cover m-auto"
	/>
	<div class="flex w-full flex-col gap-0 leading-tight py-2 gap-1 text-sm">
		<h1 class="font-bold">
			{value.from.name}
		</h1>
		<h2 class="font-semibold">
			{value.subject}
		</h2>
		<p class="text-sm font-thin mt-1 line-clamp-3">{value.message}</p>
	</div>
</message-item>
