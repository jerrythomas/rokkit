<script>
	import ThemeControls from '$lib/components/ThemeControls.svelte'

	let { open = $bindable(false) } = $props()
</script>

<!-- Backdrop -->
{#if open}
	<button
		type="button"
		class="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
		onclick={() => (open = false)}
		aria-label="Close theme panel"
	></button>
{/if}

<!-- Panel -->
<aside
	class="bg-paper-soft border-paper-mute fixed top-0 right-0 z-50 h-full w-96 overflow-y-auto border-l shadow-2xl transition-transform duration-300"
	class:translate-x-full={!open}
	class:translate-x-0={open}
>
	<!-- Header -->
	<div class="border-paper-mute flex items-center justify-between border-b p-4">
		<span class="text-ink-mute text-sm font-semibold">Theme</span>
		<button
			class="w-6 h-6 flex items-center justify-center text-paper-edge rounded hover:text-ink-mute hover:bg-paper-mute cursor-pointer"
			onclick={() => (open = false)}
			aria-label="Close"
		>&times;</button>
	</div>

	<div class="flex flex-col gap-6 p-4">
		<ThemeControls layout="panel" />
	</div>
</aside>
