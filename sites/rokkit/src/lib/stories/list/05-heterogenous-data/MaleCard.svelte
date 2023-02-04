<script>
	export let content
</script>

<div class="flex flex-row gap-5 items-center">
	<img
		src={content.profile}
		alt="of {content.name}"
		class="h-8 aspect-square rounded-md object-cover"
	/>
	<div>
		{content.name},
		<i class="italic text-sm">{content.age} years old, {content.gender}</i>
	</div>
</div>
