<script lang="ts">
	import { LazyTree } from '@rokkit/ui'

	let { ...spread }: Record<string, unknown> = $props()

	type Node = {
		label: string
		value: string
		icon: string
		children?: boolean
	}

	const items: Node[] = [
		{ label: 'Documents', value: 'docs', icon: 'i-glyph:folder', children: true },
		{ label: 'Pictures', value: 'pics', icon: 'i-glyph:folder', children: true },
		{ label: 'Projects', value: 'projects', icon: 'i-glyph:folder', children: true },
		{ label: 'notes.txt', value: 'notes', icon: 'i-glyph:file-text' }
	]

	async function handleLazyLoad(item: unknown): Promise<unknown[]> {
		await new Promise((r) => setTimeout(r, 600))
		const node = item as Node
		if (node.value === 'docs') {
			return [
				{ label: 'Resume.pdf', value: 'resume', icon: 'i-glyph:file-text' },
				{ label: 'Cover Letter.docx', value: 'cover', icon: 'i-glyph:file-text' }
			]
		}
		if (node.value === 'pics') {
			return [
				{ label: 'vacation.jpg', value: 'vacation', icon: 'i-glyph:gallery' },
				{ label: 'profile.png', value: 'profile', icon: 'i-glyph:gallery' }
			]
		}
		if (node.value === 'projects') {
			return [
				{ label: 'rokkit', value: 'rokkit', icon: 'i-glyph:folder', children: true },
				{ label: 'sensei', value: 'sensei', icon: 'i-glyph:folder', children: true }
			]
		}
		if (node.value === 'rokkit' || node.value === 'sensei') {
			return [
				{ label: 'README.md', value: `${node.value}-readme`, icon: 'i-glyph:file-text' },
				{ label: 'package.json', value: `${node.value}-pkg`, icon: 'i-glyph:file-text' }
			]
		}
		return []
	}

	let selected = $state<unknown>(null)
</script>

<div class="grid">
	<section>
		<header>Async folder tree — expand to fetch (600ms delay)</header>
		<LazyTree {items} onlazyload={handleLazyLoad} bind:value={selected} {...spread} />
		<p class="hint">Selected: <code>{(selected as string) ?? '—'}</code></p>
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
	.hint {
		margin: 0;
		font: 400 12px var(--font-ui);
		color: var(--ink-mute);
	}
</style>
