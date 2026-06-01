<script lang="ts">
	import { onDestroy } from 'svelte'
	import { Select } from '@rokkit/ui'
	import { vibe } from '@rokkit/states'
	import { siteStyles } from '$lib/data/site-styles'
	import {
		wizardState,
		ramps,
		stepKeys,
		shadeLabels,
		ROLE_TO_VAR,
		FONT_VAR,
		fontCatalogs,
		fontStack,
		type Palette,
		type Role,
		type FontRole
	} from './store.svelte'

	interface Props {
		mode?: 'light' | 'dark'
	}
	const { mode = 'light' }: Props = $props()

	// Step nav — the 4 wizard steps with click-to-navigate. Default lands
	// on Skin (step 02) which is where the live palette + role editing
	// lives; Style / Typography / Preview are companion steps.
	type WizStep = 0 | 1 | 2 | 3
	let activeStep = $state<WizStep>(1)
	const steps: Array<{ n: string; label: string }> = [
		{ n: '01', label: 'Style' },
		{ n: '02', label: 'Skin' },
		{ n: '03', label: 'Typography' },
		{ n: '04', label: 'Preview' }
	]

	// $derived so reassigning wizardState.palettes / .roles (e.g. via
	// resetPreset) propagates to the template — a plain const captures
	// the initial array reference and never updates.
	const palettes = $derived(wizardState.palettes)
	const roles = $derived(wizardState.roles)

	// Available palettes for role assignment — only IN-USE palettes are picker
	// options. Toggling a palette OFF in the catalog above hides it from these
	// menus (and roles still bound to it keep their stored value).
	const paletteOptions = $derived(
		palettes.filter((p) => p.inUse).map((p) => ({ label: p.label, value: p.id }))
	)

	function togglePalette(p: Palette) {
		p.inUse = !p.inUse
	}

	function setRoleStep(r: Role, column: 'light' | 'dark', stepIndex: number) {
		const step = stepKeys[stepIndex]
		if (column === 'light') r.light = [r.light[0], step]
		else r.dark = [r.dark[0], step]
	}

	function setRolePalette(r: Role, column: 'light' | 'dark', paletteId: unknown) {
		if (typeof paletteId !== 'string') return
		if (column === 'light') r.light = [paletteId, r.light[1]]
		else r.dark = [paletteId, r.dark[1]]
	}

	// ─── Live theme application ───────────────────────────────────────────────
	// Apply the current role mapping to the document root so the running app
	// reskins as the user picks. Writes inline CSS variables on
	// `documentElement` for the current `mode`. Reverts on component destroy.

	const appliedVars = new Set<string>()

	function applyRolesToDocument() {
		if (typeof document === 'undefined') return
		const root = document.documentElement
		for (const r of roles) {
			const varName = ROLE_TO_VAR[r.role]
			if (!varName) continue
			const [paletteId, step] = mode === 'dark' ? r.dark : r.light
			const ramp = ramps[paletteId]
			if (!ramp) continue
			const idx = stepKeys.indexOf(step)
			if (idx < 0) continue
			const color = ramp[idx]
			if (!color) continue
			root.style.setProperty(varName, color)
			appliedVars.add(varName)
		}
		for (const role of ['display', 'ui', 'mono'] as FontRole[]) {
			const stack = fontStack(role)
			root.style.setProperty(FONT_VAR[role], stack)
			appliedVars.add(FONT_VAR[role])
		}
	}

	function pickFont(role: FontRole, choiceId: string) {
		wizardState.fonts[role] = choiceId
	}

	function clearAppliedVars() {
		if (typeof document === 'undefined') return
		const root = document.documentElement
		for (const v of appliedVars) root.style.removeProperty(v)
		appliedVars.clear()
	}

	$effect(() => {
		applyRolesToDocument()
	})

	onDestroy(() => {
		clearAppliedVars()
	})
</script>

