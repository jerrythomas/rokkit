<script>
	import Sparkline from '$lib/components/Sparkline.svelte'
	import EnsoRing from '$lib/components/EnsoRing.svelte'

	const { data } = $props()
</script>

<div class="observatory">

	<!-- Greeting -->
	<div class="greeting">
		<span class="greeting-date">{data.greeting.date}</span>
		<span class="greeting-hello">Good morning, {data.greeting.name}.</span>
	</div>

	<!-- FTR Hero -->
	<section class="ftr-hero">
		<div class="ftr-gauge">
			<EnsoRing score={data.ftr.score} size={110} />
		</div>
		<div class="ftr-detail">
			<h2 class="ftr-label">First-Try-Right</h2>
			<div class="ftr-stats">
				<span class="ftr-score display">{data.ftr.score}%</span>
				<span class="ftr-delta" class:positive={data.ftr.delta > 0} class:negative={data.ftr.delta < 0}>
					{data.ftr.delta > 0 ? '+' : ''}{data.ftr.delta}%
				</span>
				<span class="ftr-period mono">{data.ftr.period}</span>
			</div>
			<div class="ftr-trend">
				<Sparkline data={data.ftr.trend} width={160} height={32} />
			</div>
		</div>
	</section>

	<!-- Hero Koan -->
	<section class="koan-hero">
		<span class="koan-kanji kanji">{data.koan.kanji}</span>
		<div class="koan-content">
			<h2 class="koan-title">{data.koan.title}</h2>
			<p class="koan-explanation">{data.koan.explanation}</p>
			<p class="koan-impact">{data.koan.impact}</p>
			<span class="koan-evidence mono">{data.koan.evidence}</span>
		</div>
	</section>

	<!-- Insights -->
	<section class="insights-section">
		<h3 class="section-title">Insights</h3>
		<div class="insights-grid">
			{#each data.insights as insight (insight.id)}
				<div class="insight-card" data-tone={insight.tone}>
					<span class="insight-kanji kanji">{insight.kanji}</span>
					<div class="insight-content">
						<h4 class="insight-title">{insight.title}</h4>
						<p class="insight-body">{insight.body}</p>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Adopted Teachings -->
	{#if data.adoptedTeachings.length > 0}
		<section class="teachings-section">
			<h3 class="section-title">System has learned</h3>
			<ul class="teachings-list">
				{#each data.adoptedTeachings as teaching}
					<li class="teaching-item">{teaching}</li>
				{/each}
			</ul>
		</section>
	{/if}

	<!-- Recent Sessions -->
	<section class="sessions-section">
		<h3 class="section-title">Recent sessions</h3>
		<div class="sessions-table">
			<div class="sessions-header">
				<span></span>
				<span>Project</span>
				<span>Task</span>
				<span>Corrections</span>
				<span>Duration</span>
				<span>When</span>
			</div>
			{#each data.sessions as session (session.id)}
				<div class="session-row">
					<span class="session-ftr-dot" class:ftr={session.ftr}></span>
					<span class="session-project mono">{session.project}</span>
					<span class="session-title">{session.title}</span>
					<span class="session-corrections mono">{session.corrections}</span>
					<span class="session-duration mono">{session.duration}</span>
					<span class="session-time mono">{session.time}</span>
				</div>
			{/each}
		</div>
	</section>
</div>

<style>
	.observatory {
		max-width: 860px;
		display: flex;
		flex-direction: column;
		gap: 32px;
	}

	/* ── Greeting ─────────────────────────────────────────────── */
	.greeting {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.greeting-date {
		font-size: 12px;
		color: var(--sumi-3);
		font-weight: 500;
	}
	.greeting-hello {
		font-family: var(--font-display);
		font-size: 28px;
		font-weight: 300;
		color: var(--sumi);
		letter-spacing: -0.02em;
	}

	/* ── FTR Hero ─────────────────────────────────────────────── */
	.ftr-hero {
		display: flex;
		align-items: center;
		gap: 28px;
		padding: 28px 32px;
		background: var(--paper-2);
		border: var(--border-card);
		border-radius: var(--radius-lg);
	}
	.ftr-detail {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.ftr-label {
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--sumi-3);
		margin: 0;
	}
	.ftr-stats {
		display: flex;
		align-items: baseline;
		gap: 10px;
	}
	.ftr-score {
		font-size: 36px;
		color: var(--sumi);
	}
	.ftr-delta {
		font-size: 13px;
		font-weight: 500;
	}
	.ftr-delta.positive { color: var(--jade); }
	.ftr-delta.negative { color: var(--shu); }
	.ftr-period {
		font-size: 11px;
		color: var(--sumi-4);
	}

	/* ── Koan Hero ────────────────────────────────────────────── */
	.koan-hero {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 24px;
		padding: 28px 32px;
		background: var(--paper-2);
		border: var(--border-card);
		border-radius: var(--radius-lg);
	}
	.koan-kanji {
		font-size: 72px;
		color: var(--shu);
		line-height: 1;
	}
	.koan-content {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.koan-title {
		font-family: var(--font-display);
		font-size: 20px;
		font-weight: 400;
		color: var(--sumi);
		margin: 0;
		letter-spacing: -0.01em;
	}
	.koan-explanation {
		font-size: 13px;
		color: var(--sumi-2);
		line-height: 1.6;
		margin: 0;
	}
	.koan-impact {
		font-size: 12px;
		color: var(--sumi-3);
		margin: 0;
	}
	.koan-evidence {
		font-size: 10px;
		color: var(--sumi-4);
	}

	/* ── Section ──────────────────────────────────────────────── */
	.section-title {
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--sumi-3);
		margin: 0 0 12px;
	}

	/* ── Insights ─────────────────────────────────────────────── */
	.insights-grid {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.insight-card {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 14px;
		padding: 14px 18px;
		background: var(--paper-2);
		border: var(--border-card);
		border-radius: var(--radius);
	}
	.insight-card[data-tone='warn'] { border-left: 2px solid var(--amber-soft); }
	.insight-card[data-tone='good'] { border-left: 2px solid var(--jade-soft); }
	.insight-card[data-tone='mute'] { border-left: 2px solid oklch(0.22 0.012 50 / 0.06); }
	.insight-kanji {
		font-size: 20px;
		color: var(--sumi-3);
	}
	.insight-content {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.insight-title {
		font-size: 13px;
		font-weight: 500;
		color: var(--sumi);
		margin: 0;
	}
	.insight-body {
		font-size: 12px;
		color: var(--sumi-2);
		line-height: 1.5;
		margin: 0;
	}

	/* ── Teachings ─────────────────────────────────────────────── */
	.teachings-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.teaching-item {
		font-size: 12px;
		color: var(--sumi-2);
		padding: 8px 12px;
		background: var(--paper-2);
		border-radius: var(--radius);
		border: var(--border-card);
	}
	.teaching-item::before {
		content: '✓ ';
		color: var(--jade);
		font-weight: 600;
	}

	/* ── Sessions Table ───────────────────────────────────────── */
	.sessions-table {
		display: flex;
		flex-direction: column;
	}
	.sessions-header,
	.session-row {
		display: grid;
		grid-template-columns: 20px 120px 1fr 80px 60px 60px;
		align-items: center;
		gap: 8px;
		padding: 8px 12px;
	}
	.sessions-header {
		font-size: 10px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--sumi-4);
		border-bottom: var(--ink-line);
	}
	.session-row {
		font-size: 12.5px;
		border-bottom: var(--ink-line);
		transition: background 120ms ease;
	}
	.session-row:hover {
		background: oklch(0.22 0.012 50 / 0.03);
	}
	.session-ftr-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--sumi-4);
	}
	.session-ftr-dot.ftr {
		background: var(--jade);
	}
	.session-project {
		font-size: 11px;
		color: var(--sumi-3);
	}
	.session-title {
		color: var(--sumi);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.session-corrections {
		font-size: 11px;
		color: var(--sumi-3);
		text-align: center;
	}
	.session-duration,
	.session-time {
		font-size: 11px;
		color: var(--sumi-3);
	}
</style>
