<script>
	import { goto } from '$app/navigation'
	import { m } from '$lib/paraglide/messages.js'

	const { data } = $props()

	let currentStep = $state(3)
	const steps = $derived(
		data.steps.map((s, i) => ({
			...s,
			status: i < currentStep ? 'completed' : i === currentStep ? 'current' : 'pending'
		}))
	)
	const current = $derived(steps[currentStep])
	const isLastStep = $derived(currentStep === steps.length - 1)

	let folders = $state([...data.folders])
	let newFolder = $state('')

	function addFolder() {
		const trimmed = newFolder.trim()
		if (trimmed && !folders.includes(trimmed)) {
			folders = [...folders, trimmed]
		}
		newFolder = ''
	}

	function removeFolder(/** @type {string} */ path) {
		folders = folders.filter((f) => f !== path)
	}

	function next() {
		if (isLastStep) {
			goto('/observatory')
		} else {
			currentStep++
		}
	}
	function back() {
		if (currentStep > 0) currentStep--
	}
</script>

<!-- Full-screen wizard layout — no app sidebar -->
<div class="wizard-shell">

	<div class="wizard-grid">
		<!-- ─── Left Rail ──────────────────────────────────────────────── -->
		<aside class="wiz-rail">
			<div class="rail-header">
				<span class="kanji" style="font-size: 22px; color: var(--shu);">道</span>
				<span class="rail-title display">{m.setup_title()}</span>
			</div>

			<div class="rail-stages">
				{#each steps as step, i (step.id)}
					<button
						class="stage"
						class:completed={step.status === 'completed'}
						class:current={step.status === 'current'}
						class:pending={step.status === 'pending'}
						onclick={() => { if (step.status === 'completed') currentStep = i }}
						disabled={step.status === 'pending'}
					>
						<span class="stage-icon">
							{#if step.status === 'completed'}
								<span class="stage-check">✓</span>
							{:else if step.status === 'current'}
								<span class="kanji stage-kanji">{step.kanji}</span>
							{:else}
								<span class="stage-dot"></span>
							{/if}
						</span>
						<span class="stage-text">
							<span class="stage-label">{step.label}</span>
							<span class="stage-desc">{step.description}</span>
						</span>
					</button>
				{/each}
			</div>
		</aside>

		<!-- ─── Main Content ───────────────────────────────────────────── -->
		<div class="wiz-main-col">
			<div class="wiz-content">
				{#if current.id === 'welcome' || (current.id !== 'folders' && current.id !== 'projects')}
					<div class="wiz-header">
						<span class="kanji wiz-kanji">{current.kanji}</span>
						<div>
							<h1 class="wiz-title display">{current.label}</h1>
							<p class="wiz-tagline">{current.description}</p>
						</div>
					</div>
					{#if current.id === 'welcome'}
						<p class="wiz-body">{m.setup_welcome_body()}</p>
						<div class="pillars">
							{#each [['観', m.setup_pillar_observe(), m.setup_pillar_observe_desc()], ['教', m.setup_pillar_teach(), m.setup_pillar_teach_desc()], ['守', m.setup_pillar_local(), m.setup_pillar_local_desc()]] as [k, t, d]}
								<div class="pillar">
									<span class="kanji pillar-kanji">{k}</span>
									<h3 class="pillar-title">{t}</h3>
									<p class="pillar-desc">{d}</p>
								</div>
							{/each}
						</div>
						<p class="wiz-footnote">{m.setup_welcome_time()}</p>
					{:else}
						<p class="wiz-body">This step will be implemented in a future iteration.</p>
					{/if}

				{:else if current.id === 'folders'}
					<div class="wiz-header">
						<span class="kanji wiz-kanji">{current.kanji}</span>
						<div>
							<h1 class="wiz-title display">{m.setup_folders_title()}</h1>
							<p class="wiz-tagline">{m.setup_folders_desc()}</p>
						</div>
					</div>
					<div class="folders-list">
						{#each folders as folder (folder)}
							<div class="folder-row">
								<span class="mono folder-path">{folder}</span>
								<button class="folder-remove" onclick={() => removeFolder(folder)}>×</button>
							</div>
						{/each}
					</div>
					<form class="folder-add" onsubmit={(e) => { e.preventDefault(); addFolder() }}>
						<input class="folder-input" type="text" placeholder="~/code/project" bind:value={newFolder} />
						<button class="btn-solid" type="submit">{m.setup_folders_add()}</button>
					</form>
					<p class="wiz-footnote">{m.setup_folders_min()}</p>

				{:else if current.id === 'projects'}
					<div class="wiz-header">
						<span class="kanji wiz-kanji">{current.kanji}</span>
						<div>
							<h1 class="wiz-title display">{m.setup_projects_title()}</h1>
							<p class="wiz-tagline">{m.setup_projects_desc()}</p>
						</div>
					</div>
					<div class="projects-grid">
						{#each data.projects as project (project.id)}
							<div class="project-card" class:confirmed={project.confirmed}>
								<div class="project-header">
									<h3 class="project-name">{project.name}</h3>
									<span class="project-role mono">{project.role}</span>
								</div>
								<div class="project-repos">
									{#each project.repos as repo}
										<span class="project-repo mono">{repo}</span>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- ─── Bottom Progress Bar ────────────────────────────────── -->
			<div class="wiz-bottom">
				<button class="btn-outline" onclick={back} disabled={currentStep === 0}>{m.setup_back()}</button>
				<div class="progress-ticks">
					{#each steps as _, i}
						<span class="tick" class:filled={i <= currentStep}></span>
					{/each}
				</div>
				<button
					class="btn-solid"
					onclick={next}
					disabled={!isLastStep && current.id === 'folders' && folders.length === 0}
				>
					{isLastStep ? m.setup_enter() : m.setup_continue()}
				</button>
			</div>
		</div>
	</div>
</div>

<style>
	/* ── Shell: full viewport ──────────────────────────────────── */
	.wizard-shell {
		width: 100%;
		height: 100vh;
		display: flex;
		flex-direction: column;
		background: var(--paper);
	}

	.wizard-grid {
		flex: 1;
		display: grid;
		grid-template-columns: 260px 1fr;
		min-height: 0;
	}

	/* ── Left Rail ─────────────────────────────────────────────── */
	.wiz-rail {
		background: var(--paper-2);
		border-right: var(--hairline);
		display: flex;
		flex-direction: column;
		overflow: hidden;
		padding: 26px 22px;
		gap: 28px;
	}

	.rail-header {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.rail-title {
		font-size: 20px;
		font-weight: 400;
		color: var(--sumi);
	}

	.rail-stages {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.stage {
		display: grid;
		grid-template-columns: 24px 1fr;
		align-items: center;
		gap: 10px;
		padding: 7px 10px;
		border-radius: var(--radius);
		border: 1px solid transparent;
		text-align: left;
		transition: all 120ms ease;
	}
	.stage:hover:not(:disabled) {
		background: oklch(0.22 0.012 50 / 0.03);
	}
	.stage.current {
		padding: 10px 10px;
		background: var(--paper);
		border: var(--border-card);
	}
	.stage:disabled { cursor: default; }

	.stage-icon {
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.stage-check { color: var(--jade); font-size: 13px; font-weight: 600; }
	.stage-kanji { font-size: 15px; color: var(--shu); }
	.stage-dot {
		width: 5px; height: 5px;
		border-radius: 50%;
		background: var(--sumi-4);
	}

	.stage-text { display: flex; flex-direction: column; }
	.stage-label { font-size: 13px; font-weight: 500; color: var(--sumi); }
	.stage.completed .stage-label { color: var(--sumi-2); }
	.stage.pending .stage-label { color: var(--sumi-4); }
	.stage-desc { font-size: 10px; color: var(--sumi-3); }
	.stage.pending .stage-desc { color: var(--sumi-4); }

	/* ── Main Column ──────────────────────────────────────────── */
	.wiz-main-col {
		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	.wiz-content {
		flex: 1;
		overflow: auto;
		padding: 44px 64px 32px;
	}

	.wiz-header {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-bottom: 28px;
	}
	.wiz-kanji { font-size: 36px; color: var(--shu); }
	.wiz-title { font-size: 28px; font-weight: 300; color: var(--sumi); margin: 0; }
	.wiz-tagline { font-size: 13px; color: var(--sumi-3); margin: 4px 0 0; }
	.wiz-body {
		font-family: var(--font-display);
		font-size: 18px;
		font-weight: 300;
		color: var(--sumi-2);
		line-height: 1.6;
		margin: 0 0 24px;
	}
	.wiz-footnote { font-size: 11px; color: var(--sumi-4); margin-top: 16px; }

	/* ── Pillars ──────────────────────────────────────────────── */
	.pillars { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 24px 0; }
	.pillar {
		padding: 18px;
		background: var(--paper-2);
		border: var(--border-card);
		border-radius: var(--radius);
		text-align: center;
	}
	.pillar-kanji { font-size: 28px; color: var(--shu); }
	.pillar-title { font-size: 14px; font-weight: 600; color: var(--sumi); margin: 8px 0 4px; }
	.pillar-desc { font-size: 12px; color: var(--sumi-2); line-height: 1.5; margin: 0; }

	/* ── Folders ──────────────────────────────────────────────── */
	.folders-list { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
	.folder-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 12px;
		background: var(--paper-2);
		border: var(--border-card);
		border-radius: var(--radius);
	}
	.folder-path { font-size: 13px; color: var(--sumi); }
	.folder-remove {
		color: var(--sumi-4); font-size: 16px; width: 24px; height: 24px;
		display: flex; align-items: center; justify-content: center; border-radius: 4px;
	}
	.folder-remove:hover { background: oklch(0.22 0.012 50 / 0.04); color: var(--shu); }
	.folder-add { display: flex; gap: 8px; }
	.folder-input {
		flex: 1; padding: 10px 14px; font-size: 13px;
		background: var(--paper-2); border: var(--border-input);
		border-radius: var(--radius); outline: none;
	}
	.folder-input:focus { border: var(--border-focus); }

	/* ── Projects ─────────────────────────────────────────────── */
	.projects-grid { display: flex; flex-direction: column; gap: 10px; }
	.project-card {
		padding: 16px 18px;
		background: var(--paper-2);
		border: var(--border-card);
		border-radius: var(--radius);
	}
	.project-card.confirmed { border-left: 2px solid var(--jade-soft); }
	.project-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
	.project-name { font-size: 14px; font-weight: 500; color: var(--sumi); margin: 0; }
	.project-role { font-size: 10px; color: var(--sumi-3); text-transform: uppercase; }
	.project-repos { display: flex; gap: 6px; flex-wrap: wrap; }
	.project-repo {
		font-size: 11px; padding: 3px 8px;
		background: oklch(0.22 0.012 50 / 0.04);
		border-radius: 4px; color: var(--sumi-2);
	}

	/* ── Bottom Bar ───────────────────────────────────────────── */
	.wiz-bottom {
		border-top: var(--hairline);
		padding: 14px 64px;
		display: flex;
		align-items: center;
		gap: 20px;
		background: var(--paper);
	}

	.progress-ticks {
		flex: 1;
		display: flex;
		gap: 4px;
		align-items: center;
	}
	.tick {
		flex: 1;
		height: 2px;
		border-radius: 1px;
		background: oklch(0.22 0.012 50 / 0.08);
		transition: background 0.2s;
	}
	.tick.filled {
		background: var(--sumi);
	}
</style>
