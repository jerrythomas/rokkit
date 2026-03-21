<script>
	// @ts-nocheck

	const THEMES = [
		'rokkit',
		'minimal',
		'material',
		'glass',
		'grada-ui',
		'shadcn',
		'daisy-ui',
		'bits-ui',
		'carbon',
		'ant-design'
	]

	const BUTTON_VARIANTS = [
		{ label: 'Default', variant: 'default' },
		{ label: 'Primary', variant: 'primary' },
		{ label: 'Secondary', variant: 'secondary' },
		{ label: 'Danger', variant: 'danger' },
		{ label: 'Outline', variant: 'default', style: 'outline' },
		{ label: 'Ghost', variant: 'default', style: 'ghost' },
		{ label: 'Disabled', variant: 'default', disabled: true }
	]
</script>

<div class="overflow-auto p-6">
	<h1 class="text-surface-z8 mb-2 text-2xl font-bold">Theme Verification</h1>
	<p class="text-surface-z5 mb-8 text-sm">All 10 themes rendered side-by-side with the same component set.</p>

	<div class="flex flex-col gap-8">
		{#each THEMES as themeName (themeName)}
			<section data-style={themeName} class="rounded-xl border p-6">
				<h2 class="mb-4 text-lg font-semibold font-mono">{themeName}</h2>

				<!-- Buttons -->
				<div class="mb-4">
					<p class="text-surface-z5 mb-2 text-xs font-semibold uppercase tracking-widest">Buttons</p>
					<div class="flex flex-wrap gap-2">
						{#each BUTTON_VARIANTS as btn (btn.label)}
							<button
								data-button
								data-variant={btn.variant}
								data-style={btn.style ?? undefined}
								disabled={btn.disabled ?? false}
								class="px-3 py-1.5 text-sm"
							>
								{btn.label}
							</button>
						{/each}
					</div>
				</div>

				<!-- Input -->
				<div class="mb-4">
					<p class="text-surface-z5 mb-2 text-xs font-semibold uppercase tracking-widest">Input</p>
					<div class="flex gap-3">
						<div data-input-root class="max-w-xs flex-1 rounded-md border px-3 py-1.5">
							<input
								type="text"
								placeholder="Type something..."
								class="w-full bg-transparent text-sm outline-none"
							/>
						</div>
						<div data-input-root class="max-w-xs flex-1 rounded-md border px-3 py-1.5" data-disabled>
							<input
								type="text"
								placeholder="Disabled input"
								disabled
								class="w-full bg-transparent text-sm outline-none"
							/>
						</div>
					</div>
				</div>

				<!-- Toggle (checkbox) -->
				<div class="mb-4">
					<p class="text-surface-z5 mb-2 text-xs font-semibold uppercase tracking-widest">Toggle</p>
					<div class="flex gap-4">
						<label class="flex cursor-pointer items-center gap-2 text-sm">
							<input type="checkbox" checked class="h-4 w-4 cursor-pointer" />
							Checked
						</label>
						<label class="flex cursor-pointer items-center gap-2 text-sm">
							<input type="checkbox" class="h-4 w-4 cursor-pointer" />
							Unchecked
						</label>
						<label class="flex cursor-not-allowed items-center gap-2 text-sm opacity-50">
							<input type="checkbox" disabled class="h-4 w-4" />
							Disabled
						</label>
					</div>
				</div>

				<!-- Card -->
				<div>
					<p class="text-surface-z5 mb-2 text-xs font-semibold uppercase tracking-widest">Card</p>
					<div data-card class="max-w-xs border">
						<div data-card-header>
							<p class="text-sm font-semibold">Card Title</p>
						</div>
						<div data-card-body>
							<p class="text-sm">This is a sample card body with some descriptive text.</p>
						</div>
						<div data-card-footer>
							<button data-button data-variant="primary" class="px-3 py-1.5 text-sm">
								Action
							</button>
						</div>
					</div>
				</div>
			</section>
		{/each}
	</div>
</div>
