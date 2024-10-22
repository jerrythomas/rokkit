<script>
	import ListEditor from '../../src/ListEditor.svelte'
	/** @type {{ [key: string]: any }} */
	let { ...rest } = $props();
</script>

<ListEditor {...rest}>
	<span>
		<button type="submit">Save</button>
	</span>
</ListEditor>
