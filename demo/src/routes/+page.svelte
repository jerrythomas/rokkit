<script lang="ts">
	import RokkitWordmark from '$lib/components/RokkitWordmark.svelte'
	import { Button } from '@rokkit/ui'
	import { ThemeSwitcherToggle } from '@rokkit/app'
	import pkg from '@rokkit/ui/package.json'

	const version = pkg.version

	const navLinks = [
		{ label: 'Components', href: '/app', active: true },
		{ label: 'Chat demo', href: '/chat' },
		{ label: 'GitHub ↗', href: 'https://github.com/jerrythomas/rokkit' }
	]

	const fourPoints = [
		{
			icon: 'i-mdi:layers-outline',
			title: 'Data is the API',
			body: 'A List takes items. A Tree takes a nested shape. A Form reads its schema. No snippet trees, no recursive composition — pass the data, get a working control.'
		},
		{
			icon: 'i-mdi:palette',
			title: 'One config drives every look',
			body: 'Pick a style (zen-sumi, rokkit, minimal, material), a skin (paper / ink / accent palette), a typography pair, a density. Set it once on the body — every component picks it up.'
		},
		{
			icon: 'i-mdi:format-line-spacing',
			title: 'Density is a data attribute',
			body: 'Compact for a power-user table. Cozy for a settings page. Comfortable for an onboarding flow. Type stays put — only the rhythm changes.'
		},
		{
			icon: 'i-mdi:chat-outline',
			title: 'Embeddable in any AI surface',
			body: "Every component is a typed artifact — items in, value out, no global state. Drop one into Claude, into your own chat, into Rokkit's playground. Same code, themed to its host."
		}
	]

	const themedTabs = [
		{ id: 'zen-sumi', label: 'zen-sumi', desc: 'underline · sumi accent' },
		{ id: 'rokkit', label: 'rokkit', desc: 'filled block · brand red' },
		{ id: 'minimal', label: 'minimal', desc: 'hairline only · ink' },
		{ id: 'material', label: 'material', desc: 'pill bar · brand violet' }
	]


	const chatBullets = [
		'Human-in-the-loop forms — AI proposes, user confirms',
		'Themed to the host product, not to Rokkit',
		"Same code in the embed, in your app, in Rokkit's own docs",
		'Components serialize to and from JSON'
	]

	const planItems = [
		{ label: 'Ship rokkit v2.0', done: true },
		{ label: 'Launch the playground beta', done: true },
		{ label: 'Improve a11y coverage', done: false }
	]

	const packages: { pkg: string; icon: string; desc: string; isNew?: boolean }[] = [
		{ pkg: '@rokkit/core', icon: 'i-mdi:layers-outline', desc: 'primitives, tokens, types' },
		{ pkg: '@rokkit/data', icon: 'i-mdi:table', desc: 'item shapes, stores' },
		{ pkg: '@rokkit/actions', icon: 'i-mdi:magic-staff', desc: 'svelte actions: themable, keyboard, focus' },
		{ pkg: '@rokkit/states', icon: 'i-mdi:refresh', desc: 'finite states for interactive UI' },
		{ pkg: '@rokkit/icons', icon: 'i-mdi:widgets-outline', desc: 'icon set · customizable' },
		{ pkg: '@rokkit/themes', icon: 'i-mdi:palette', desc: 'styles · skins · typography pairs' },
		{ pkg: '@rokkit/forms', icon: 'i-mdi:form-textbox', desc: 'schema + layout forms' },
		{ pkg: '@rokkit/chart', icon: 'i-mdi:chart-bar', desc: 'data-driven SVG charts' },
		{
			pkg: '@rokkit/blocks',
			icon: 'i-mdi:code-tags',
			desc: 'markdown code-fence plugins · chart, table, form, list, stepper',
			isNew: true
		},
		{ pkg: '@rokkit/ui', icon: 'i-mdi:format-list-bulleted', desc: 'the components themselves' }
	]
</script>

<svelte:head>
	<title>Rokkit — data-driven Svelte components</title>
</svelte:head>

