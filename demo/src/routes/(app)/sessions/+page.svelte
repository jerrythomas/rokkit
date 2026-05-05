<script>
	import { m } from '$lib/paraglide/messages.js'

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

<div class="max-w-[1060px] mx-auto px-[48px] pt-[36px] pb-[48px]">

	<div class="mb-8">
		<span class="mono block text-[10.5px] uppercase text-surface-z5 tracking-[0.06em] mb-1">{m.sessions_subtitle()}</span>
		<h1 class="font-display text-[28px] font-light text-surface-z9 m-0">{m.sessions_title()}</h1>
	</div>

	<!-- ─── Retro Cards ───────────────────────────────────────── -->
	<div class="retro-grid grid grid-cols-3 gap-3 mb-7">
		{#each data.retro as section (section.title)}
			<div
				class="px-[18px] py-4 bg-surface-z1 border border-surface-z2 rounded-md"
				style="border-top: 2px solid {section.tone === 'good' ? 'color-mix(in oklch, var(--color-success-500) 14%, transparent)' : section.tone === 'warn' ? 'color-mix(in oklch, var(--color-warning-500) 15%, transparent)' : 'color-mix(in oklch, var(--color-surface-900) 6%, transparent)'}"
			>
				<div class="flex items-center gap-2 mb-[10px]">
					<span class="kanji text-[18px] {section.tone === 'good' ? 'text-success-z5' : section.tone === 'warn' ? 'text-warning-z5' : 'text-surface-z5'}">{section.kanji}</span>
					<h3 class="text-[13px] font-semibold text-surface-z9 m-0">{section.title}</h3>
				</div>
				<ul class="list-none p-0 m-0 flex flex-col gap-[6px]">
					{#each section.items as item (item)}
						<li class="text-[11.5px] text-surface-z7 leading-[1.5]">{item}</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>

	<!-- ─── Filters ───────────────────────────────────────────── -->
	<div class="flex gap-4 flex-wrap mb-5">
		<div class="filter-group flex gap-[2px]">
			{#each ['all', ...data.filters.outcomes] as outcome (outcome)}
				<button
					class="filter-pill px-3 py-[6px] text-[11.5px] rounded-md capitalize transition-colors duration-[120ms] {activeFilter === outcome ? 'bg-surface-z9 text-surface-z0' : 'text-surface-z7 hover:bg-surface-z1'}"
					onclick={() => (activeFilter = outcome)}
				>
					{outcome === 'all' ? m.filter_all() : outcome}
				</button>
			{/each}
		</div>
		<div class="filter-group flex gap-[2px]">
			{#each ['all', ...data.filters.projects] as project (project)}
				<button
					class="filter-pill px-3 py-[6px] text-[11.5px] rounded-md capitalize transition-colors duration-[120ms] {activeProject === project ? 'bg-surface-z9 text-surface-z0' : 'text-surface-z7 hover:bg-surface-z1'}"
					onclick={() => (activeProject = project)}
				>
					{project === 'all' ? m.filter_all_projects() : project}
				</button>
			{/each}
		</div>
	</div>

	<!-- ─── Session List ──────────────────────────────────────── -->
	<div class="sessions-table flex flex-col">
		{#each filteredSessions as session (session.id)}
			<div
				class="grid items-center gap-4 px-1 py-[9px] border-b border-surface-z2 transition-colors hover:bg-surface-z1"
				style="grid-template-columns: auto 120px 1fr auto auto auto"
			>
				<span class="w-2 h-2 rounded-full {session.ftr ? 'bg-success-z5' : 'bg-surface-z4'}"></span>
				<span class="mono text-[11.5px] text-surface-z5">{session.project}</span>
				<span class="text-[13px] text-surface-z9 whitespace-nowrap overflow-hidden text-ellipsis">{session.title}</span>
				<span class="mono text-[10.5px] text-surface-z5 text-right">
					{session.corrections === 0 ? m.session_first_try() : m.session_corrections({ count: session.corrections.toString() })}
				</span>
				<span class="mono text-[11px] text-surface-z5 text-right">{session.duration}</span>
				<span class="mono text-[10.5px] text-surface-z4 text-right">{session.time}</span>
			</div>
		{/each}
		{#if filteredSessions.length === 0}
			<div class="p-6 text-center text-surface-z4 text-[13px]">{m.no_sessions_match()}</div>
		{/if}
	</div>
</div>
