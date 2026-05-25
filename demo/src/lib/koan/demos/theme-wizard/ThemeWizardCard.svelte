<script lang="ts">
	import { onDestroy } from 'svelte'
	import { Select } from '@rokkit/ui'
	import {
		wizardState,
		ramps,
		stepKeys,
		shadeLabels,
		ROLE_TO_VAR,
		type Palette,
		type Role
	} from './store.svelte'

	interface Props {
		mode?: 'light' | 'dark'
	}
	const { mode = 'light' }: Props = $props()

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
	<div class="wiz-steps" role="list">
		<div class="wiz-step done" role="listitem"><span class="n">01</span>Style</div>
		<span class="step-sep" aria-hidden="true">/</span>
		<div class="wiz-step on" role="listitem" aria-current="step"><span class="n">02</span>Skin</div>
		<span class="step-sep" aria-hidden="true">/</span>
		<div class="wiz-step" role="listitem"><span class="n">03</span>Typography</div>
		<span class="step-sep" aria-hidden="true">/</span>
		<div class="wiz-step" role="listitem"><span class="n">04</span>Preview &amp; export</div>
	</div>

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
		font: 500 12px var(--font-mono);
		color: var(--ink-soft);
		letter-spacing: 0.04em;
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
</style>