<div class="landing">
	<!-- ─── Nav ────────────────────────────────────────────────────── -->
	<header class="nav">
		<div class="nav-brand">
			<RokkitWordmark height={28} />
		</div>
		<nav class="nav-links">
			{#each navLinks as link (link.label)}
				<a href={link.href} class:active={link.active}>{link.label}</a>
			{/each}
		</nav>
		<div class="nav-spacer"></div>
		<div class="nav-actions">
			<span class="version-chip">v{version} · svelte 5</span>
			<ThemeSwitcherToggle variant="triad" />
			<Button
				href="/chat"
				variant="default"
				size="sm"
				icon="i-mdi:robot-happy-outline"
				title="Try the chat"
			/>
			<Button
				href="/app"
				variant="primary"
				size="sm"
				icon="i-mdi:layers-outline"
				title="Open the playground"
			/>
		</div>
	</header>

	<!-- ─── Hero ───────────────────────────────────────────────────── -->
	<section class="hero">
		<div class="hero-text">
			<div class="eyebrow">A data-driven Svelte 5 component library</div>
			<h1>
				Pass the data.<br />
				The <em>component</em> does the rest.
			</h1>
			<p class="lede">
				A list is an items array. A tree is a nested shape. A form is its schema.
				Rokkit components read their own data — selection, validation, theming,
				keyboard, a11y — so your code stays about what the user sees, not how to
				wire it.
			</p>
			<code class="install-cmd hero-install">
				<span class="prompt">$</span> bun add @rokkit/ui
			</code>
			<div class="hero-actions">
				<Button
					href="/app"
					variant="primary"
					size="lg"
					icon="i-mdi:layers-outline"
					label="Open the playground"
				/>
				<Button
					href="/chat"
					variant="default"
					size="lg"
					icon="i-mdi:robot-happy-outline"
					iconRight="i-mdi:arrow-right"
					label="Try the chat"
				/>
			</div>
		</div>

		<div class="hero-mark">
			<svg class="brushstroke" viewBox="0 0 360 360" width="380" height="380" aria-hidden="true">
				<path
					d="M 180 30 C 80 30, 30 110, 30 190 C 30 280, 120 330, 200 320 C 290 305, 330 220, 320 150 C 310 80, 240 40, 180 50"
					stroke="var(--ink)"
					stroke-width="60"
					fill="none"
					stroke-linecap="round"
				/>
			</svg>
			<div class="mark-stack">
				<RokkitWordmark height={88} />
				<div class="mark-caption">
					<span>data in</span>
					<span class="arrow i-mdi:arrow-right" aria-hidden="true"></span>
					<span>component out</span>
				</div>
			</div>
		</div>
	</section>

	<!-- ─── Four Points ────────────────────────────────────────────── -->
	<section class="four-points">
		<div class="eyebrow">What makes Rokkit different</div>
		<div class="points-grid">
			{#each fourPoints as point (point.title)}
				<div class="point">
					<div class="point-icon">
						<span class={point.icon} aria-hidden="true"></span>
					</div>
					<h3>{point.title}</h3>
					<p>{point.body}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- ─── Themed Tabs Row ────────────────────────────────────────── -->
	<section class="themed-tabs">
		<div class="section-header">
			<div class="eyebrow">One component · four styles</div>
			<h2>
				The same <code>&lt;Tabs/&gt;</code>, rendered four ways — by changing one
				attribute on the parent.
			</h2>
			<p class="section-lede">
				No variant prop. No conditional CSS in the component. The style — zen-sumi
				underline, rokkit block, minimal hairline, material pill — comes from
				<code>data-style</code> on the body. Components don't know which one is on;
				they just render.
			</p>
		</div>

		<div class="tabs-grid">
			{#each themedTabs as theme (theme.id)}
				<div class="tabs-card" data-style={theme.id}>
					<div class="tabs-card-head">
						<code class="tabs-card-attr">data-style="{theme.label}"</code>
						<span class="tabs-card-desc">{theme.desc}</span>
					</div>
					<div class="tabs-card-body">
						<iframe
							class="tabs-frame"
							title={`Tabs · ${theme.label}`}
							src={`/embed/tabs?theme=${theme.id}`}
							loading="lazy"
						></iframe>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- ─── Chat Embed ─────────────────────────────────────────────── -->
	<section class="chat-embed">
		<div class="chat-embed-text">
			<div class="eyebrow accent">For AI · for chat surfaces</div>
			<h2>Components that<br />belong in a conversation.</h2>
			<p>
				Stream a JSON spec from your model. Rokkit's <code>&lt;Form/&gt;</code>,
				<code>&lt;Table/&gt;</code>, <code>&lt;Chart/&gt;</code> render the response
				as a real, themed, interactive artifact. The user clicks. Your model gets
				the result back.
			</p>
			<ul class="chat-bullets">
				{#each chatBullets as bullet (bullet)}
					<li>
						<span class="arrow i-mdi:arrow-right" aria-hidden="true"></span>
						{bullet}
					</li>
				{/each}
			</ul>
			<div class="chat-embed-actions">
				<Button
					href="/chat"
					variant="primary"
					icon="i-mdi:robot-happy-outline"
					iconRight="i-mdi:arrow-right"
					label="Open the chat demo"
				/>
			</div>
		</div>

		<div class="chat-mock">
			<div class="chat-mock-head">
				<span class="status-dot"></span>
				<span class="chat-mock-label">/chat · Rokkit demo</span>
				<span class="chat-mock-meta">live components inline</span>
			</div>
			<div class="chat-mock-body">
				<!-- User turn — single label, defaults to "you"; CSS uppercases to "YOU" via text-transform -->
				<div class="chat-msg chat-msg-user">
					<div class="chat-msg-head">
						<span class="chat-msg-tag">you</span>
					</div>
					<div class="chat-msg-body">
						Lock the Q3 plan — give me the three priorities and a deadline.
					</div>
				</div>

				<!-- Assistant turn — configureWho({ assistant: 'Rokkit' }) replaces the default 'assistant' -->
				<div class="chat-msg chat-msg-assistant">
					<div class="chat-msg-head">
						<span class="chat-msg-tag accent">Rokkit</span>
					</div>
					<div class="chat-msg-body">
						<p class="chat-prose">
							Here's the Q3 plan as an editable form. Toggle the boxes and pick
							a deadline — submit when ready and I'll continue.
						</p>
						<figure class="chat-block">
							<div class="chat-block-card">
								<div class="artifact-title">Q3 plan · priorities</div>
								<div class="plan-items">
									{#each planItems as item (item.label)}
										<div class="plan-item">
											<span class="plan-checkbox" data-checked={item.done ? '' : undefined}>
												{#if item.done}
													<svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true">
														<path d="M2 5 L4 7 L8 3" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" />
													</svg>
												{/if}
											</span>
											{item.label}
										</div>
									{/each}
								</div>
								<div class="plan-deadline">
									<span class="deadline-label">Deadline</span>
									<span class="deadline-value">30 Sep 2026</span>
								</div>
								<div class="chat-block-footer">
									<span class="chat-block-caption">EDITABLE RECORD</span>
									<div class="chat-block-actions">
										<button type="button" class="chat-block-action">Save changes</button>
										<button type="button" class="chat-block-action subtle">Copy</button>
									</div>
								</div>
							</div>
						</figure>
					</div>
				</div>

				<!-- Status badge — single label; data-message-status="thinking" lets themes skin per-status -->
				<div class="chat-msg chat-msg-status" data-message-status="thinking">
					<div class="chat-msg-head">
						<span class="chat-msg-tag">thinking</span>
					</div>
					<div class="chat-msg-body subtle">
						picking the right tool…
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- ─── Packages ───────────────────────────────────────────────── -->
	<section class="packages">
		<div class="section-header inline">
			<div>
				<div class="eyebrow">The eight packages</div>
				<h2>Pull in only what you need.</h2>
			</div>
			<a class="see-all" href="https://npmjs.com/~jerrythomas">see all on npm ↗</a>
		</div>
		<div class="packages-grid">
			{#each packages as pkg (pkg.pkg)}
				<div class="package-card">
					<div class="package-head">
						<span class="package-icon">
							<span class={pkg.icon} aria-hidden="true"></span>
						</span>
						<span class="package-name">{pkg.pkg}</span>
					</div>
					<div class="package-desc">{pkg.desc}</div>
					{#if pkg.isNew}
						<span class="new-badge">NEW</span>
					{/if}
				</div>
			{/each}
		</div>
	</section>

	<!-- ─── CTA + Footer ───────────────────────────────────────────── -->
	<section class="cta">
		<div class="cta-text">
			<h2>The library is the chat is the docs.</h2>
			<p>
				Open the playground, ask for any component or how-to, get a real working
				artifact back. Browse the same components from the sidebar. Read the same
				docs they were mounted from.
			</p>
		</div>
		<div class="cta-actions">
			<Button
				href="/app"
				variant="primary"
				size="lg"
				icon="i-mdi:layers-outline"
				label="Open the playground"
			/>
			<Button
				href="/chat"
				variant="default"
				size="lg"
				icon="i-mdi:robot-happy-outline"
				label="Try the chat"
			/>
		</div>
	</section>

	<footer class="footer">
		<div class="footer-brand">
			<RokkitWordmark height={22} />
			<span class="footer-meta">v{version} · MIT · Svelte 5</span>
		</div>
		<div class="footer-links">
			<span class="footer-repo">jerrythomas / rokkit</span>
			<span class="footer-services">github · npm · vercel</span>
		</div>
	</footer>
</div>

<style>
	.landing {
		min-height: 100vh;
		background: var(--paper);
		color: var(--ink);
		font-family: var(--font-ui);
	}

	/* Shared utility classes for icons & arrow indicators */
	.icon-sm {
		display: inline-block;
		width: 14px;
		height: 14px;
		flex-shrink: 0;
	}

	.arrow {
		display: inline-block;
		width: 12px;
		height: 12px;
		color: var(--accent);
		flex-shrink: 0;
	}

	.eyebrow {
		font: 500 11px var(--font-mono);
		color: var(--ink-soft);
		letter-spacing: 0.2em;
		text-transform: uppercase;
	}

	.eyebrow.accent {
		color: var(--accent);
	}

	/* ─── Nav ────────────────────────────────────────────────────── */

	.nav {
		display: flex;
		align-items: center;
		gap: 24px;
		padding: 18px 48px;
		border-bottom: 1px solid var(--paper-edge);
		background: var(--paper);
		position: sticky;
		top: 0;
		z-index: 5;
	}

	.nav-brand {
		display: inline-flex;
		align-items: center;
	}

	.nav-links {
		display: flex;
		gap: 24px;
		margin-left: 48px;
	}

	.nav-links a {
		font: 500 13px var(--font-ui);
		color: var(--ink-mute);
		text-decoration: none;
		white-space: nowrap;
	}

	.nav-links a:hover {
		color: var(--ink);
	}

	.nav-links a.active {
		color: var(--ink);
	}

	.nav-spacer {
		flex: 1;
	}

	.nav-actions {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.version-chip {
		font: 500 11.5px var(--font-mono);
		color: var(--ink-soft);
		padding: 3px 8px;
		border: 1px solid var(--paper-edge);
		border-radius: 4px;
		white-space: nowrap;
	}

	/* ─── Hero ───────────────────────────────────────────────────── */

	.hero {
		padding: 80px 48px 64px;
		display: grid;
		grid-template-columns: 1fr 460px;
		gap: 96px;
		align-items: center;
	}

	.hero-text .eyebrow {
		margin-bottom: 18px;
	}

	.hero h1 {
		font: 300 64px/1.04 var(--font-display);
		letter-spacing: -0.025em;
		color: var(--ink);
		margin: 0;
	}

	.hero h1 em {
		color: var(--accent);
		font-style: normal;
		font-weight: 400;
	}

	.lede {
		margin: 28px 0 0;
		font: 400 17px/1.6 var(--font-ui);
		color: var(--ink-mute);
		max-width: 560px;
	}

	.hero-actions {
		display: flex;
		gap: 12px;
		margin-top: 36px;
		align-items: center;
		flex-wrap: wrap;
	}

	.install-cmd {
		display: inline-block;
		font: 500 12.5px var(--font-mono);
		color: var(--ink-mute);
		padding: 10px 14px;
		background: var(--paper-soft);
		border: 1px solid var(--paper-edge);
		border-radius: 6px;
	}

	.hero-install {
		margin-top: 28px;
	}

	.install-cmd .prompt {
		color: var(--ink-faint);
	}

	.hero-mark {
		display: flex;
		justify-content: center;
		position: relative;
	}

	.hero-mark > * {
		position: absolute;
	}

	.hero-mark {
		width: 420px;
		height: 380px;
	}

	.brushstroke {
		top: 0;
		left: 50%;
		transform: translateX(-50%);
		opacity: 0.06;
	}

	.mark-stack {
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
	}

	.mark-caption {
		display: flex;
		gap: 12px;
		align-items: center;
		font: 500 11px var(--font-mono);
		color: var(--ink-soft);
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	/* ─── Four Points ────────────────────────────────────────────── */

	.four-points {
		padding: 72px 48px;
		border-top: 1px solid var(--paper-edge);
		background: var(--paper-soft);
	}

	.four-points .eyebrow {
		margin-bottom: 32px;
	}

	.points-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 48px;
	}

	.point-icon {
		width: 36px;
		height: 36px;
		display: grid;
		place-items: center;
		border-radius: 8px;
		color: var(--accent);
		background: var(--accent-soft);
		border: 1px solid color-mix(in oklab, var(--accent) 22%, transparent);
		margin-bottom: 14px;
	}

	.point-icon > span {
		display: inline-block;
		width: 18px;
		height: 18px;
	}

	.point h3 {
		font: 500 18px/1.3 var(--font-display);
		color: var(--ink);
		letter-spacing: -0.01em;
		margin: 0 0 10px;
	}

	.point p {
		font: 400 14px/1.6 var(--font-ui);
		color: var(--ink-mute);
		margin: 0;
	}

	/* ─── Section Header (shared) ────────────────────────────────── */

	.section-header {
		margin-bottom: 28px;
	}

	.section-header.inline {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 20px;
	}

	.section-header .eyebrow {
		margin-bottom: 10px;
	}

	.section-header h2 {
		font: 300 36px/1.2 var(--font-display);
		letter-spacing: -0.025em;
		color: var(--ink);
		margin: 0;
		max-width: 720px;
	}

	.section-header h2 code {
		font-family: var(--font-mono);
		color: var(--accent);
		font-size: 0.85em;
	}

	.section-lede {
		font: 400 14px/1.55 var(--font-ui);
		color: var(--ink-mute);
		margin: 14px 0 0;
		max-width: 640px;
	}

	.section-lede code {
		font-family: var(--font-mono);
		padding: 1px 5px;
		border-radius: 3px;
		background: var(--paper-soft);
		border: 1px solid var(--paper-edge);
		font-size: 12px;
	}

	/* ─── Themed Tabs Row ────────────────────────────────────────── */

	.themed-tabs {
		padding: 80px 48px;
		border-top: 1px solid var(--paper-edge);
	}

	.tabs-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 14px;
	}

	.tabs-card {
		background: var(--paper);
		border: 1px solid var(--paper-edge);
		border-radius: 10px;
		overflow: hidden;
	}

	.tabs-card-head {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 14px;
		border-bottom: 1px solid var(--paper-edge);
		background: var(--paper-soft);
	}

	.tabs-card-attr {
		font: 500 11.5px var(--font-mono);
		color: var(--ink-mute);
	}

	.tabs-card-desc {
		font: 500 11px var(--font-mono);
		color: var(--ink-soft);
		margin-left: auto;
		letter-spacing: 0.04em;
	}

	.tabs-card-body {
		padding: 4px 4px 6px;
	}

	/* Each card is an iframe so the theme cascade is isolated per card.
	   Without this, the body's data-style would win the cascade for all
	   four tabs (theme CSS uses identical-specificity selectors and
	   zen-sumi.css is imported last in app.css). */
	.tabs-frame {
		display: block;
		width: 100%;
		height: 200px;
		border: 0;
		background: transparent;
	}

	/* ─── Chat Embed ─────────────────────────────────────────────── */

	.chat-embed {
		padding: 88px 48px;
		border-top: 1px solid var(--paper-edge);
		background: var(--paper-soft);
		display: grid;
		grid-template-columns: 440px 1fr;
		gap: 64px;
		align-items: flex-start;
	}

	.chat-embed-text .eyebrow {
		margin-bottom: 14px;
	}

	.chat-embed h2 {
		font: 300 36px/1.2 var(--font-display);
		letter-spacing: -0.025em;
		color: var(--ink);
		margin: 0 0 18px;
	}

	.chat-embed p {
		font: 400 15px/1.65 var(--font-ui);
		color: var(--ink-mute);
		margin: 0;
	}

	.chat-embed code {
		font-family: var(--font-mono);
		padding: 1px 5px;
		border-radius: 3px;
		background: var(--paper);
		border: 1px solid var(--paper-edge);
		font-size: 12px;
	}

	.chat-bullets {
		margin: 24px 0 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.chat-bullets li {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		font: 400 14px/1.5 var(--font-ui);
		color: var(--ink-mute);
	}

	.chat-bullets li .arrow {
		margin-top: 4px;
	}

	.chat-mock {
		border: 1px solid var(--paper-edge);
		border-radius: 12px;
		overflow: hidden;
		background: var(--paper);
		box-shadow: 0 1px 3px var(--shadow-tint);
	}

	.chat-mock-head {
		padding: 10px 14px;
		border-bottom: 1px solid var(--paper-edge);
		display: flex;
		align-items: center;
		gap: 10px;
		background: var(--paper-soft);
	}

	.status-dot {
		width: 8px;
		height: 8px;
		border-radius: 4px;
		background: var(--success);
	}

	.chat-mock-label {
		font: 500 11px var(--font-mono);
		color: var(--ink-soft);
		letter-spacing: 0.06em;
		flex: 1;
	}

	.chat-mock-meta {
		font: 500 10.5px var(--font-mono);
		color: var(--ink-faint);
		letter-spacing: 0.06em;
	}

	.chat-mock-body {
		padding: 22px;
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	/* Chat-message layout mirrors /chat: tag chip + who, then body indented */
	.chat-msg {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.chat-msg-head {
		display: flex;
		align-items: center;
		gap: 8px;
		font: 500 10.5px var(--font-mono);
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.chat-msg-tag {
		padding: 2px 6px;
		background: var(--paper-soft);
		border: 1px solid var(--paper-edge);
		border-radius: 4px;
		color: var(--ink-mute);
	}

	.chat-msg-tag.accent {
		background: color-mix(in oklab, var(--accent) 12%, var(--paper-soft));
		border-color: color-mix(in oklab, var(--accent) 30%, var(--paper-edge));
		color: var(--accent);
	}

	/* Theme hook: skin badges by semantic status. */
	[data-message-status='thinking'] .chat-msg-tag {
		background: color-mix(in oklab, var(--secondary, var(--ink-mute)) 10%, var(--paper-soft));
		border-color: color-mix(in oklab, var(--secondary, var(--ink-mute)) 24%, var(--paper-edge));
		color: var(--secondary, var(--ink-mute));
		font-style: italic;
	}

	.chat-msg-body {
		font: 400 14px/1.55 var(--font-ui);
		color: var(--ink);
	}

	.chat-msg-body.subtle {
		color: var(--ink-mute);
		font-style: italic;
		font-size: 13px;
	}

	.chat-prose {
		margin: 0 0 12px;
	}

	.chat-block {
		margin: 0;
	}

	.chat-block-card {
		border: 1px solid var(--paper-edge);
		border-radius: 8px;
		padding: 14px;
		background: var(--paper-soft);
	}

	.chat-block-footer {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 12px;
		padding-top: 10px;
		border-top: 1px dashed var(--paper-edge);
	}

	.chat-block-caption {
		flex: 1;
		font: 500 10.5px var(--font-mono);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-mute);
	}

	.chat-block-actions {
		display: flex;
		gap: 6px;
	}

	.chat-block-action {
		font: 500 11.5px var(--font-ui);
		padding: 5px 10px;
		border: 1px solid var(--paper-edge);
		border-radius: 6px;
		background: var(--paper);
		color: var(--ink-mute);
		cursor: pointer;
	}

	.chat-block-action.subtle {
		background: transparent;
		border-color: transparent;
	}

	.chat-block-action:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	.artifact-title {
		font: 500 13.5px var(--font-display);
		color: var(--ink);
		margin-bottom: 10px;
		letter-spacing: -0.005em;
	}

	.chat-embed-actions {
		margin-top: 18px;
	}

	.plan-items {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.plan-item {
		display: flex;
		align-items: center;
		gap: 9px;
		padding: 8px 10px;
		background: var(--paper-soft);
		border: 1px solid var(--paper-edge);
		border-radius: 5px;
		font: 400 12.5px var(--font-ui);
		color: var(--ink);
	}

	.plan-checkbox {
		width: 14px;
		height: 14px;
		border: 1px solid var(--paper-edge);
		border-radius: 3px;
		flex-shrink: 0;
		position: relative;
		display: grid;
		place-items: center;
	}

	.plan-checkbox[data-checked] {
		background: var(--ink);
		color: var(--paper);
	}

	.plan-deadline {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-top: 12px;
		padding-top: 12px;
		border-top: 1px dashed var(--paper-edge);
	}

	.deadline-label {
		font: 500 11.5px var(--font-ui);
		color: var(--ink-mute);
		flex: 1;
	}

	.deadline-value {
		font: 500 12px var(--font-mono);
		padding: 4px 10px;
		background: var(--paper-soft);
		border: 1px solid var(--paper-edge);
		border-radius: 4px;
	}

	/* ─── Packages ───────────────────────────────────────────────── */

	.packages {
		padding: 72px 48px;
		border-top: 1px solid var(--paper-edge);
	}

	.packages .section-header h2 {
		font-size: 32px;
	}

	.see-all {
		font: 500 13px var(--font-ui);
		color: var(--ink-mute);
		text-decoration: none;
	}

	.see-all:hover {
		color: var(--ink);
	}

	.packages-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 14px;
	}

	.package-card {
		padding: 16px 16px 14px;
		border: 1px solid var(--paper-edge);
		border-radius: 8px;
		background: var(--paper);
		position: relative;
	}

	.package-head {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 8px;
	}

	.package-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 14px;
		height: 14px;
		color: var(--accent);
		flex-shrink: 0;
	}

	.package-icon > span {
		display: block;
		width: 14px;
		height: 14px;
	}

	.package-name {
		font: 500 13px var(--font-mono);
		color: var(--ink);
	}

	.package-desc {
		font: 400 12.5px/1.45 var(--font-ui);
		color: var(--ink-soft);
	}

	.new-badge {
		position: absolute;
		top: 12px;
		right: 12px;
		font: 500 9px var(--font-mono);
		padding: 2px 6px;
		background: var(--accent);
		color: white;
		border-radius: 3px;
		letter-spacing: 0.1em;
	}

	/* ─── CTA + Footer ───────────────────────────────────────────── */

	.cta {
		padding: 80px 48px;
		border-top: 1px solid var(--paper-edge);
		background: var(--paper-soft);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 32px;
		flex-wrap: wrap;
	}

	.cta h2 {
		font: 300 40px/1.2 var(--font-display);
		letter-spacing: -0.025em;
		color: var(--ink);
		margin: 0 0 12px;
	}

	.cta p {
		font: 400 15px/1.6 var(--font-ui);
		color: var(--ink-mute);
		margin: 0;
		max-width: 600px;
	}

	.cta-actions {
		display: flex;
		gap: 10px;
	}

	.footer {
		padding: 32px 48px 40px;
		border-top: 1px solid var(--paper-edge);
		display: flex;
		align-items: flex-end;
		gap: 48px;
	}

	.footer-brand {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.footer-meta {
		font: 500 11px var(--font-mono);
		color: var(--ink-soft);
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.footer-links {
		display: flex;
		flex-direction: column;
		gap: 4px;
		align-items: flex-end;
	}

	.footer-repo {
		font: 500 11.5px var(--font-mono);
		color: var(--ink-mute);
	}

	.footer-services {
		font: 500 11px var(--font-mono);
		color: var(--ink-faint);
	}
</style>
