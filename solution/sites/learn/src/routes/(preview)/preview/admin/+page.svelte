<script>
	// @ts-nocheck
	import { Tabs } from '@rokkit/ui'

	const tabs = [
		{ label: 'Profile', value: 'profile', icon: 'i-solar:user-bold-duotone' },
		{ label: 'Team', value: 'team', icon: 'i-solar:users-group-two-rounded-bold-duotone' },
		{ label: 'Appearance', value: 'appearance', icon: 'i-solar:palette-bold-duotone' }
	]

	let activeTab = $state('profile')
	const tabFields = { label: 'label', value: 'value', icon: 'icon' }
	const skins = ['rokkit', 'glass', 'minimal', 'material']
</script>

<div class="p-6 flex flex-col gap-6">
	<h1 class="text-2xl font-bold text-surface-z8">Admin</h1>

	<Tabs options={tabs} bind:value={activeTab} fields={tabFields} />

	<div class="mt-2">
		{#if activeTab === 'profile'}
			<div data-card class="p-6 max-w-lg flex flex-col gap-4">
				<h2 class="text-base font-semibold text-surface-z7">Profile Settings</h2>
				<p class="text-sm text-surface-z5">
					Full form editing with FormRenderer, validation, and lookup fields will be demonstrated here.
				</p>
				<div class="flex flex-col gap-3 opacity-60">
					<div class="h-9 bg-surface-z2 rounded-md"></div>
					<div class="h-9 bg-surface-z2 rounded-md"></div>
					<div class="h-9 bg-surface-z2 rounded-md"></div>
				</div>
				<p class="text-xs text-surface-z4">FormRenderer integration coming soon</p>
			</div>
		{:else if activeTab === 'team'}
			<div data-card class="p-6 flex flex-col gap-2 min-h-40 items-center justify-center text-center">
				<span class="i-solar:table-bold-duotone text-3xl text-surface-z3" aria-hidden="true"></span>
				<p class="text-sm text-surface-z5">Team members DataTable</p>
				<p class="text-xs text-surface-z4">DataTable component coming soon</p>
			</div>
		{:else if activeTab === 'appearance'}
			<div data-card class="p-6 max-w-sm flex flex-col gap-4">
				<h2 class="text-base font-semibold text-surface-z7">Appearance</h2>
				<p class="text-sm text-surface-z5">Use the theme panel (bottom-right) to switch skin and mode live.</p>
				<div class="flex flex-col gap-2">
					<p class="text-xs font-semibold text-surface-z5 uppercase tracking-wide">Available Skins</p>
					<div class="flex flex-wrap gap-2">
						{#each skins as skin}
							<span class="px-2 py-1 text-xs rounded border border-surface-z3 text-surface-z6 capitalize">{skin}</span>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
