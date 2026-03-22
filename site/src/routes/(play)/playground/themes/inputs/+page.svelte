<script>
	// @ts-nocheck
	import { Button, Switch, Select, MultiSelect, Range } from '@rokkit/ui'
	import { InputField } from '@rokkit/forms'

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
		{ label: 'Default', variant: 'default', style: 'default' },
		{ label: 'Primary', variant: 'primary', style: 'default' },
		{ label: 'Secondary', variant: 'secondary', style: 'default' },
		{ label: 'Accent', variant: 'accent', style: 'default' },
		{ label: 'Danger', variant: 'danger', style: 'default' },
		{ label: 'Outline', variant: 'primary', style: 'outline' },
		{ label: 'Ghost', variant: 'primary', style: 'ghost' },
		{ label: 'Gradient', variant: 'primary', style: 'gradient' },
		{ label: 'Disabled', variant: 'default', style: 'default', disabled: true }
	]

	const SWITCH_OPTIONS = [
		{ label: 'Off', value: false },
		{ label: 'On', value: true }
	]

	const SWITCH_DISABLED_OPTIONS = [{ label: 'Disabled', value: false }]

	const RADIO_OPTIONS = [
		{ label: 'Option A', value: 'a' },
		{ label: 'Option B', value: 'b' }
	]

	let radioValues = $state(Object.fromEntries(THEMES.map((t) => [t, 'a'])))

	const selectItems = [
		{ label: 'Apple', value: 'apple' },
		{ label: 'Banana', value: 'banana' },
		{ label: 'Cherry', value: 'cherry' },
		{ label: 'Date', value: 'date' },
		{ label: 'Elderberry', value: 'elderberry' }
	]

	let textValues = $state(Object.fromEntries(THEMES.map((t) => [t, ''])))
	let switchOnValues = $state(Object.fromEntries(THEMES.map((t) => [t, true])))
	let switchOffValues = $state(Object.fromEntries(THEMES.map((t) => [t, false])))
	let selectValues = $state(Object.fromEntries(THEMES.map((t) => [t, undefined])))
	let multiValues = $state(Object.fromEntries(THEMES.map((t) => [t, []])))
	let rangeValues = $state(Object.fromEntries(THEMES.map((t) => [t, 40])))
	let rangeLower = $state(Object.fromEntries(THEMES.map((t) => [t, 20])))
	let rangeUpper = $state(Object.fromEntries(THEMES.map((t) => [t, 75])))
</script>

