<script lang="ts">
	type Props = { value?: Record<string, unknown> | string | number | null }
	let { value = null }: Props = $props()
	let text = $derived(typeof value === 'object' ? value?.text : value)
</script>

{text}
