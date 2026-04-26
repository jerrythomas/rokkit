<script>
	import Sparkline from '$lib/components/Sparkline.svelte'
	import EnsoRing from '$lib/components/EnsoRing.svelte'
	import { m } from '$lib/paraglide/messages.js'

	const { data } = $props()
</script>

<div class="obs-home">

	<!-- ─── Greeting + FTR ─────────────────────────────────────────────── -->
	<div class="greeting-row">
		<div class="greeting-left">
			<span class="greeting-date mono">{data.greeting.date}</span>
			<h1 class="greeting-title display">{m.greeting_morning({ name: data.greeting.name })}</h1>
		</div>
		<div class="greeting-right">
			<EnsoRing score={data.ftr.score} size={110} />
			<div class="ftr-text">
				<span class="ftr-label mono">{m.ftr_label()} · {data.ftr.period}</span>
				<Sparkline data={data.ftr.trend} width={150} height={36} />
				<span class="ftr-delta mono">
					{m.ftr_vs_prior({ delta: Math.abs(data.ftr.delta).toString() })}
				</span>
			</div>
		</div>
	</div>

	<!-- ─── Hero Koan ──────────────────────────────────────────────────── -->
	<section class="koan-hero">
		<div class="koan-left">
			<span class="kanji koan-kanji">{data.koan.kanji}</span>
		</div>
		<div class="koan-right">
			<h2 class="koan-title display">{data.koan.title}</h2>
			<p class="koan-body">{data.koan.explanation}</p>
			<div class="koan-actions">
				<button class="btn-solid">{m.koan_action()}</button>
				<span class="koan-impact">{m.koan_projected_ftr({ pct: '14' })} · {data.koan.impact}</span>
				<span style="flex:1"></span>
				<span class="koan-evidence mono">{data.koan.evidence}</span>
			</div>
		</div>
	</section>

	<!-- ─── Insights + Adopted (two-column) ────────────────────────────── -->
	<div class="two-col">
		<section class="insights-col">
			<h3 class="section-header display">{m.section_insights()}</h3>
			<div class="insight-list">
				{#each data.insights as insight (insight.id)}
					<div class="insight-row" data-tone={insight.tone}>
						<span class="kanji insight-kanji">{insight.kanji}</span>
						<div class="insight-body">
							<span class="insight-label">{insight.title}</span>
							<span class="insight-text">{insight.body}</span>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<section class="adopted-col">
			<h3 class="section-header display">{m.section_adopted()}</h3>
			<div class="adopted-list">
				{#each data.adoptedTeachings as teaching, i}
					<div class="adopted-card">
						<span class="adopted-text">{teaching}</span>
					</div>
				{/each}
			</div>
		</section>
	</div>

	<!-- ─── Recent Sessions ────────────────────────────────────────────── -->
	<section class="sessions-section">
		<h3 class="section-header display">{m.section_sessions()}</h3>
		<div class="sessions-table">
			{#each data.sessions as session (session.id)}
				<div class="session-row">
					<span class="session-dot" class:ftr={session.ftr}></span>
					<span class="session-project mono">{session.project}</span>
					<span class="session-title">{session.title}</span>
					<span class="session-corrections mono">
						{session.corrections === 0 ? m.session_first_try() : m.session_corrections({ count: session.corrections.toString() })}
					</span>
					<span class="session-duration mono">{session.duration}</span>
					<span class="session-time mono">{session.time}</span>
				</div>
			{/each}
		</div>
	</section>
</div>

<style>
	.obs-home {
		max-width: 1060px;
		margin: 0 auto;
		padding: 36px 48px 48px;
	}

	/* ── Greeting Row ─────────────────────────────────────────── */
	.greeting-row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		margin-bottom: 32px;
	}
	.greeting-left {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.greeting-date {
		font-size: 10.5px;
		text-transform: uppercase;
		color: var(--sumi-3);
		letter-spacing: 0.06em;
	}
	.greeting-title {
		font-size: 28px;
		font-weight: 300;
		color: var(--sumi);
		margin: 0;
	}
	.greeting-right {
		display: flex;
		gap: 16px;
		align-items: center;
	}
	.ftr-text {
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-width: 150px;
	}
	.ftr-label {
		font-size: 11px;
		color: var(--sumi-3);
	}
	.ftr-delta {
		font-size: 11px;
		color: var(--sumi-2);
	}

	/* ── Hero Koan ────────────────────────────────────────────── */
	.koan-hero {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 28px;
		padding: 32px 34px 30px;
		background: var(--paper-2);
		border: var(--border-card);
		border-radius: var(--radius-lg);
		margin-bottom: 36px;
	}
	.koan-left {
		position: relative;
	}
	.koan-kanji {
		font-size: 96px;
		color: var(--shu);
		line-height: 1;
	}
	.koan-right {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.koan-title {
		font-size: 28px;
		font-weight: 400;
		color: var(--sumi);
		margin: 0;
	}
	.koan-body {
		font-size: 14.5px;
		color: var(--sumi-2);
		line-height: 1.6;
		margin: 0;
	}
	.koan-actions {
		display: flex;
		gap: 16px;
		flex-wrap: wrap;
		align-items: center;
		margin-top: auto;
	}
	.koan-impact {
		font-size: 12px;
		color: var(--shu);
	}
	.koan-evidence {
		font-size: 10.5px;
		color: var(--sumi-4);
	}

	/* ── Section Header ───────────────────────────────────────── */
	.section-header {
		font-size: 17px;
		font-weight: 400;
		color: var(--sumi);
		margin: 0 0 14px;
	}

	/* ── Two-Column (Insights + Adopted) ──────────────────────── */
	.two-col {
		display: grid;
		grid-template-columns: 1.4fr 1fr;
		gap: 30px;
		margin-bottom: 40px;
	}

	/* Insights */
	.insight-list {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.insight-row {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 12px;
		padding: 10px 12px;
		border-radius: var(--radius);
		transition: background 120ms ease;
	}
	.insight-row:hover {
		background: oklch(0.22 0.012 50 / 0.03);
	}
	.insight-kanji {
		font-size: 19px;
		color: var(--sumi-3);
	}
	.insight-row[data-tone='warn'] .insight-kanji { color: var(--amber); }
	.insight-row[data-tone='good'] .insight-kanji { color: var(--jade); }
	.insight-body {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.insight-label {
		font-size: 10.5px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--sumi-3);
		font-weight: 500;
	}
	.insight-text {
		font-size: 13.5px;
		color: var(--sumi-2);
		line-height: 1.5;
	}

	/* Adopted */
	.adopted-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.adopted-card {
		padding: 12px 14px;
		background: var(--paper-2);
		border-left: 2px solid var(--shu-soft);
		border-radius: 0 var(--radius) var(--radius) 0;
	}
	.adopted-text {
		font-size: 13px;
		color: var(--sumi-2);
		line-height: 1.5;
	}

	/* ── Sessions Table ───────────────────────────────────────── */
	.sessions-table {
		display: flex;
		flex-direction: column;
	}
	.session-row {
		display: grid;
		grid-template-columns: auto 120px 1fr auto auto auto;
		gap: 16px;
		align-items: center;
		padding: 9px 4px;
		border-bottom: var(--ink-line);
		transition: background 120ms ease;
	}
	.session-row:hover {
		background: oklch(0.22 0.012 50 / 0.03);
	}
	.session-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--sumi-4);
	}
	.session-dot.ftr {
		background: var(--jade);
	}
	.session-project {
		font-size: 11.5px;
		color: var(--sumi-3);
	}
	.session-title {
		font-size: 13px;
		color: var(--sumi);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.session-corrections {
		font-size: 10.5px;
		color: var(--sumi-3);
		text-align: right;
	}
	.session-duration {
		font-size: 11px;
		color: var(--sumi-3);
		text-align: right;
	}
	.session-time {
		font-size: 10.5px;
		color: var(--sumi-4);
		text-align: right;
	}
</style>
