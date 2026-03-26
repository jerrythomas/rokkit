<script lang="ts">
  import { onMount } from 'svelte'
  import DOMPurify from 'isomorphic-dompurify'

  let { code }: { code: string } = $props()
  let container: HTMLDivElement | undefined = $state()
  let error = $state<string | null>(null)

  onMount(async () => {
    try {
      const { default: mermaid } = await import('mermaid')
      mermaid.initialize({ startOnLoad: false, theme: 'default' })
      const id = `mermaid-${  Math.random().toString(36).slice(2)}`
      const { svg } = await mermaid.render(id, code)
      if (container) {
        const sanitized = DOMPurify.sanitize(svg, { USE_PROFILES: { svg: true } })
        container.innerHTML = sanitized
      }
    } catch (e) {
      error = e instanceof Error ? e.message : 'Mermaid render failed'
    }
  })
</script>

{#if error}
  <div data-block-error class="block-error">
    <span>Mermaid error: {error}</span>
    <details><summary>Raw</summary><pre>{code}</pre></details>
  </div>
{:else}
  <div bind:this={container} class="mermaid-block" data-mermaid-block></div>
{/if}