<div class="wiz">
	<div class="wiz-steps" role="tablist" aria-label="Wizard steps">
		{#each steps as s, i (s.n)}
			<button
				type="button"
				class="wiz-step"
				class:done={i < activeStep}
				class:on={i === activeStep}
				role="tab"
				aria-selected={i === activeStep}
				aria-current={i === activeStep ? 'step' : undefined}
				onclick={() => (activeStep = i as WizStep)}
			>
				<span class="n">{s.n}</span>{s.label}
			</button>
			{#if i < steps.length - 1}
				<span class="step-sep" aria-hidden="true">/</span>
			{/if}
		{/each}
	</div>

	{#if activeStep === 0}
		<section class="wiz-section">
			<span class="lbl">Style — thematic character</span>
			<span class="desc">
				Each style is a different visual personality across the same component set.
				Click to flip the running app to it.
			</span>
			<div class="style-grid">
				{#each siteStyles as s (s.id)}
					<button
						type="button"
						class="style-card"
						data-active={vibe.style === s.id ? '' : undefined}
						onclick={() => (vibe.style = s.id)}
						aria-pressed={vibe.style === s.id}
					>
						<div class="style-swatches">
							{#each s.colors as c, j (j)}
								<span class="style-swatch" style="background: {c};"></span>
							{/each}
						</div>
						<div class="style-name">{s.label}</div>
					</button>
				{/each}
			</div>
		</section>
	{:else if activeStep === 1}
	<section class="wiz-section">
		<span class="lbl">Palettes in this skin</span>
		<span class="desc">
			Two palettes are enough for most themes — one neutral, one accent. Hit + to add more (info,
			warning, danger).
		</span>
		<div class="palette-grid">
			{#each palettes as p (p.id)}
				<button
					type="button"
					class="palette-card"
					data-in-use={p.inUse ? '' : undefined}
					onclick={() => togglePalette(p)}
					aria-pressed={p.inUse}
				>
					<header>
						<span class="p-name">{p.label}</span>
						{#if p.inUse}<span class="p-badge">IN USE</span>{/if}
					</header>
					<div class="p-swatches">
						{#each p.swatches as c, j (j)}
							<span class="swatch" style="background: {c};"></span>
						{/each}
					</div>
					<div class="p-shades">
						{#each shadeLabels as s (s)}<span>{s}</span>{/each}
					</div>
				</button>
			{/each}
		</div>
	</section>

	<section class="wiz-section">
		<span class="lbl">Roles · light / dark mapping</span>
		<span class="desc">
			Each role picks a palette and a step. Same row, two columns — light and dark stay in sync.
		</span>
		<div class="role-table">
			<div class="role-thead">
				<span>Role</span>
				<span>Light palette + step</span>
				<span>Dark palette + step</span>
			</div>
			{#each roles as r (r.role)}
				{@const lightRamp = ramps[r.light[0]] ?? ramps['warm-gray']}
				{@const darkRamp = ramps[r.dark[0]] ?? ramps['warm-gray']}
				<div class="role-row">
					<div class="role-name-cell">
						<div class="role-name">--{r.role}</div>
						<div class="role-desc">{r.desc}</div>
					</div>

					<div class="picker" data-active={mode === 'light' ? '' : undefined}>
						<div class="picker-pal">
							<Select
								items={paletteOptions}
								value={r.light[0]}
								onchange={(v) => setRolePalette(r, 'light', v)}
								size="sm"
								aria-label={`${r.role} · light palette`}
							/>
						</div>
						<div class="picker-ramp">
							{#each lightRamp as c, i (i)}
								<button
									type="button"
									class="picker-swatch"
									data-selected={stepKeys[i] === r.light[1] ? '' : undefined}
									style="background: {c};"
									title={`${r.light[0]} · ${stepKeys[i]}`}
									aria-label={`Set ${r.role} light step to ${stepKeys[i]}`}
									onclick={() => setRoleStep(r, 'light', i)}
								></button>
							{/each}
						</div>
						<span class="picker-step">·{r.light[1]}</span>
					</div>

					<div class="picker" data-active={mode === 'dark' ? '' : undefined}>
						<div class="picker-pal">
							<Select
								items={paletteOptions}
								value={r.dark[0]}
								onchange={(v) => setRolePalette(r, 'dark', v)}
								size="sm"
								aria-label={`${r.role} · dark palette`}
							/>
						</div>
						<div class="picker-ramp">
							{#each darkRamp as c, i (i)}
								<button
									type="button"
									class="picker-swatch"
									data-selected={stepKeys[i] === r.dark[1] ? '' : undefined}
									style="background: {c};"
									title={`${r.dark[0]} · ${stepKeys[i]}`}
									aria-label={`Set ${r.role} dark step to ${stepKeys[i]}`}
									onclick={() => setRoleStep(r, 'dark', i)}
								></button>
							{/each}
						</div>
						<span class="picker-step">·{r.dark[1]}</span>
					</div>
				</div>
			{/each}
		</div>
	</section>
	{:else if activeStep === 2}
		<section class="wiz-section">
			<span class="lbl">Typography — display / UI / mono</span>
			<span class="desc">
				Pick the font stack for each role. Only system fonts and the demo's
				already-loaded faces are listed — no network load on selection. Live
				preview below each row shows the running app's render.
			</span>
			<div class="font-rows">
				{#each ['display', 'ui', 'mono'] as FontRole[] as role (role)}
					<div class="font-row">
						<div class="font-row-head">
							<span class="ph-key">--font-{role}</span>
							<span class="font-row-desc">
								{role === 'display' ? 'headings + display' : role === 'ui' ? 'body + UI' : 'code, eyebrows, kbd'}
							</span>
						</div>
						<div class="font-choices">
							{#each fontCatalogs[role] as choice (choice.id)}
								<button
									type="button"
									class="font-card"
									data-active={wizardState.fonts[role] === choice.id ? '' : undefined}
									onclick={() => pickFont(role, choice.id)}
									aria-pressed={wizardState.fonts[role] === choice.id}
								>
									<span class="font-card-sample" style="font-family: {choice.stack}">
										{role === 'mono' ? "const fox = 'brown'" : 'Quick brown fox'}
									</span>
									<span class="font-card-meta">
										<span class="font-card-name">{choice.label}</span>
										{#if choice.note}<span class="font-card-note">· {choice.note}</span>{/if}
									</span>
								</button>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</section>
	{:else if activeStep === 3}
		<section class="wiz-section">
			<span class="lbl">Preview — your theme on real components</span>
			<span class="desc">
				A handful of components rendered against the roles you mapped. Save the
				preset or export tokens.css from the action bar below.
			</span>
			<div class="preview-grid">
				<div class="preview-tile">
					<span class="preview-tag">Buttons</span>
					<div class="preview-row">
						<span class="btn primary">Primary</span>
						<span class="btn default">Default</span>
						<span class="btn ghost">Ghost</span>
					</div>
				</div>
				<div class="preview-tile">
					<span class="preview-tag">Input</span>
					<div class="preview-input" aria-hidden="true">
						<span class="preview-input-label">Email</span>
						<span class="preview-input-field">you@example.com</span>
					</div>
				</div>
				<div class="preview-tile">
					<span class="preview-tag">Badges</span>
					<div class="preview-row">
						<span class="badge">stable</span>
						<span class="badge accent">accent</span>
						<span class="badge ink">ink</span>
					</div>
				</div>
				<div class="preview-tile">
					<span class="preview-tag">Surface stack</span>
					<div class="surface-stack">
						<div class="surface s-paper">paper</div>
						<div class="surface s-soft">paper-soft</div>
						<div class="surface s-mute">paper-mute</div>
					</div>
				</div>
			</div>
		</section>
	{/if}
</div>

<style>
	.wiz {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	/* ─── Horizontal stepper ─────────────────────────────────────────── */
	.wiz-steps {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}

	.wiz-step {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 6px;
		border: 0;
		background: transparent;
		font: 500 12px var(--font-mono);
		color: var(--ink-soft);
		letter-spacing: 0.04em;
		border-radius: 4px;
		cursor: pointer;
	}

	.wiz-step:hover {
		color: var(--ink-mute);
		background: var(--paper-soft);
	}

	.wiz-step .n {
		font: 500 10px var(--font-mono);
		color: var(--ink-faint);
		letter-spacing: 0.08em;
	}

	.wiz-step.done {
		color: var(--ink-mute);
	}

	.wiz-step.done .n {
		color: var(--ink-soft);
	}

	.wiz-step.on {
		color: var(--accent);
	}

	.wiz-step.on .n {
		color: var(--accent);
	}

	.step-sep {
		color: var(--ink-faint);
		font-family: var(--font-mono);
		font-size: 12px;
	}

	/* ─── Section ────────────────────────────────────────────────────── */
	.wiz-section {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.lbl {
		font: 500 10.5px var(--font-mono);
		color: var(--ink-soft);
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}

	.desc {
		font: 400 12.5px/1.55 var(--font-ui);
		color: var(--ink-mute);
		margin-bottom: 6px;
	}

	/* ─── Palette catalog ────────────────────────────────────────────── */
	.palette-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 10px;
	}

	.palette-card {
		padding: 12px;
		border: 1px solid var(--paper-edge);
		border-radius: 6px;
		background: var(--paper);
		display: flex;
		flex-direction: column;
		gap: 6px;
		text-align: left;
		font: inherit;
		color: inherit;
		cursor: pointer;
		transition: border-color 120ms ease, background 120ms ease;
	}

	.palette-card:hover {
		border-color: color-mix(in oklab, var(--accent) 40%, var(--paper-edge));
	}

	.palette-card[data-in-use] {
		border-color: var(--accent);
		background: color-mix(in oklab, var(--accent) 5%, var(--paper));
	}

	.palette-card header {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.p-name {
		font: 500 12.5px var(--font-mono);
		color: var(--ink);
	}

	.p-badge {
		font: 500 9px var(--font-mono);
		padding: 1px 5px;
		background: var(--accent);
		color: var(--paper);
		border-radius: 3px;
		letter-spacing: 0.06em;
	}

	.p-swatches {
		display: flex;
		gap: 2px;
	}

	.p-swatches .swatch {
		width: 18px;
		height: 22px;
		border-radius: 2px;
		border: 1px solid color-mix(in oklab, var(--ink) 8%, transparent);
	}

	.p-shades {
		display: flex;
		gap: 4px;
	}

	.p-shades span {
		width: 18px;
		font: 500 9px var(--font-mono);
		color: var(--ink-soft);
		text-align: center;
		letter-spacing: 0.02em;
	}

	/* ─── Role table ─────────────────────────────────────────────────── */
	.role-table {
		border: 1px solid var(--paper-edge);
		border-radius: 8px;
		overflow: hidden;
		background: var(--paper-soft);
	}

	.role-thead {
		display: grid;
		grid-template-columns: 180px 1fr 1fr;
		padding: 10px 14px;
		border-bottom: 1px solid var(--paper-edge);
		font: 500 10.5px var(--font-mono);
		color: var(--ink-soft);
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.role-row {
		display: grid;
		grid-template-columns: 180px 1fr 1fr;
		padding: 10px 14px;
		align-items: center;
		background: var(--paper);
		border-top: 1px solid var(--paper-edge);
	}

	.role-row:first-of-type {
		border-top: 0;
	}

	.role-name {
		font: 500 12.5px var(--font-mono);
		color: var(--ink);
	}

	.role-desc {
		font: 400 11px var(--font-ui);
		color: var(--ink-soft);
		margin-top: 1px;
	}

	/* ─── Picker ─────────────────────────────────────────────────────── */
	.picker {
		display: flex;
		align-items: center;
		gap: 10px;
		opacity: 0.55;
	}

	.picker[data-active] {
		opacity: 1;
	}

	.picker-pal {
		min-width: 100px;
		max-width: 100px;
	}

	.picker-pal :global([data-select-trigger]) {
		font: 500 11.5px var(--font-mono);
		min-width: 100px;
	}

	.picker-ramp {
		display: flex;
		gap: 1.5px;
	}

	.picker-swatch {
		width: 14px;
		height: 18px;
		padding: 0;
		border-radius: 2px;
		border: 1px solid color-mix(in oklab, var(--ink) 8%, transparent);
		cursor: pointer;
		transition: transform 80ms ease, outline 80ms ease;
	}

	.picker-swatch:hover {
		transform: scaleY(1.15);
	}

	.picker-swatch[data-selected] {
		outline: 2px solid var(--accent);
		outline-offset: 1px;
	}

	.picker-step {
		font: 500 11px var(--font-mono);
		color: var(--ink-soft);
		min-width: 28px;
	}

	/* ─── Step 01 · Style picker ─────────────────────────────────────── */
	.style-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: 10px;
	}

	.style-card {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 14px;
		border: 1px solid var(--paper-edge);
		border-radius: 8px;
		background: var(--paper);
		text-align: left;
		font: inherit;
		color: inherit;
		cursor: pointer;
		transition: border-color 120ms ease, background 120ms ease;
	}

	.style-card:hover {
		border-color: color-mix(in oklab, var(--accent) 40%, var(--paper-edge));
	}

	.style-card[data-active] {
		border-color: var(--accent);
		background: color-mix(in oklab, var(--accent) 6%, var(--paper));
	}

	.style-swatches {
		display: flex;
		gap: 3px;
	}

	.style-swatch {
		width: 30px;
		height: 24px;
		border-radius: 3px;
		border: 1px solid color-mix(in oklab, var(--ink) 8%, transparent);
	}

	.style-name {
		font: 500 12.5px var(--font-mono);
		color: var(--ink);
	}

	/* ─── Step 03 · Typography picker ────────────────────────────────── */
	.font-rows {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.font-row {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 14px;
		border: 1px solid var(--paper-edge);
		border-radius: 8px;
		background: var(--paper-soft);
	}

	.font-row-head {
		display: flex;
		align-items: baseline;
		gap: 10px;
	}

	.ph-key {
		font: 500 11px var(--font-mono);
		color: var(--ink-mute);
		letter-spacing: 0.02em;
	}

	.font-row-desc {
		font: 400 11.5px var(--font-ui);
		color: var(--ink-soft);
	}

	.font-choices {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 8px;
	}

	.font-card {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 6px;
		padding: 10px 12px;
		border: 1px solid var(--paper-edge);
		border-radius: 6px;
		background: var(--paper);
		text-align: left;
		font: inherit;
		color: inherit;
		cursor: pointer;
		transition: border-color 120ms ease, background 120ms ease;
	}

	.font-card:hover {
		border-color: color-mix(in oklab, var(--accent) 40%, var(--paper-edge));
	}

	.font-card[data-active] {
		border-color: var(--accent);
		background: color-mix(in oklab, var(--accent) 6%, var(--paper));
	}

	.font-card-sample {
		font-size: 16px;
		line-height: 1.2;
		color: var(--ink);
	}

	.font-card-meta {
		display: inline-flex;
		gap: 4px;
		align-items: baseline;
	}

	.font-card-name {
		font: 500 11.5px var(--font-mono);
		color: var(--ink-mute);
	}

	.font-card-note {
		font: 400 11px var(--font-ui);
		color: var(--ink-soft);
	}

	/* ─── Step 04 · Preview tiles ────────────────────────────────────── */
	.preview-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 10px;
	}

	.preview-tile {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 14px;
		border: 1px solid var(--paper-edge);
		border-radius: 8px;
		background: var(--paper);
	}

	.preview-tag {
		font: 500 10px var(--font-mono);
		color: var(--ink-soft);
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.preview-row {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		padding: 5px 12px;
		border-radius: 4px;
		font: 500 12px var(--font-ui);
		border: 1px solid transparent;
	}

	.btn.primary {
		background: var(--accent);
		color: var(--paper);
	}

	.btn.default {
		background: var(--paper-soft);
		color: var(--ink);
		border-color: var(--paper-edge);
	}

	.btn.ghost {
		background: transparent;
		color: var(--ink-mute);
	}

	.preview-input {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.preview-input-label {
		font: 500 10px var(--font-mono);
		color: var(--ink-soft);
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.preview-input-field {
		padding: 6px 10px;
		border: 1px solid var(--paper-edge);
		border-radius: 4px;
		background: var(--paper-soft);
		font: 400 12.5px var(--font-ui);
		color: var(--ink-mute);
	}

	.badge {
		display: inline-flex;
		align-items: center;
		padding: 2px 8px;
		border-radius: 9999px;
		font: 500 10.5px var(--font-mono);
		background: var(--paper-soft);
		color: var(--ink-mute);
		border: 1px solid var(--paper-edge);
		letter-spacing: 0.02em;
	}

	.badge.accent {
		background: color-mix(in oklab, var(--accent) 14%, var(--paper));
		color: var(--accent);
		border-color: color-mix(in oklab, var(--accent) 30%, var(--paper-edge));
	}

	.badge.ink {
		background: var(--ink);
		color: var(--paper);
		border-color: var(--ink);
	}

	.surface-stack {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.surface {
		padding: 6px 10px;
		border-radius: 3px;
		font: 500 11px var(--font-mono);
		color: var(--ink-mute);
		border: 1px solid var(--paper-edge);
	}

	.surface.s-paper {
		background: var(--paper);
	}

	.surface.s-soft {
		background: var(--paper-soft);
	}

	.surface.s-mute {
		background: var(--paper-mute);
	}
</style>
