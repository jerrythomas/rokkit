<script>
	// @ts-nocheck
	import { Tabs } from '@rokkit/ui'

	const tabs = [
		{ label: 'Profile', value: 'profile', icon: 'i-glyph:user' },
		{ label: 'Team', value: 'team', icon: 'i-glyph:users-group-two-rounded' },
		{ label: 'Appearance', value: 'appearance', icon: 'i-glyph:palette' }
	]

	let activeTab = $state('profile')
	const tabFields = { label: 'label', value: 'value', icon: 'icon' }
	const skins = ['rokkit', 'glass', 'minimal', 'material']
</script>

<div class="flex flex-col gap-6 p-6">
	<h1 class="text-surface-z8 text-2xl font-bold">Admin</h1>

	<Tabs
		options={tabs}
		bind:value={activeTab}
		fields={tabFields}
		onchange={(v) => (activeTab = v)}
	/>

	<div class="mt-2">
		{#if activeTab === 'profile'}
			<div data-card class="flex max-w-lg flex-col gap-4 p-6">
				<h2 class="text-surface-z7 text-base font-semibold">Profile Settings</h2>
				<p class="text-surface-z5 text-sm">
					Full form editing with FormRenderer, validation, and lookup fields will be demonstrated
					here.
				</p>
				<div class="flex flex-col gap-3 opacity-60">
					<div class="bg-surface-z2 h-9 rounded-md"></div>
					<div class="bg-surface-z2 h-9 rounded-md"></div>
					<div class="bg-surface-z2 h-9 rounded-md"></div>
				</div>
				<p class="text-surface-z4 text-xs">FormRenderer integration coming soon</p>
			</div>
		{:else if activeTab === 'team'}
			<div
				data-card
				class="flex min-h-40 flex-col items-center justify-center gap-2 p-6 text-center"
			>
				<span class="i-glyph:table text-surface-z3 text-3xl" aria-hidden="true"></span>
				<p class="text-surface-z5 text-sm">Team members DataTable</p>
				<p class="text-surface-z4 text-xs">DataTable component coming soon</p>
			</div>
		{:else if activeTab === 'appearance'}
			<div data-card class="flex max-w-sm flex-col gap-4 p-6">
				<h2 class="text-surface-z7 text-base font-semibold">Appearance</h2>
				<p class="text-surface-z5 text-sm">
					Use the theme panel (bottom-right) to switch skin and mode live.
				</p>
				<div class="flex flex-col gap-2">
					<p class="text-surface-z5 text-xs font-semibold tracking-wide uppercase">
						Available Skins
					</p>
					<div class="flex flex-wrap gap-2">
						{#each skins as skin (skin)}
							<span
								class="border-surface-z3 text-surface-z6 rounded border px-2 py-1 text-xs capitalize"
								>{skin}</span
							>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
