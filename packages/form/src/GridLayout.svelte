<script>
	export let rows = 1
	export let columns = 1
</script>

<grid-layout class="grid grid-cols-{columns} grid-rows-{rows}">
  <slot/>
</grid-layout>