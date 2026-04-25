<script>
	const { data } = $props()

	let currentStep = $state(3) // Index into steps array (0-based), starts at 'folders'
	const steps = $derived(
		data.steps.map((s, i) => ({
			...s,
			status: i < currentStep ? 'completed' : i === currentStep ? 'current' : 'pending'
		}))
	)
	const current = $derived(steps[currentStep])

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
		if (currentStep < steps.length - 1) currentStep++
	}
	function back() {
		if (currentStep > 0) currentStep--
	}
</script>

<div class="wizard-layout">

	<!-- Left Rail Stepper -->
	<aside class="wizard-rail">
		<div class="rail-header">
			<span class="kanji" style="font-size: 22px; color: var(--shu);">道</span>
			<span class="rail-title display">Setup</span>
		</div>
		<div class="rail-steps">
			{#each steps as step, i (step.id)}
				<button
					class="step-item"
					class:completed={step.status === 'completed'}
					class:current={step.status === 'current'}
					class:pending={step.status === 'pending'}
					onclick={() => { if (step.status === 'completed') currentStep = i }}
					disabled={step.status === 'pending'}
				>
					<span class="step-indicator">
						{#if step.status === 'completed'}
							<span class="step-check">✓</span>
						{:else if step.status === 'current'}
							<span class="step-kanji kanji">{step.kanji}</span>
						{:else}
							<span class="step-dot"></span>
						{/if}
					</span>
					<span class="step-text">
						<span class="step-label">{step.label}</span>
						<span class="step-desc">{step.description}</span>
					</span>
				</button>
			{/each}
		</div>

		<!-- Progress bar -->
		<div class="rail-progress">
			<div class="progress-track">
				<div class="progress-fill" style="width: {((currentStep) / (steps.length - 1)) * 100}%"></div>
			</div>
			<span class="progress-text mono">{currentStep + 1} / {steps.length}</span>
		</div>
	</aside>

	<!-- Main Content -->
	<main class="wizard-main">
		{#if current.id === 'welcome' || (current.id !== 'folders' && current.id !== 'projects')}
			<!-- Welcome / generic step -->
			<div class="wiz-content">
				<div class="wiz-header">
					<span class="kanji wiz-kanji">{current.kanji}</span>
					<div>
						<h1 class="wiz-title display">{current.label}</h1>
						<p class="wiz-tagline">{current.description}</p>
					</div>
				</div>
				{#if current.id === 'welcome'}
					<p class="wiz-body">A teacher does not write the code.</p>
					<div class="pillars">
						{#each [['観', 'Observe', 'Watch how you and your assistants work together.'], ['教', 'Teach', 'Turn corrections into lasting patterns.'], ['守', 'Local', 'Nothing leaves your machine. Ever.']] as [k, t, d]}
							<div class="pillar">
								<span class="kanji pillar-kanji">{k}</span>
								<h3 class="pillar-title">{t}</h3>
								<p class="pillar-desc">{d}</p>
							</div>
						{/each}
					</div>
					<p class="wiz-footnote">~4 minutes. Nothing leaves your machine.</p>
				{:else}
					<p class="wiz-body">This step will be implemented in a future iteration.</p>
				{/if}
			</div>

		{:else if current.id === 'folders'}
			<!-- Folders step -->
			<div class="wiz-content">
				<div class="wiz-header">
					<span class="kanji wiz-kanji">{current.kanji}</span>
					<div>
						<h1 class="wiz-title display">Folders</h1>
						<p class="wiz-tagline">Add the root paths where your code lives.</p>
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
					<input
						class="folder-input"
						type="text"
						placeholder="~/code/project"
						bind:value={newFolder}
					/>
					<button class="folder-btn" type="submit">Add</button>
				</form>
				<p class="wiz-footnote">Minimum 1 folder required to continue.</p>
			</div>

		{:else if current.id === 'projects'}
			<!-- Projects step -->
			<div class="wiz-content">
				<div class="wiz-header">
					<span class="kanji wiz-kanji">{current.kanji}</span>
					<div>
						<h1 class="wiz-title display">Projects</h1>
						<p class="wiz-tagline">Group related repositories into projects.</p>
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
			</div>
		{/if}

		<!-- Navigation buttons -->
		<div class="wiz-nav">
			<button class="nav-btn outline" onclick={back} disabled={currentStep === 0}>Back</button>
			<button
				class="nav-btn primary"
				onclick={next}
				disabled={currentStep === steps.length - 1 || (current.id === 'folders' && folders.length === 0)}
			>
				{currentStep === steps.length - 1 ? 'Finish' : 'Continue'}
			</button>
		</div>
	</main>
</div>

<style>
	.wizard-layout {
		display: grid;
		grid-template-columns: 260px 1fr;
		min-height: calc(100vh - 64px);
		margin: -32px -40px;
	}

	/* ── Rail ─────────────────────────────────────────────────── */
	.wizard-rail {
		background: var(--paper-2);
		border-right: var(--hairline);
		display: flex;
		flex-direction: column;
		padding: 24px 0;
	}
	.rail-header {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 0 22px 20px;
		border-bottom: var(--hairline);
	}
	.rail-title {
		font-size: 20px;
		font-weight: 400;
		color: var(--sumi);
	}
	.rail-steps {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 16px 14px;
	}
	.step-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 10px;
		border-radius: var(--radius);
		text-align: left;
		transition: all 120ms ease;
	}
	.step-item:hover:not(:disabled) { background: var(--paper-3); }
	.step-item.current { background: var(--paper); }
	.step-item:disabled { cursor: default; }
	.step-indicator {
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		border-radius: var(--radius);
	}
	.step-check {
		color: var(--jade);
		font-size: 14px;
		font-weight: 600;
	}
	.step-kanji {
		font-size: 16px;
		color: var(--shu);
	}
	.step-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--paper-edge);
	}
	.step-text {
		display: flex;
		flex-direction: column;
	}
	.step-label {
		font-size: 13px;
		font-weight: 500;
		color: var(--sumi);
	}
	.step-item.pending .step-label { color: var(--sumi-4); }
	.step-desc {
		font-size: 10px;
		color: var(--sumi-3);
	}
	.step-item.pending .step-desc { color: var(--sumi-4); }

	.rail-progress {
		padding: 16px 22px 0;
		border-top: var(--hairline);
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.progress-track {
		height: 3px;
		background: var(--paper-edge);
		border-radius: 2px;
		overflow: hidden;
	}
	.progress-fill {
		height: 100%;
		background: var(--shu);
		border-radius: 2px;
		transition: width 300ms ease;
	}
	.progress-text {
		font-size: 10px;
		color: var(--sumi-4);
	}

	/* ── Main ─────────────────────────────────────────────────── */
	.wizard-main {
		padding: 36px 44px;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
	}
	.wiz-content {
		flex: 1;
		max-width: 640px;
	}
	.wiz-header {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-bottom: 24px;
	}
	.wiz-kanji {
		font-size: 32px;
		color: var(--shu);
	}
	.wiz-title {
		font-size: 26px;
		font-weight: 400;
		color: var(--sumi);
		margin: 0;
	}
	.wiz-tagline {
		font-size: 13px;
		color: var(--sumi-3);
		margin: 4px 0 0;
	}
	.wiz-body {
		font-family: var(--font-display);
		font-size: 18px;
		font-weight: 300;
		color: var(--sumi-2);
		line-height: 1.6;
		margin: 0 0 24px;
	}
	.wiz-footnote {
		font-size: 11px;
		color: var(--sumi-4);
		margin-top: 16px;
	}

	/* ── Pillars ──────────────────────────────────────────────── */
	.pillars {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16px;
		margin: 24px 0;
	}
	.pillar {
		padding: 18px;
		background: var(--paper-2);
		border: var(--hairline);
		border-radius: var(--radius);
		text-align: center;
	}
	.pillar-kanji { font-size: 28px; color: var(--shu); }
	.pillar-title { font-size: 14px; font-weight: 600; color: var(--sumi); margin: 8px 0 4px; }
	.pillar-desc { font-size: 12px; color: var(--sumi-2); line-height: 1.5; margin: 0; }

	/* ── Folders ──────────────────────────────────────────────── */
	.folders-list {
		display: flex;
		flex-direction: column;
		gap: 4px;
		margin-bottom: 12px;
	}
	.folder-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 12px;
		background: var(--paper-2);
		border: var(--hairline);
		border-radius: var(--radius);
	}
	.folder-path { font-size: 13px; color: var(--sumi); }
	.folder-remove {
		color: var(--sumi-4);
		font-size: 16px;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
	}
	.folder-remove:hover { background: var(--paper-3); color: var(--shu); }

	.folder-add {
		display: flex;
		gap: 8px;
	}
	.folder-input {
		flex: 1;
		padding: 10px 14px;
		font-size: 13px;
		background: var(--paper-2);
		border: var(--hairline);
		border-radius: var(--radius);
		outline: none;
	}
	.folder-input:focus { border-color: var(--sumi-3); }
	.folder-btn {
		padding: 10px 22px;
		background: var(--sumi);
		color: var(--paper);
		font-size: 13px;
		font-weight: 500;
		border-radius: var(--radius);
	}
	.folder-btn:hover { opacity: 0.9; }

	/* ── Projects ─────────────────────────────────────────────── */
	.projects-grid {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.project-card {
		padding: 16px 18px;
		background: var(--paper-2);
		border: var(--hairline);
		border-radius: var(--radius);
	}
	.project-card.confirmed { border-left: 2px solid var(--jade); }
	.project-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
	}
	.project-name { font-size: 14px; font-weight: 500; color: var(--sumi); margin: 0; }
	.project-role { font-size: 10px; color: var(--sumi-3); text-transform: uppercase; }
	.project-repos {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}
	.project-repo {
		font-size: 11px;
		padding: 3px 8px;
		background: var(--paper-3);
		border-radius: 4px;
		color: var(--sumi-2);
	}

	/* ── Nav Buttons ──────────────────────────────────────────── */
	.wiz-nav {
		display: flex;
		justify-content: space-between;
		padding-top: 24px;
		margin-top: auto;
		border-top: var(--hairline);
	}
	.nav-btn {
		padding: 10px 22px;
		font-size: 13px;
		font-weight: 500;
		border-radius: var(--radius);
		transition: all 120ms ease;
	}
	.nav-btn:disabled { opacity: 0.4; cursor: not-allowed; }
	.nav-btn.primary {
		background: var(--sumi);
		color: var(--paper);
	}
	.nav-btn.primary:hover:not(:disabled) { opacity: 0.9; }
	.nav-btn.outline {
		border: var(--ink-line);
		color: var(--sumi-2);
	}
	.nav-btn.outline:hover:not(:disabled) { background: var(--paper-3); }
</style>
