<script>
	export let value
</script>

<message-item class="w-full flex items-center gap-3">
	<img
		src={value.from.avatar}
		alt={value.from.name}
		class="m-auto h-16 w-16 flex flex-shrink-0 rounded-full object-cover"
	/>
	<div class="w-full flex flex-col gap-0 gap-1 py-2 leading-tight text-sm">
		<h1 class="font-bold">
			{value.from.name}
		</h1>
		<h2 class="font-semibold">
			{value.subject}
		</h2>
		<p class="line-clamp-3 mt-1 font-thin text-sm">{value.message}</p>
	</div>
</message-item>
