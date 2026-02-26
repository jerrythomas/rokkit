<script lang="ts">
	import { componentGroups } from '$lib/components'
</script>

<div class="max-w-[840px]">
	<h2 class="m-0 mb-1 text-2xl text-surface-z9">Components</h2>
	<p class="m-0 mb-6 text-sm text-surface-z5">Select a component from the sidebar, or pick one below.</p>

	{#each componentGroups as group}
		<div class="mb-6">
			<div class="flex items-center gap-2 mb-3">
				<span class="{group.icon} text-sm text-surface-z5"></span>
				<h3 class="m-0 text-xs font-semibold uppercase tracking-wider text-surface-z5">{group.text}</h3>
			</div>
			<div class="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-2">
				{#each group.children as component}
					<a
						href={component.href}
						class="flex flex-col items-center gap-2 py-4 px-3 rounded-lg no-underline border-surface-z2 border text-surface-z7 text-[0.8125rem] transition-all hover:(border-primary-z4 bg-primary-z0 text-primary-z7)"
					>
						<span class="{component.icon} text-xl"></span>
						<span>{component.text}</span>
					</a>
				{/each}
			</div>
		</div>
	{/each}
</div>
