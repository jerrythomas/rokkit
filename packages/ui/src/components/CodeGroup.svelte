<script lang="ts">
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
	 * default — users opt in via the "Show preview" toggle.
	 *
	 * Icons follow the Rokkit semantic-icon pattern: defaults come from
	 * `DEFAULT_STATE_ICONS` (the `file` / `folder` / `view` / `action`
	 * groups). Consumers override per-group via the `icons` prop, same
	 * shape as Tree / BreadCrumbs / Dropdown.
	 */
	import { DEFAULT_STATE_ICONS } from '@rokkit/core'
	import type { CodeGroupFile, CodeGroupProps } from '../types/code.js'
	import Tree from './Tree.svelte'
	import CodeBlock from './CodeBlock.svelte'

	let {
		files = [],
		initialFile,
		class: className = '',
		icons: userIcons = {},
		preview,
		showCopyButton = true
	}: CodeGroupProps = $props()

	const icons = $derived({
		doc: { ...DEFAULT_STATE_ICONS.doc, ...(userIcons.doc ?? {}) },
		folder: { ...DEFAULT_STATE_ICONS.folder, ...(userIcons.folder ?? {}) },
		view: { ...DEFAULT_STATE_ICONS.view, ...(userIcons.view ?? {}) },
		action: { ...DEFAULT_STATE_ICONS.action, ...(userIcons.action ?? {}) }
	})

	let selectedPath = $state('')
	$effect(() => {
		if (!selectedPath && files.length > 0) {
			selectedPath = initialFile ?? files[0].path
		}
	})
	let drawerOpen = $state(false)
	let previewExpanded = $state(false)

	// Map file extensions to icon keys in icons.doc. Unknown extensions fall
	// back to icons.doc.default. Consumers can extend by passing an icon
	// override on individual file entries or via the icons prop.
	const EXT_TO_KEY: Record<string, string> = {
		svelte: 'svelte',
		js: 'js',
		mjs: 'js',
		cjs: 'js',
		ts: 'ts',
		tsx: 'ts',
		css: 'css',
		scss: 'css',
		sass: 'css',
		html: 'html',
		htm: 'html',
		json: 'json',
		yaml: 'json',
		yml: 'json',
		md: 'md',
		mdx: 'md'
	}

	function iconForFile(file: CodeGroupFile): string {
		if (file.icon) return file.icon
		const ext = (file.name ?? file.path).split('.').pop()?.toLowerCase() ?? ''
		const key = EXT_TO_KEY[ext] ?? 'default'
		return icons.doc[key] ?? icons.doc.default
	}

	function iconForPath(path: string): string {
		const ext = path.split('.').pop()?.toLowerCase() ?? ''
		const key = EXT_TO_KEY[ext] ?? 'default'
		return icons.doc[key] ?? icons.doc.default
	}

	const activeFile = $derived(files.find((f) => f.path === selectedPath))
	const activeFileName = $derived(
		activeFile ? (activeFile.name ?? activeFile.path.split('/').pop()) : ''
	)

	// Build a hierarchical tree from the flat path list. Intermediate
	// segments become folder nodes; the final segment becomes a file leaf
	// carrying the original path as its id. Folder nodes get their icon
	// from the Tree's default state (it owns folder open/closed via its
	// own icons prop); file leaves get the per-extension semantic icon.
	const tree = $derived.by(() => {
		const root: unknown[] = []
		const lookup = new Map<string, Record<string, unknown>>()
		for (const f of files) {
			const parts = f.path.split('/').filter(Boolean)
			let parentChildren = root
			let acc = ''
			for (let i = 0; i < parts.length; i++) {
				const part = parts[i]
				const isLeaf = i === parts.length - 1
				acc = acc ? `${acc}/${part}` : part
				let node = lookup.get(acc) as Record<string, unknown> | undefined
				if (!node) {
					node = {
						id: acc,
						name: part,
						icon: isLeaf ? iconForFile(f) : undefined,
						children: isLeaf ? undefined : []
					}
					lookup.set(acc, node)
					parentChildren.push(node)
				}
				if (!isLeaf) parentChildren = node.children as unknown[]
			}
		}
		return root
	})

	function handleTreeSelect(value: unknown) {
		// Tree fires onselect for folders too; only switch the panel when
		// the selection is a real file path. Closes the drawer on mobile
		// after a pick so users see their selection immediately.
		if (typeof value !== 'string') return
		const file = files.find((f) => f.path === value)
		if (!file) return
		selectedPath = value
		drawerOpen = false
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
			<span class="picker-icon {activeFile ? iconForPath(activeFile.path) : icons.doc.default}" aria-hidden="true"></span>
			<span class="picker-name">{activeFileName || 'Choose file'}</span>
			<span class="picker-chevron {icons.action.expand ?? 'navigate-down'}" aria-hidden="true"></span>
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
				icons={{ opened: icons.folder.opened, closed: icons.folder.closed }}
			/>
		</aside>

		<!-- Backdrop covers the code area when the drawer is open on mobile. -->
		{#if drawerOpen}
			<button
				type="button"
				class="backdrop"
				aria-label="Close file picker"
				onclick={() => (drawerOpen = false)}
			></button>
		{/if}

		<section class="code-pane" aria-label="Code">
			{#if activeFile}
				<CodeBlock
					code={activeFile.code}
					language={activeFile.language}
					filename={activeFileName}
					allowCopy={showCopyButton}
				>
					{#snippet actions()}
						{#if preview}
							<button
								type="button"
								onclick={() => (previewExpanded = !previewExpanded)}
								aria-expanded={previewExpanded}
								title={previewExpanded ? 'Hide preview' : 'Show preview'}
							>
								<span class={previewExpanded ? icons.view.off : icons.view.preview} aria-hidden="true"></span>
								<span>{previewExpanded ? 'Hide preview' : 'Show preview'}</span>
							</button>
						{/if}
					{/snippet}
				</CodeBlock>
			{/if}
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
		overflow: hidden;
	}

	.code-pane :global([data-code-block]) {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
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

		.rail {
			position: absolute;
			top: 41px;
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
