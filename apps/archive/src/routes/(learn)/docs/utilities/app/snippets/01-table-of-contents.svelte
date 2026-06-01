<script>
  import { TableOfContents } from '@rokkit/app'
  import { afterNavigate } from '$app/navigation'

  let toc

  // Rescan headings after each SvelteKit route transition
  afterNavigate(() => toc?.rescan())
</script>

<!-- Scans h2/h3 inside element with id="main-content" -->
<TableOfContents bind:this={toc} container="main-content" />
