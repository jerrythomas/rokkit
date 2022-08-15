<script>
	export let content
	export let fields

	$: text = typeof content == 'string' ? content : content[fields.text]
</script>

{#if content[fields.image]}
	<img
		class="h-8 w-8 rounded-full"
		alt={content[fields.text]}
		src={content[fields.image]}
	/>
{/if}
{#if content[fields.icon]}
	<icon class={content[fields.icon]} />
{/if}
<p class="flex flex-grow">{text}</p>
