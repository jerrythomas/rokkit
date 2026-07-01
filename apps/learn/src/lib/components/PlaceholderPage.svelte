<script>
	const { kanji, title, description = 'This screen will be implemented in a future phase.' } = $props()
</script>

<div class="max-w-[1060px] mx-auto px-[48px] pt-[36px] pb-[48px]">
	<div class="flex items-center gap-4">
		<span class="kanji text-[36px] text-primary">{kanji}</span>
		<div>
			<h1 class="display text-[28px] font-light text-ink-mute m-0">{title}</h1>
			<p class="text-[13px] text-ink-mute mt-1 mb-0">{description}</p>
		</div>
	</div>
</div>
