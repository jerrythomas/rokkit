<script lang="ts">
  import { Sparkline } from '@rokkit/chart'

  let { code }: { code: string } = $props()

  const result = $derived.by(() => {
    try {
      return { spec: JSON.parse(code), error: null }
    } catch (e) {
      return { spec: null, error: e instanceof Error ? e.message : 'Invalid JSON' }
    }
  })
</script>

{#if result.error}
  <div data-block-error class="block-error">
    <span>Sparkline error: {result.error}</span>
    <details><summary>Raw</summary><pre>{code}</pre></details>
  </div>
{:else}
  <Sparkline {...result.spec} />
{/if}
