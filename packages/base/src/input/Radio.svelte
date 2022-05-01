<script>
  export let id
  export let checked = false
  export let size = '1.5em'
  export let alignTop = false
  export let disabled = false

  let cx = 50
  let cy = 50
</script>

<style>
  svg {
    flex-shrink: 0;
    align-self: center;
  }
  .align-top {
    align-self: flex-start;
  }
</style>

<svg
  id="{id}"
  width="{size}"
  height="{size}"
  class:align-top="{alignTop}"
  viewBox="0 0 100 100"
  on:click="{() => (checked = disabled ? checked : !checked)}">
  <circle
    cx="{cx}"
    cy="{cy}"
    r="34"
    stroke-width="7.5"
    fill="none"
    stroke="currentcolor"></circle>
  {#if checked}
    <circle cx="{cx}" cy="{cy}" r="22" fill="currentcolor"></circle>
    <!--   <path fill="currentcolor" d="M28 50 l-3 7 l21 16 l30 -38 l-7 -4 l-24 35z" ></path> -->
  {/if}
</svg>
