<script>
	let className = ''
	export { className as class }
	export let items = []
	export let value
	let currentIndex = 0

	function handleKey(e, index) {
		const prevIndex = currentIndex
		if (['Enter', ' '].includes(e.key)) {
			currentIndex = index
		} else {
			if (e.key === 'ArrowRight') {
				currentIndex = currentIndex === items.length - 1 ? 0 : currentIndex + 1
			} else if (e.key === 'ArrowLeft') {
				currentIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1
			}
		}
		if (currentIndex !== prevIndex) {
			e.preventDefault()
			e.stopPropagation()
		}
	}
	$: value = items[currentIndex]
</script>

{#if items.length === 0}
	<p>No items to display</p>
{:else}
	<carousel class="flex w-full flex-col gap-3 {className}">
		<slide class="flex flex-col">
			<img src={value.src} alt={value.alt} />
			<p>{value.text}</p>
		</slide>
		<dot-nav role="radiogroup">
			{#each items as item, index (index)}
				<dot
					role="radio"
					aria-checked={currentIndex === index}
					aria-label={`Slide ${index + 1}`}
					on:click={() => (currentIndex = index)}
					on:keydown={(e) => handleKey(e, index)}
					tabindex={0}
				>
				</dot>
			{/each}
		</dot-nav>
	</carousel>
{/if}
