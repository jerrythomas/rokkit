<script lang="ts">
	import { Code } from '@rokkit/ui'

	// MarkdownRenderer's plugin contract hands a fence only its `code` — never the language
	// — so there is one thin wrapper per language rather than a single generic component.
	let { code }: { code: string } = $props()
</script>

<Code {code} language="js" theme="dark" />
