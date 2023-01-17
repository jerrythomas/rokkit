<script>
	import Waves from './Waves.svelte'
</script>

<gradient-bg
	class="absolute top-0 left-0 right-0 bottom-0 flex flex-col bg-skin-50 -z-1"
>
	<top-half
		class="flex flex-col relative w-full h-1/2 bg-gradient-to-tr from-primary-500 to-secondary-500"
	>
		<Waves />
	</top-half>
</gradient-bg>
