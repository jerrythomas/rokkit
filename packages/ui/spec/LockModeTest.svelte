<script lang="ts">
	import LockMode from '../src/components/LockMode.svelte'

	const { mode, class: className }: { mode: 'dark' | 'light'; class?: string } = $props()
</script>

<LockMode {mode} class={className}>
	<span data-test-child>content</span>
</LockMode>
