<script>
	import ListEditor from '../../src/ListEditor.svelte'
	let { ...listProps } = $props()
</script>

<ListEditor {...listProps}>
	<span>
		<button type="submit">Save</button>
	</span>
</ListEditor>
