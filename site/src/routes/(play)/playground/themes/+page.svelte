<script>
	// @ts-nocheck
	import { Button, Card, Switch } from '@rokkit/ui'
	import { Input, InputField } from '@rokkit/forms'

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

	const SWITCH_OPTIONS = [
		{ label: 'Off', value: false },
		{ label: 'On', value: true }
	]

	let inputValues = $state(Object.fromEntries(THEMES.map((t) => [t, ''])))
	let switchOnValues = $state(Object.fromEntries(THEMES.map((t) => [t, true])))
	let switchOffValues = $state(Object.fromEntries(THEMES.map((t) => [t, false])))
</script>

<div class="overflow-auto p-6">
	<h1 class="text-surface-z8 mb-2 text-2xl font-bold">Theme Verification</h1>
	<p class="text-surface-z5 mb-8 text-sm">
		All 10 themes rendered side-by-side with the same component set.
	</p>

	<div class="flex flex-col gap-8">
		{#each THEMES as themeName (themeName)}
			<section
				data-style={themeName}
				class="rounded-xl p-6"
				style="border: 1px solid var(--color-surface-z3, #444)"
			>
				<h2 class="mb-4 font-mono text-lg font-semibold">{themeName}</h2>

				<!-- Buttons -->
				<div class="mb-4">
					<p class="text-surface-z5 mb-2 text-xs font-semibold tracking-widest uppercase">
						Buttons
					</p>
					<div class="flex flex-wrap gap-2">
						{#each BUTTON_VARIANTS as btn (btn.label)}
							<Button
								label={btn.label}
								variant={btn.variant}
								style={btn.style ?? 'default'}
								disabled={btn.disabled ?? false}
								size="sm"
							/>
						{/each}
					</div>
				</div>

				<!-- Input -->
				<div class="mb-4">
					<p class="text-surface-z5 mb-2 text-xs font-semibold tracking-widest uppercase">Input</p>
					<div class="flex gap-3">
						<div class="max-w-xs flex-1">
							<InputField bind:value={inputValues[themeName]} label="Label" name="demo" />
						</div>
						<div class="max-w-xs flex-1">
							<InputField label="Disabled" name="demo-disabled" disabled />
						</div>
					</div>
				</div>

				<!-- Switch -->
				<div class="mb-4">
					<p class="text-surface-z5 mb-2 text-xs font-semibold tracking-widest uppercase">Switch</p>
					<div class="flex gap-4">
						<Switch bind:value={switchOnValues[themeName]} options={SWITCH_OPTIONS} showLabels />
						<Switch bind:value={switchOffValues[themeName]} options={SWITCH_OPTIONS} showLabels />
						<Switch value={false} options={SWITCH_OPTIONS} disabled showLabels />
					</div>
				</div>

				<!-- Card -->
				<div>
					<p class="text-surface-z5 mb-2 text-xs font-semibold tracking-widest uppercase">Card</p>
					<div class="flex flex-wrap gap-3">
						<Card class="max-w-xs flex-1">
							{#snippet header()}
								<p class="text-sm font-semibold">Default Card</p>
							{/snippet}
							<p class="text-sm">Card body with some descriptive text.</p>
							{#snippet footer()}
								<Button label="Action" variant="primary" size="sm" />
							{/snippet}
						</Card>
						<Card variant="primary" class="max-w-xs flex-1">
							{#snippet header()}
								<p class="text-sm font-semibold">Primary Card</p>
							{/snippet}
							<p class="text-sm">Card body with some descriptive text.</p>
							{#snippet footer()}
								<Button label="Action" variant="default" size="sm" />
							{/snippet}
						</Card>
					</div>
				</div>
			</section>
		{/each}
	</div>
</div>
