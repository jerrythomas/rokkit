<script>
	// @ts-nocheck
	/**
	 * CodeGroup — multi-file code display with a hierarchical tree picker
	 * and an optional live preview panel.
	 *
	 * Tree-based (not tabs) because real projects have nested folders that
	 * flatten poorly. On viewports wider than 768px the tree sits as a
	 * left rail; below that the tree collapses to a top "current file" pill
	 * that opens an overlay drawer, keeping code at full viewport width.
	 *
	 * Preview is rendered from an optional Svelte snippet, collapsed by
	 * default per the priority spec — users opt in via the "Show preview"
	 * toggle.
	 */
	import { highlightCode } from '$lib/shiki.js'
	import { vibe } from '@rokkit/states'
	import { Tree } from '@rokkit/ui'

	/**
	 * @typedef {Object} CodeGroupFile
	 * @property {string} path - Full path used as id and for tree placement (e.g. 'src/lib/Button.svelte')
	 * @property {string} language - Shiki language id
	 * @property {string} code - Source code
	 * @property {string} [name] - Display name override; defaults to the path's last segment
	 * @property {string} [icon] - File icon class; defaults to extension lookup
	 */

	let {
		files = [],
		initialFile,
		class: className = '',
		preview,
		showCopyButton = true
	} = $props()

	let selectedPath = $state(initialFile ?? files[0]?.path ?? '')
	let drawerOpen = $state(false)
	let previewExpanded = $state(false)
	let copied = $state(false)

	const KNOWN_EXTENSIONS = ['svelte', 'js', 'mjs', 'ts', 'tsx', 'css', 'html', 'json', 'md']

	function getFileIcon(name) {
		const ext = name.split('.').pop()?.toLowerCase()
		return KNOWN_EXTENSIONS.includes(ext) ? `i-file:${ext}` : 'i-mdi:file-outline'
	}

	const activeFile = $derived(files.find((f) => f.path === selectedPath))
	const activeFileName = $derived(
		activeFile ? (activeFile.name ?? activeFile.path.split('/').pop()) : ''
	)

	// Build a hierarchical tree from the flat path list. Intermediate
	// segments become folder nodes; the final segment becomes a file leaf
	// carrying the original path as its id.
	const tree = $derived.by(() => {
		const root = []
		const lookup = new Map()
		for (const f of files) {
			const parts = f.path.split('/').filter(Boolean)
			let parentChildren = root
			let acc = ''
			for (let i = 0; i < parts.length; i++) {
				const part = parts[i]
				const isLeaf = i === parts.length - 1
				acc = acc ? `${acc}/${part}` : part
				let node = lookup.get(acc)
				if (!node) {
					node = {
						id: acc,
						name: part,
						icon: isLeaf ? (f.icon ?? getFileIcon(part)) : 'i-mdi:folder-outline',
						isFile: isLeaf,
						children: isLeaf ? undefined : []
					}
					lookup.set(acc, node)
					parentChildren.push(node)
				}
				if (!isLeaf) parentChildren = node.children
			}
		}
		return root
	})

	function handleTreeSelect(value) {
		// Tree fires onselect for folders too; only switch the panel when
		// the selection is a real file. Mobile: collapse the drawer after pick.
		const file = files.find((f) => f.path === value)
		if (!file) return
		selectedPath = value
		drawerOpen = false
	}

	const highlightedCode = $derived(
		activeFile
			? highlightCode(activeFile.code, {
					lang: activeFile.language,
					theme: vibe.mode === 'dark' ? 'github-dark' : 'github-light'
				})
			: Promise.resolve('')
	)

	async function copyCurrent() {
		if (!activeFile) return
		try {
			await navigator.clipboard.writeText(activeFile.code)
			copied = true
			setTimeout(() => (copied = false), 1800)
		} catch (e) {
			// eslint-disable-next-line no-console
			console.error('CodeGroup: clipboard write failed', e)
		}
	}
</script>

