<script lang="ts">
  let { code }: { code: string } = $props()

  interface TableData { columns: string[]; rows: Record<string, unknown>[] }

  const result = $derived.by(() => {
    try {
      const parsed = JSON.parse(code)
      if (!Array.isArray(parsed?.columns) || !Array.isArray(parsed?.rows)) {
        throw new Error('Expected { columns: string[], rows: object[] }')
      }
      return { data: parsed as TableData, error: null }
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Invalid JSON' }
    }
  })
</script>

{#if result.error}
  <div data-block-error class="block-error">
    <span>Table error: {result.error}</span>
    <details><summary>Raw</summary><pre>{code}</pre></details>
  </div>
{:else}
  {@const { columns, rows } = result.data!}
  <div class="table-block" data-table-block>
    <table>
      <thead><tr>{#each columns as col}<th>{col}</th>{/each}</tr></thead>
      <tbody>
        {#each rows as row}
          <tr>{#each columns as col}<td>{row[col] ?? ''}</td>{/each}</tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}