<div class="overflow-auto p-6">
	<h1 class="text-surface-z8 mb-2 text-2xl font-bold">Inputs & Buttons</h1>
	<p class="text-surface-z5 mb-8 text-sm">All 10 themes — full input types and button variants.</p>

	<div class="flex flex-col gap-8">
		{#each THEMES as themeName (themeName)}
			<section data-style={themeName} class="rounded-xl p-6" style="border: 1px solid var(--color-surface-z3, #444)">
				<h2 class="mb-4 font-mono text-lg font-semibold">{themeName}</h2>

				<!-- Text inputs -->
				<div class="mb-4">
					<p class="text-surface-z5 mb-2 text-xs font-semibold uppercase tracking-widest">Text Inputs</p>
					<div class="flex flex-wrap gap-3">
						<div class="w-44">
							<InputField bind:value={textValues[themeName]} label="Text" name="text-{themeName}" placeholder="Enter text" />
						</div>
						<div class="w-44">
							<InputField label="Email" name="email-{themeName}" type="email" placeholder="name@example.com" />
						</div>
						<div class="w-44">
							<InputField label="Password" name="pw-{themeName}" type="password" placeholder="••••••••" />
						</div>
						<div class="w-44">
							<InputField label="Disabled" name="dis-{themeName}" disabled placeholder="Disabled" />
						</div>
					</div>
				</div>

				<!-- Date & Time -->
				<div class="mb-4">
					<p class="text-surface-z5 mb-2 text-xs font-semibold uppercase tracking-widest">Date & Time</p>
					<div class="flex flex-wrap gap-3">
						<div class="w-44">
							<InputField label="Date" name="date-{themeName}" type="date" />
						</div>
						<div class="w-44">
							<InputField label="Time" name="time-{themeName}" type="time" />
						</div>
						<div class="w-44">
							<InputField label="Date & Time" name="datetime-{themeName}" type="datetime-local" />
						</div>
					</div>
				</div>

				<!-- Textarea -->
				<div class="mb-4">
					<p class="text-surface-z5 mb-2 text-xs font-semibold uppercase tracking-widest">Textarea</p>
					<div class="w-72">
						<InputField label="Notes" name="textarea-{themeName}" type="textarea" placeholder="Write something…" />
					</div>
				</div>

				<!-- Select -->
				<div class="mb-4">
					<p class="text-surface-z5 mb-2 text-xs font-semibold uppercase tracking-widest">Select</p>
					<div class="flex flex-wrap gap-3">
						<Select
							items={selectItems}
							placeholder="Pick a fruit…"
							value={selectValues[themeName]}
							onselect={(v) => (selectValues[themeName] = v)}
						/>
						<Select items={selectItems} placeholder="Disabled" disabled />
					</div>
				</div>

				<!-- Checkbox & Radio -->
				<div class="mb-4">
					<p class="text-surface-z5 mb-2 text-xs font-semibold uppercase tracking-widest">Checkbox & Radio</p>
					<div class="flex flex-wrap gap-4">
						<InputField label="Checkbox" name="cb-{themeName}" type="checkbox" />
						<InputField label="Checked" name="cb2-{themeName}" type="checkbox" value={true} />
						<InputField
							name="radio-{themeName}"
							type="radio"
							bind:value={radioValues[themeName]}
							options={RADIO_OPTIONS}
						/>
					</div>
				</div>

				<!-- Switch -->
				<div class="mb-4">
					<p class="text-surface-z5 mb-2 text-xs font-semibold uppercase tracking-widest">Switch</p>
					<div class="flex gap-4">
						<Switch bind:value={switchOnValues[themeName]} options={SWITCH_OPTIONS} showLabels />
						<Switch bind:value={switchOffValues[themeName]} options={SWITCH_OPTIONS} showLabels />
						<Switch value={false} options={SWITCH_DISABLED_OPTIONS} disabled showLabels />
					</div>
				</div>

				<!-- Multi Select -->
				<div class="mb-4">
					<p class="text-surface-z5 mb-2 text-xs font-semibold uppercase tracking-widest">Multi Select</p>
					<div class="w-72">
						<MultiSelect
							items={selectItems}
							placeholder="Pick fruits…"
							bind:value={multiValues[themeName]}
						/>
					</div>
				</div>

				<!-- Range -->
				<div class="mb-4">
					<p class="text-surface-z5 mb-2 text-xs font-semibold uppercase tracking-widest">Range</p>
					<div class="flex flex-col gap-4 w-72">
						<div>
							<p class="text-surface-z4 mb-1 text-xs">Single</p>
							<Range bind:value={rangeValues[themeName]} min={0} max={100} />
						</div>
						<div>
							<p class="text-surface-z4 mb-1 text-xs">Dual</p>
							<Range range bind:lower={rangeLower[themeName]} bind:upper={rangeUpper[themeName]} min={0} max={100} />
						</div>
					</div>
				</div>

				<!-- Buttons -->
				<div>
					<p class="text-surface-z5 mb-2 text-xs font-semibold uppercase tracking-widest">Buttons</p>
					<div class="flex flex-wrap gap-2">
						{#each BUTTON_VARIANTS as btn (btn.label)}
							<Button
								label={btn.label}
								variant={btn.variant}
								style={btn.style}
								disabled={btn.disabled ?? false}
								size="sm"
							/>
						{/each}
					</div>
				</div>
			</section>
		{/each}
	</div>
</div>
