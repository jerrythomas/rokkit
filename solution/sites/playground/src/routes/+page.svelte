<script lang="ts">
	import { components } from '$lib/components'
</script>

<div class="max-w-[720px]">
	<h2 class="m-0 mb-1 text-2xl text-surface-z9">Components</h2>
	<p class="m-0 mb-6 text-sm text-surface-z5">Select a component from the sidebar, or pick one below.</p>

	<div class="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
		{#each components as component}
			<a
				href={component.href}
				class="flex flex-col items-center gap-2 py-5 px-4 rounded-lg no-underline border-surface-z2 border text-surface-z7 text-[0.8125rem] transition-all hover:(border-primary-z4 bg-primary-z0 text-primary-z7)"
			>
				<span class="{component.icon} text-2xl"></span>
				<span>{component.text}</span>
			</a>
		{/each}
	</div>
</div>
