<script lang="ts">
	import { noteBlocks } from './notes.js'

	let { note }: { note?: string } = $props()

	const blocks = $derived(noteBlocks(note))
</script>

{#snippet segs(parts: ReturnType<typeof noteBlocks>[number]['lines'][number])}
	<!-- Keyed by INDEX, not by text. A segment has no identity of its own, and its text is
	     not unique — "either `a` or `a`" yields two code segments reading `a`, which throws
	     each_key_duplicate and renders nothing. Position is the only stable key here, and
	     the whole list is re-derived whenever the note changes. -->
	{#each parts as part, i (i)}
		{#if part.code}<code data-graph-note-code>{part.text}</code>{:else}{part.text}{/if}
	{/each}
{/snippet}

<div data-graph-note>
	{#each blocks as block (block)}
		{#if block.type === 'ul'}
			<ul data-graph-note-list>
				{#each block.lines as line (line)}
					<li>{@render segs(line)}</li>
				{/each}
			</ul>
		{:else}
			<p>{@render segs(block.lines[0])}</p>
		{/if}
	{/each}
</div>
