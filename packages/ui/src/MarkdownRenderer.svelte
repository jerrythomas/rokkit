<script lang="ts">
  import { marked } from 'marked'
  import type { Token } from 'marked'
  import DOMPurify from 'isomorphic-dompurify'
  import type { MarkdownPlugin } from './markdown-plugin.js'

  interface Props {
    markdown: string
    plugins?: MarkdownPlugin[]
  }

  let { markdown, plugins = [] }: Props = $props()

  const pluginMap = $derived(
    Object.fromEntries(plugins.map((p) => [p.language.toLowerCase(), p.component]))
  )

  const tokens = $derived(marked.lexer(markdown))

  function tokenToSafeHtml(token: Token): string {
    const tokenList = Object.assign([token], { links: (tokens as any).links ?? {} })
    const raw = marked.parser(tokenList as any)
    return DOMPurify.sanitize(raw)
  }
</script>

<div class="markdown-renderer" data-markdown>
  {#each tokens as token, i (i)}
    {#if token.type === 'code'}
      {@const lang = (token.lang ?? '').toLowerCase()}
      {@const Plugin = pluginMap[lang]}
      {#if Plugin}
        <Plugin code={token.text} />
      {:else}
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html tokenToSafeHtml(token)}
      {/if}
    {:else}
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html tokenToSafeHtml(token)}
    {/if}
  {/each}
</div>
