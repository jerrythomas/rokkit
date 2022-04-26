<script>
	import { props } from 'ramda'
</script>

<scroll class="flex flex-col h-full overflow-scroll {$$props.class}">
	<slot />
</scroll>
