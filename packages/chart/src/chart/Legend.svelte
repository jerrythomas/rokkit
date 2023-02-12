<script>
	export let title
	export let items = []
</script>

<ul class="flex flex-col">
	<p>{title}</p>
	{#each items as item}
		<li class="flex flex-row gap-5">
			<svg width="42" height="42" viewBox="0 0 42 42">
				<rect width="42" height="42" fill={item.fillUrl || item.fill} />
			</svg>
			<p class="flex flex-grow">{item.label}</p>
		</li>
	{/each}
</ul>