<div class="code-group {className}" data-preview-open={previewExpanded ? '' : undefined}>
	{#if files.length === 0}
		<div class="empty">No files to display.</div>
	{:else}
		<!-- Mobile-only top picker. Hidden on desktop via CSS. -->
		<button
			type="button"
			class="picker"
			onclick={() => (drawerOpen = !drawerOpen)}
			aria-haspopup="dialog"
			aria-expanded={drawerOpen}
			aria-controls="codegroup-drawer"
		>
			<span class="picker-icon {activeFile ? getFileIcon(activeFileName) : 'i-mdi:file-outline'}" aria-hidden="true"></span>
			<span class="picker-name">{activeFileName || 'Choose file'}</span>
			<span class="picker-chevron i-mdi:chevron-down" aria-hidden="true"></span>
		</button>

		<!-- Tree rail (desktop). On mobile, becomes a drawer toggled by the
		     picker; the same DOM serves both roles via CSS. -->
		<aside
			id="codegroup-drawer"
			class="rail"
			data-open={drawerOpen ? '' : undefined}
			aria-label="Files"
		>
			<div class="rail-header">Files</div>
			<Tree
				items={tree}
				fields={{ value: 'id', label: 'name', icon: 'icon' }}
				value={selectedPath}
				size="sm"
				onselect={handleTreeSelect}
			/>
		</aside>

		<!-- Backdrop covers the code area when the drawer is open on mobile.
		     Click anywhere outside to close. -->
		{#if drawerOpen}
			<button
				type="button"
				class="backdrop"
				aria-label="Close file picker"
				onclick={() => (drawerOpen = false)}
			></button>
		{/if}

		<section class="code-pane" aria-label="Code">
			<header class="code-head">
				<div class="code-head-left">
					<span class="code-icon {activeFile ? getFileIcon(activeFileName) : ''}" aria-hidden="true"></span>
					<span class="code-name">{activeFileName}</span>
				</div>
				<div class="code-head-right">
					{#if activeFile}
						<span class="code-meta">{activeFile.code.split('\n').length} lines</span>
					{/if}
					{#if showCopyButton && activeFile}
						<button type="button" class="code-action" onclick={copyCurrent} title="Copy code">
							{#if copied}
								<span class="i-mdi:check" aria-hidden="true"></span>
								<span class="action-label">Copied</span>
							{:else}
								<span class="i-mdi:content-copy" aria-hidden="true"></span>
								<span class="action-label">Copy</span>
							{/if}
						</button>
					{/if}
					{#if preview}
						<button
							type="button"
							class="code-action"
							onclick={() => (previewExpanded = !previewExpanded)}
							aria-expanded={previewExpanded}
							title={previewExpanded ? 'Hide preview' : 'Show preview'}
						>
							<span class={previewExpanded ? 'i-mdi:eye-off-outline' : 'i-mdi:eye-outline'} aria-hidden="true"></span>
							<span class="action-label">{previewExpanded ? 'Hide preview' : 'Show preview'}</span>
						</button>
					{/if}
				</div>
			</header>

			<div class="code-scroll">
				{#await highlightedCode}
					<div class="code-pending">Highlighting code…</div>
				{:then html}
					{@html html}
				{:catch error}
					<div class="code-error">Error highlighting code: {error.message}</div>
				{/await}
			</div>
		</section>

		{#if preview && previewExpanded}
			<section class="preview-pane" aria-label="Live preview">
				<header class="preview-head">Preview</header>
				<div class="preview-body">
					{@render preview()}
				</div>
			</section>
		{/if}
	{/if}
</div>

<style>
	.code-group {
		display: grid;
		grid-template-columns: 240px 1fr;
		grid-template-rows: auto 1fr;
		grid-template-areas:
			'rail code'
			'rail preview';
		gap: 0;
		min-height: 280px;
		border: 1px solid var(--paper-edge);
		border-radius: 8px;
		background: var(--paper);
		overflow: hidden;
		position: relative;
	}

	.code-group[data-preview-open] {
		grid-template-rows: 1fr 1fr;
	}

	.empty {
		grid-column: 1 / -1;
		padding: 32px;
		text-align: center;
		color: var(--ink-soft);
		font: 400 13px var(--font-ui);
	}

	/* ─── Mobile top picker (hidden on desktop) ────────────────────────── */
	.picker {
		display: none;
		align-items: center;
		gap: 8px;
		width: 100%;
		padding: 10px 14px;
		border: 0;
		border-bottom: 1px solid var(--paper-edge);
		background: var(--paper-soft);
		color: var(--ink);
		font: 500 13px var(--font-ui);
		cursor: pointer;
		text-align: left;
	}

	.picker-icon {
		width: 16px;
		height: 16px;
		flex-shrink: 0;
		color: var(--ink-mute);
	}

	.picker-name {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.picker-chevron {
		width: 16px;
		height: 16px;
		color: var(--ink-soft);
		flex-shrink: 0;
		transition: transform 160ms ease;
	}

	.picker[aria-expanded='true'] .picker-chevron {
		transform: rotate(180deg);
	}

	/* ─── Tree rail ────────────────────────────────────────────────────── */
	.rail {
		grid-area: rail;
		border-right: 1px solid var(--paper-edge);
		background: var(--paper-soft);
		padding: 12px 8px;
		min-width: 0;
		overflow-y: auto;
	}

	.rail-header {
		padding: 4px 8px 10px;
		font: 500 10px var(--font-mono);
		color: var(--ink-soft);
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}

	/* ─── Code pane ───────────────────────────────────────────────────── */
	.code-pane {
		grid-area: code;
		display: flex;
		flex-direction: column;
		min-width: 0;
		min-height: 0;
	}

	.code-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 8px 14px;
		border-bottom: 1px solid var(--paper-edge);
		background: var(--paper);
		font: 400 12.5px var(--font-ui);
	}

	.code-head-left,
	.code-head-right {
		display: inline-flex;
		align-items: center;
		gap: 10px;
	}

	.code-icon {
		width: 16px;
		height: 16px;
		color: var(--ink-mute);
	}

	.code-name {
		font: 500 13px var(--font-ui);
		color: var(--ink);
	}

	.code-meta {
		font: 500 10.5px var(--font-mono);
		color: var(--ink-soft);
		letter-spacing: 0.04em;
	}

	.code-action {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 4px 8px;
		border: 1px solid var(--paper-edge);
		background: var(--paper-soft);
		color: var(--ink-mute);
		border-radius: 4px;
		font: 500 11px var(--font-ui);
		cursor: pointer;
	}

	.code-action:hover {
		border-color: var(--ink-soft);
		color: var(--ink);
	}

	.code-action[aria-expanded='true'] {
		background: color-mix(in oklab, var(--accent) 8%, var(--paper-soft));
		border-color: color-mix(in oklab, var(--accent) 40%, var(--paper-edge));
		color: var(--accent);
	}

	.action-label {
		font: 500 11px var(--font-ui);
	}

	.code-scroll {
		flex: 1;
		overflow: auto;
		min-height: 0;
	}

	.code-pending,
	.code-error {
		padding: 16px;
		font: 400 12.5px var(--font-mono);
		color: var(--ink-soft);
	}

	.code-error {
		color: var(--danger, #b91c1c);
	}

	/* Shiki renders <pre><code>; trim default margins for compact embedding. */
	.code-scroll :global(pre) {
		margin: 0;
		padding: 14px 16px;
		font: 400 12.5px/1.55 var(--font-mono);
		background: transparent;
	}

	/* ─── Preview pane ─────────────────────────────────────────────────── */
	.preview-pane {
		grid-area: preview;
		display: flex;
		flex-direction: column;
		border-top: 1px solid var(--paper-edge);
		background: var(--paper-soft);
		min-height: 0;
	}

	.preview-head {
		padding: 6px 14px;
		font: 500 10px var(--font-mono);
		color: var(--ink-soft);
		letter-spacing: 0.16em;
		text-transform: uppercase;
		border-bottom: 1px solid var(--paper-edge);
	}

	.preview-body {
		flex: 1;
		padding: 16px;
		overflow: auto;
		min-height: 0;
	}

	/* ─── Backdrop (mobile drawer-open state) ─────────────────────────── */
	.backdrop {
		display: none;
	}

	/* ─── Mobile (< 768px) ────────────────────────────────────────────── */
	@media (max-width: 767px) {
		.code-group {
			grid-template-columns: 1fr;
			grid-template-rows: auto 1fr;
			grid-template-areas:
				'picker'
				'code';
		}

		.code-group[data-preview-open] {
			grid-template-rows: auto 1fr 1fr;
			grid-template-areas:
				'picker'
				'code'
				'preview';
		}

		.picker {
			display: inline-flex;
			grid-area: picker;
		}

		/* Tree becomes a drawer overlay on top of the code panel. */
		.rail {
			position: absolute;
			top: 41px; /* picker height */
			left: 0;
			bottom: 0;
			width: min(280px, 100%);
			z-index: 10;
			border-right: 1px solid var(--paper-edge);
			box-shadow: 0 8px 28px -8px color-mix(in oklab, var(--ink) 18%, transparent);
			transform: translateX(-100%);
			transition: transform 200ms ease;
		}

		.rail[data-open] {
			transform: translateX(0);
		}

		.backdrop {
			display: block;
			position: absolute;
			top: 41px;
			left: 0;
			right: 0;
			bottom: 0;
			background: color-mix(in oklab, var(--ink) 28%, transparent);
			border: 0;
			cursor: pointer;
			z-index: 9;
		}
	}
</style>
