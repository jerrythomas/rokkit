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
	<h1 class="page-title display">Sessions</h1>

	<!-- Retro Cards -->
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

	<!-- Filters -->
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

	<!-- Session List -->
	<div class="session-list">
		<div class="list-header">
			<span></span>
			<span>Project</span>
			<span>Task</span>
			<span>Corrections</span>
			<span>Duration</span>
			<span>When</span>
		</div>
		{#each filteredSessions as session (session.id)}
			<div class="list-row" data-outcome={session.outcome}>
				<span class="ftr-dot" class:ftr={session.ftr}></span>
				<span class="project mono">{session.project}</span>
				<span class="task">{session.title}</span>
				<span class="corrections mono">{session.corrections}</span>
				<span class="duration mono">{session.duration}</span>
				<span class="time mono">{session.time}</span>
			</div>
		{/each}
		{#if filteredSessions.length === 0}
			<div class="empty-state">No sessions match the current filters.</div>
		{/if}
	</div>
</div>

<style>
	.sessions-page {
		max-width: 920px;
		display: flex;
		flex-direction: column;
		gap: 28px;
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
	}
	.retro-card {
		padding: 16px 18px;
		background: var(--paper-2);
		border: var(--hairline);
		border-radius: var(--radius);
	}
	.retro-card[data-tone='good'] { border-top: 2px solid var(--jade); }
	.retro-card[data-tone='warn'] { border-top: 2px solid var(--amber); }
	.retro-card[data-tone='mute'] { border-top: 2px solid var(--paper-edge); }
	.retro-header {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 10px;
	}
	.retro-kanji {
		font-size: 18px;
		color: var(--sumi-3);
	}
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
	}
	.filter-group {
		display: flex;
		gap: 2px;
	}
	.filter-pill {
		padding: 6px 12px;
		font-size: 11.5px;
		border-radius: var(--radius);
		color: var(--sumi-2);
		text-transform: capitalize;
		transition: all 120ms ease;
	}
	.filter-pill:hover {
		background: var(--paper-3);
	}
	.filter-pill.active {
		background: var(--sumi);
		color: var(--paper);
	}

	/* ── Session List ─────────────────────────────────────────── */
	.list-header,
	.list-row {
		display: grid;
		grid-template-columns: 20px 120px 1fr 80px 60px 60px;
		align-items: center;
		gap: 8px;
		padding: 8px 12px;
	}
	.list-header {
		font-size: 10px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--sumi-4);
		border-bottom: var(--hairline);
	}
	.list-row {
		font-size: 12.5px;
		border-bottom: var(--hairline);
		transition: background 120ms ease;
	}
	.list-row:hover {
		background: var(--paper-2);
	}
	.ftr-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--paper-edge);
	}
	.ftr-dot.ftr {
		background: var(--jade);
	}
	.project {
		font-size: 11px;
		color: var(--sumi-3);
	}
	.task {
		color: var(--sumi);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.corrections {
		font-size: 11px;
		color: var(--sumi-3);
		text-align: center;
	}
	.duration,
	.time {
		font-size: 11px;
		color: var(--sumi-3);
	}
	.empty-state {
		padding: 24px;
		text-align: center;
		color: var(--sumi-4);
		font-size: 13px;
	}
</style>
