<script lang="ts">
	interface Props {
		mode?: 'light' | 'dark'
	}
	const { mode = 'light' }: Props = $props()

	const palettes: { id: string; label: string; swatches: string[] }[] = [
		{ id: 'warm-gray', label: 'warm gray', swatches: ['#f7f3ea', '#ece4d2', '#d6c8a8', '#9c8e72', '#3a3528'] },
		{ id: 'slate', label: 'slate', swatches: ['#f8fafc', '#e2e8f0', '#94a3b8', '#475569', '#0f172a'] },
		{ id: 'neutral', label: 'neutral', swatches: ['#fafafa', '#e5e5e5', '#a3a3a3', '#525252', '#171717'] },
		{ id: 'shu', label: 'shu', swatches: ['#fff2ee', '#fcd4c6', '#f08667', '#a83d1f', '#5c1d0e'] }
	]
	const shadeLabels = ['50', '200', '500', '700', '950']

	const roles: { role: string; desc: string; light: [string, string]; dark: [string, string] }[] = [
		{ role: 'paper', desc: 'page surface', light: ['warm-gray', '100'], dark: ['warm-gray', '950'] },
		{ role: 'paper-2', desc: 'raised, cards', light: ['warm-gray', '50'], dark: ['warm-gray', '900'] },
		{ role: 'paper-3', desc: 'sunken, hover', light: ['warm-gray', '200'], dark: ['warm-gray', '800'] },
		{ role: 'edge', desc: 'hairlines', light: ['warm-gray', '300'], dark: ['warm-gray', '700'] },
		{ role: 'ink', desc: 'primary text', light: ['warm-gray', '900'], dark: ['warm-gray', '100'] },
		{ role: 'ink-2', desc: 'secondary text', light: ['warm-gray', '700'], dark: ['warm-gray', '300'] },
		{ role: 'accent', desc: 'links · ctas', light: ['shu', '500'], dark: ['shu', '400'] }
	]

	const ramps: Record<string, string[]> = {
		'warm-gray': ['#fbf8f1', '#f0e9d8', '#dfd2af', '#c4b384', '#a18d59', '#7a6845', '#574832', '#3a3025', '#241d16', '#13100b'],
		shu: ['#fff8f5', '#fdd6c6', '#f7a18b', '#ed7559', '#dd4d2e', '#a83d1f', '#7a2a14', '#52190c', '#310f07', '#1a0703']
	}
	const stepKeys = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '950']
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
			{#each palettes as p, i (p.id)}
				<article class="palette-card" data-in-use={i < 2 ? '' : undefined}>
					<header>
						<span class="p-name">{p.label}</span>
						{#if i < 2}<span class="p-badge">IN USE</span>{/if}
					</header>
					<div class="p-swatches">
						{#each p.swatches as c, j (j)}
							<span class="swatch" style="background: {c};"></span>
						{/each}
					</div>
					<div class="p-shades">
						{#each shadeLabels as s (s)}<span>{s}</span>{/each}
					</div>
				</article>
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
						<span class="picker-pal">{r.light[0]}</span>
						<div class="picker-ramp">
							{#each lightRamp as c, i (i)}
								<span
									class="picker-swatch"
									data-selected={stepKeys[i] === r.light[1] ? '' : undefined}
									style="background: {c};"
									title={stepKeys[i]}
								></span>
							{/each}
						</div>
						<span class="picker-step">·{r.light[1]}</span>
					</div>

					<div class="picker" data-active={mode === 'dark' ? '' : undefined}>
						<span class="picker-pal">{r.dark[0]}</span>
						<div class="picker-ramp">
							{#each darkRamp as c, i (i)}
								<span
									class="picker-swatch"
									data-selected={stepKeys[i] === r.dark[1] ? '' : undefined}
									style="background: {c};"
									title={stepKeys[i]}
								></span>
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
		font: 500 11.5px var(--font-mono);
		color: var(--ink-mute);
		min-width: 80px;
		padding: 3px 8px;
		background: var(--paper-soft);
		border: 1px solid var(--paper-edge);
		border-radius: 3px;
	}

	.picker-ramp {
		display: flex;
		gap: 1.5px;
	}

	.picker-swatch {
		width: 14px;
		height: 18px;
		border-radius: 2px;
		border: 1px solid color-mix(in oklab, var(--ink) 8%, transparent);
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
