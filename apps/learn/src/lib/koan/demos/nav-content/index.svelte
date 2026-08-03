<script lang="ts">
	import { NavContent } from '@rokkit/ui'

	let { ...spread }: Record<string, unknown> = $props()

	const pages = ['Overview', 'Billing', 'Members', 'Security', 'Integrations']
	let active = $state('Overview')

	const steps = ['Details', 'Payment', 'Review']
	let step = $state('Details')
</script>

<div class="grid">
	<section>
		<header>Horizontal — nav rail beside content, navSize=200px</header>
		<div class="frame">
			<NavContent navSize="200px" {...spread}>
				{#snippet nav()}
					<nav class="rail">
						{#each pages as page (page)}
							<button
								type="button"
								class="rail-link"
								data-active={page === active || undefined}
								onclick={() => (active = page)}
							>
								{page}
							</button>
						{/each}
					</nav>
				{/snippet}

				{#snippet content()}
					<article class="pane">
						<h3>{active}</h3>
						<p>
							The nav panel holds a fixed 200px width; this content pane takes the rest and stays
							flexible.
						</p>
					</article>
				{/snippet}
			</NavContent>
		</div>
	</section>

	<section>
		<header>Vertical — nav on top, navSize=48px</header>
		<div class="frame">
			<NavContent orientation="vertical" navSize="48px" {...spread}>
				{#snippet nav()}
					<div class="toprail">
						{#each steps as s (s)}
							<button
								type="button"
								class="rail-link"
								data-active={s === step || undefined}
								onclick={() => (step = s)}
							>
								{s}
							</button>
						{/each}
					</div>
				{/snippet}

				{#snippet content()}
					<section class="pane">
						<h3>{step}</h3>
						<p>
							In vertical orientation, navSize sets the height of the top rail instead of the side
							width.
						</p>
					</section>
				{/snippet}
			</NavContent>
		</div>
	</section>

	<section>
		<header>Non-collapsible rail — collapsible=false</header>
		<div class="frame">
			<NavContent navSize="160px" collapsible={false} {...spread}>
				{#snippet nav()}
					<nav class="rail">
						<span class="rail-static">Always visible</span>
						<span class="rail-static">No small-screen collapse</span>
					</nav>
				{/snippet}

				{#snippet content()}
					<article class="pane">
						<p>
							With <code>collapsible=false</code> the rail never folds away, however narrow the container
							gets.
						</p>
					</article>
				{/snippet}
			</NavContent>
		</div>
	</section>
</div>

<style>
	.grid {
		display: flex;
		flex-direction: column;
		gap: 18px;
	}
	section {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	header {
		font: 500 11px var(--font-mono);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--ink-soft);
	}
	.frame {
		border: 1px solid var(--paper-edge);
		border-radius: 8px;
		overflow: hidden;
	}
	.rail {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 10px;
		height: 100%;
		background: var(--paper);
		border-right: 1px solid var(--paper-edge);
	}
	.toprail {
		display: flex;
		gap: 4px;
		padding: 8px 10px;
		background: var(--paper);
		border-bottom: 1px solid var(--paper-edge);
	}
	.rail-link {
		padding: 6px 10px;
		border: none;
		border-radius: 5px;
		background: transparent;
		color: var(--ink-mute);
		font: 500 13px var(--font-ui);
		text-align: left;
		cursor: pointer;
	}
	.rail-link[data-active] {
		background: var(--paper-edge);
		color: var(--ink);
	}
	.rail-static {
		font: 400 12px var(--font-ui);
		color: var(--ink-mute);
	}
	.pane {
		padding: 16px 18px;
	}
	h3 {
		margin: 0 0 6px;
		font: 600 15px var(--font-display);
		color: var(--ink);
	}
	p {
		margin: 0;
		font: 400 13px/1.5 var(--font-ui);
		color: var(--ink-mute);
	}
	code {
		font: 400 12px var(--font-mono);
		color: var(--ink);
	}
</style>
