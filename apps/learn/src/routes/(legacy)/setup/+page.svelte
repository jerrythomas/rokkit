<script>
	import { untrack } from 'svelte'
	import { goto } from '$app/navigation'
	import { Button, List } from '@rokkit/ui'
	import { m } from '$lib/paraglide/messages.js'
	import ListItem from '$lib/components/ListItem.svelte'

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

	// Kanji is always shown — it's the step identity, not a counter.
	// Status drives icon color and tick visibility in ListItem.
	const wizardItems = $derived(
		data.steps.map((s, i) => ({
			id: s.id,
			label: s.label,
			description: s.description,
			icon: s.kanji,
			disabled: i > currentStep,
			status: i < currentStep ? 'done' : i === currentStep ? 'current' : 'pending'
		}))
	)

	let folders = $state(untrack(() => [...data.folders]))
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
<div class="w-full h-screen flex flex-col bg-surface-z0">

	<div class="flex-1 grid min-h-0" style="grid-template-columns: 260px 1fr">

		<!-- ─── Left Rail ──────────────────────────────────────────────── -->
		<aside class="wiz-rail bg-surface-z2 border-r border-surface-z3 flex flex-col overflow-hidden px-[22px] py-[26px] gap-7">
			<div class="flex items-center gap-[10px]">
				<span class="kanji text-[22px] text-primary-z5">道</span>
				<span class="font-display text-[20px] font-normal text-ink-z1">{m.setup_title()}</span>
			</div>

			<div class="rail-stages flex-1 flex flex-col gap-3.5">
				<div class="text-[10px] tracking-[0.14em] uppercase text-ink-z5 px-[10px]">Setup</div>
				<List
					items={wizardItems}
					fields={{ value: 'id', label: 'label', icon: 'icon', subtext: 'description', disabled: 'disabled' }}
					value={data.steps[currentStep]?.id}
					label="Setup steps"
					size="sm"
					class="gap-px wiz-steps"
					onselect={(v) => {
						const i = data.steps.findIndex((s) => s.id === v)
						if (i !== -1 && i < currentStep) currentStep = i
					}}
				>
					{#snippet itemContent(proxy)}
						<ListItem {proxy} />
					{/snippet}
				</List>
			</div>
		</aside>

		<!-- ─── Main Content ───────────────────────────────────────────── -->
		<div class="wiz-content flex flex-col min-h-0">
			<div class="flex-1 overflow-auto px-[64px] pt-[44px] pb-8">

				{#if current.id === 'welcome' || (current.id !== 'folders' && current.id !== 'projects')}
					<div class="flex items-center gap-4 mb-7">
						<span class="kanji text-[36px] text-primary-z5">{current.kanji}</span>
						<div>
							<h1 class="font-display text-[28px] font-light text-ink-z1 m-0">{current.label}</h1>
							<p class="text-[13px] text-ink-z5 mt-1 mb-0">{current.description}</p>
						</div>
					</div>
					{#if current.id === 'welcome'}
						<p class="font-display text-[18px] font-light text-ink-z3 leading-relaxed m-0 mb-6">{m.setup_welcome_body()}</p>
						<div class="grid grid-cols-3 gap-4 my-6">
							{#each [['観', m.setup_pillar_observe(), m.setup_pillar_observe_desc()], ['教', m.setup_pillar_teach(), m.setup_pillar_teach_desc()], ['守', m.setup_pillar_local(), m.setup_pillar_local_desc()]] as [k, t, d] (k)}
								<div class="px-[18px] py-[18px] bg-surface-z1 border border-surface-z2 rounded-md text-center">
									<span class="kanji text-[28px] text-primary-z5">{k}</span>
									<h3 class="text-[14px] font-semibold text-ink-z1 mt-2 mb-1">{t}</h3>
									<p class="text-[12px] text-ink-z3 leading-[1.5] m-0">{d}</p>
								</div>
							{/each}
						</div>
						<p class="text-[11px] text-surface-z4 mt-4">{m.setup_welcome_time()}</p>
					{:else}
						<p class="text-[14px] text-ink-z3 leading-relaxed">{m.this_step_placeholder()}</p>
					{/if}

				{:else if current.id === 'folders'}
					<div class="flex items-center gap-4 mb-7">
						<span class="kanji text-[36px] text-primary-z5">{current.kanji}</span>
						<div>
							<h1 class="font-display text-[28px] font-light text-ink-z1 m-0">{m.setup_folders_title()}</h1>
							<p class="text-[13px] text-ink-z5 mt-1 mb-0">{m.setup_folders_desc()}</p>
						</div>
					</div>
					<div class="flex flex-col gap-1 mb-3">
						{#each folders as folder (folder)}
							<div class="flex items-center justify-between px-3 py-2 bg-surface-z1 border border-surface-z2 rounded-md">
								<span class="mono text-[13px] text-ink-z1">{folder}</span>
								<button
									class="text-surface-z4 text-[16px] w-6 h-6 flex items-center justify-center rounded hover:bg-surface-z2 hover:text-primary-z5 transition-colors"
									onclick={() => removeFolder(folder)}
								>×</button>
							</div>
						{/each}
					</div>
					<form class="flex gap-2" onsubmit={(e) => { e.preventDefault(); addFolder() }}>
						<input
							class="flex-1 px-[14px] py-[10px] text-[13px] bg-surface-z1 border border-surface-z3 rounded-md outline-none focus:border-surface-z7 text-ink-z1 transition-colors font-sans"
							type="text"
							placeholder="~/code/project"
							bind:value={newFolder}
						/>
						<Button label={m.setup_folders_add()} type="submit" />
					</form>
					<p class="text-[11px] text-surface-z4 mt-4">{m.setup_folders_min()}</p>

				{:else if current.id === 'projects'}
					<div class="flex items-center gap-4 mb-7">
						<span class="kanji text-[36px] text-primary-z5">{current.kanji}</span>
						<div>
							<h1 class="font-display text-[28px] font-light text-ink-z1 m-0">{m.setup_projects_title()}</h1>
							<p class="text-[13px] text-ink-z5 mt-1 mb-0">{m.setup_projects_desc()}</p>
						</div>
					</div>
					<div class="flex flex-col gap-[10px]">
						{#each data.projects as project (project.id)}
							<div
								class="px-[18px] py-4 bg-surface-z1 border border-surface-z2 rounded-md"
								style="border-left: {project.confirmed ? `2px solid color-mix(in oklch, var(--color-success-z5) 14%, transparent)` : 'none'}"
							>
								<div class="flex justify-between items-center mb-2">
									<h3 class="text-[14px] font-medium text-ink-z1 m-0">{project.name}</h3>
									<span class="mono text-[10px] text-ink-z5 uppercase">{project.role}</span>
								</div>
								<div class="flex gap-[6px] flex-wrap">
									{#each project.repos as repo (repo)}
										<span class="mono text-[11px] px-2 py-[3px] bg-surface-z2 rounded text-ink-z3">{repo}</span>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- ─── Bottom Progress Bar ────────────────────────────────── -->
			<div class="wiz-bottom border-t border-surface-z2 px-[64px] py-[14px] flex items-center gap-5 bg-surface-z0">
				<Button
					style="outline"
					label={m.setup_back()}
					onclick={back}
					disabled={currentStep === 0}
				/>

				<div class="flex-1 flex gap-1 items-center">
					{#each steps as _, i (i)}
						<span
							class="flex-1 h-[2px] rounded-[1px] transition-colors duration-200 {i <= currentStep ? 'bg-surface-z9' : 'bg-surface-z2'}"
						></span>
					{/each}
				</div>

				<Button
					label={isLastStep ? m.setup_enter() : m.setup_continue()}
					onclick={next}
					disabled={!isLastStep && current.id === 'folders' && folders.length === 0}
				/>
			</div>
		</div>
	</div>
</div>
