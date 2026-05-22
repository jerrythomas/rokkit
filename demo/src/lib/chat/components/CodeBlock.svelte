<script lang="ts">
	interface CodeBlockProps {
		/** Filename label shown in the header */
		filename?: string
		/** Language label shown as a chip in the header */
		language?: string
		/** The code body */
		code: string
		/** Max height of the pre block (CSS length). Default: no cap. */
		height?: string
	}

	const {
		filename = '',
		language = 'svelte',
		code,
		height
	}: CodeBlockProps = $props()

	/** Tiny tokenizer — strings, keywords, tags, expressions, comments. */
	type Part = { text: string; cls?: string }

	function tint(line: string): Part[] {
		const parts: Part[] = []

		// Comment first — everything after // is gray.
		const cIdx = line.indexOf('//')
		if (cIdx !== -1) {
			parts.push({ text: line.slice(0, cIdx) })
			parts.push({ text: line.slice(cIdx), cls: 'co' })
			return parts
		}

		const re =
			/(<[^>]+>)|(\{[^}]+\})|('[^']*'|"[^"]*"|`[^`]*`)|\b(const|let|var|import|from|export|default|function|return|if|else|new|class|async|await)\b/g
		let lastIdx = 0
		let m: RegExpExecArray | null
		while ((m = re.exec(line)) !== null) {
			if (m.index > lastIdx) parts.push({ text: line.slice(lastIdx, m.index) })
			if (m[1]) parts.push({ text: m[1], cls: 'tag' })
			else if (m[2]) parts.push({ text: m[2], cls: 'expr' })
			else if (m[3]) parts.push({ text: m[3], cls: 'str' })
			else if (m[4]) parts.push({ text: m[4], cls: 'kw' })
			lastIdx = re.lastIndex
		}
		if (lastIdx < line.length) parts.push({ text: line.slice(lastIdx) })
		return parts
	}

	const lines = $derived(code.split('\n'))

	let copied = $state(false)
	async function copyCode() {
		try {
			await navigator.clipboard.writeText(code)
			copied = true
			setTimeout(() => (copied = false), 1500)
		} catch {
			// Silent fail — clipboard API may require https or user gesture
		}
	}

	function downloadCode() {
		const blob = new Blob([code], { type: 'text/plain' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = filename || 'code.txt'
		a.click()
		URL.revokeObjectURL(url)
	}
</script>

<div data-code-block>
	<div data-code-block-header>
		<div data-code-block-title>
			<span data-code-block-icon class="i-mdi:code-tags" aria-hidden="true"></span>
			{#if filename}<span data-code-block-filename>{filename}</span>{/if}
			{#if language}<span data-code-block-lang>{language}</span>{/if}
		</div>
		<div data-code-block-actions>
			<button type="button" onclick={copyCode} title="Copy code">
				<span class={copied ? 'i-mdi:check' : 'i-mdi:content-copy'} aria-hidden="true"></span>
				<span>{copied ? 'Copied' : 'Copy'}</span>
			</button>
			<button type="button" onclick={downloadCode} title="Download as file">
				<span class="i-mdi:download" aria-hidden="true"></span>
				<span>.{language}</span>
			</button>
		</div>
	</div>
	<pre style:max-height={height || undefined}>{#each lines as line, i (i)}<code><span data-code-block-line-num>{String(i + 1).padStart(2, ' ')}</span><span>{#each tint(line) as part, j (j)}{#if part.cls}<span class={part.cls}>{part.text}</span>{:else}{part.text}{/if}{/each}</span>
</code>{/each}</pre>
</div>
