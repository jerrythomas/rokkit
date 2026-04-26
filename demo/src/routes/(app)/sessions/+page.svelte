<script>
	const { data } = $props()

	let activeFilter = $state('all')
	let activeProject = $state('all')

	const filteredSessions = $derived(
		data.sessions.filter((s) => {
			if (activeFilter !== 'all' && s.outcome !== activeFilter) return false
			if (activeProject !== 'all' && s.project !== activeProject) return false
			return true
		})
	)
</script>

<div class="sessions-page">

	<div class="page-header">
		<span class="page-subtitle mono">Cross-project retrospective</span>
		<h1 class="page-title display">Sessions</h1>
	</div>

	<!-- ─── Retro Cards ───────────────────────────────────────── -->
	<div class="retro-grid">
		{#each data.retro as section (section.title)}
			<div class="retro-card" data-tone={section.tone}>
				<div class="retro-header">
					<span class="kanji retro-kanji">{section.kanji}</span>
					<h3 class="retro-title">{section.title}</h3>
				</div>
				<ul class="retro-list">
					{#each section.items as item}
						<li>{item}</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>

	<!-- ─── Filters ───────────────────────────────────────────── -->
	<div class="filter-bar">
		<div class="filter-group">
			{#each ['all', ...data.filters.outcomes] as outcome (outcome)}
				<button
					class="filter-pill"
					class:active={activeFilter === outcome}
					onclick={() => (activeFilter = outcome)}
				>
					{outcome === 'all' ? 'All' : outcome}
				</button>
			{/each}
		</div>
		<div class="filter-group">
			{#each ['all', ...data.filters.projects] as project (project)}
				<button
					class="filter-pill"
					class:active={activeProject === project}
					onclick={() => (activeProject = project)}
				>
					{project === 'all' ? 'All projects' : project}
				</button>
			{/each}
		</div>
	</div>

	<!-- ─── Session List ──────────────────────────────────────── -->
	<div class="sessions-table">
		{#each filteredSessions as session (session.id)}
			<div class="session-row">
				<span class="session-dot" class:ftr={session.ftr}></span>
				<span class="session-project mono">{session.project}</span>
				<span class="session-title">{session.title}</span>
				<span class="session-corrections mono">
					{session.corrections === 0 ? 'first-try' : `${session.corrections}×`}
				</span>
				<span class="session-duration mono">{session.duration}</span>
				<span class="session-time mono">{session.time}</span>
			</div>
		{/each}
		{#if filteredSessions.length === 0}
			<div class="empty-state">No sessions match the current filters.</div>
		{/if}
	</div>
</div>

<style>
	.sessions-page {
		max-width: 1060px;
		margin: 0 auto;
		padding: 36px 48px 48px;
	}

	.page-header { margin-bottom: 32px; }
	.page-subtitle {
		font-size: 10.5px;
		text-transform: uppercase;
		color: var(--sumi-3);
		letter-spacing: 0.06em;
		display: block;
		margin-bottom: 4px;
	}
	.page-title {
		font-size: 28px;
		font-weight: 300;
		color: var(--sumi);
		margin: 0;
	}

	/* ── Retro Cards ──────────────────────────────────────────── */
	.retro-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;
		margin-bottom: 28px;
	}
	.retro-card {
		padding: 16px 18px;
		background: var(--paper-2);
		border: var(--border-card);
		border-radius: var(--radius);
	}
	.retro-card[data-tone='good'] { border-top: 2px solid var(--jade-soft); }
	.retro-card[data-tone='warn'] { border-top: 2px solid var(--amber-soft); }
	.retro-card[data-tone='mute'] { border-top: 2px solid oklch(0.22 0.012 50 / 0.06); }
	.retro-header {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 10px;
	}
	.retro-kanji { font-size: 18px; color: var(--sumi-3); }
	.retro-card[data-tone='good'] .retro-kanji { color: var(--jade); }
	.retro-card[data-tone='warn'] .retro-kanji { color: var(--amber); }
	.retro-title {
		font-size: 13px;
		font-weight: 600;
		color: var(--sumi);
		margin: 0;
	}
	.retro-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.retro-list li {
		font-size: 11.5px;
		color: var(--sumi-2);
		line-height: 1.5;
	}

	/* ── Filters ──────────────────────────────────────────────── */
	.filter-bar {
		display: flex;
		gap: 16px;
		flex-wrap: wrap;
		margin-bottom: 20px;
	}
	.filter-group { display: flex; gap: 2px; }
	.filter-pill {
		padding: 6px 12px;
		font-size: 11.5px;
		border-radius: var(--radius);
		color: var(--sumi-2);
		text-transform: capitalize;
		transition: all 120ms ease;
	}
	.filter-pill:hover { background: oklch(0.22 0.012 50 / 0.04); }
	.filter-pill.active { background: var(--sumi); color: var(--paper); }

	/* ── Sessions Table ───────────────────────────────────────── */
	.sessions-table { display: flex; flex-direction: column; }
	.session-row {
		display: grid;
		grid-template-columns: auto 120px 1fr auto auto auto;
		gap: 16px;
		align-items: center;
		padding: 9px 4px;
		border-bottom: var(--ink-line);
		transition: background 120ms ease;
	}
	.session-row:hover { background: oklch(0.22 0.012 50 / 0.03); }
	.session-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--sumi-4); }
	.session-dot.ftr { background: var(--jade); }
	.session-project { font-size: 11.5px; color: var(--sumi-3); }
	.session-title { font-size: 13px; color: var(--sumi); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.session-corrections { font-size: 10.5px; color: var(--sumi-3); text-align: right; }
	.session-duration { font-size: 11px; color: var(--sumi-3); text-align: right; }
	.session-time { font-size: 10.5px; color: var(--sumi-4); text-align: right; }
	.empty-state { padding: 24px; text-align: center; color: var(--sumi-4); font-size: 13px; }
</style>
