<script>
	export let content
</script>

<div class="flex flex-row w-full gap-5 items-center justify-between">
	<div class="">
		{content.name}
	</div>
	<img
		src={content.profile}
		alt="of {content.name}"
		class="h-8 aspect-square rounded-full object-cover"
	/>
</div>
