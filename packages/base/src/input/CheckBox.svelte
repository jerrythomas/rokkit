<script>
  export let checked = false
  export let circle = false
  export let size = '1.5em'
  export let alignTop = false
  export let id
  export let disabled = false

  let cx = 50
  let cy = 50
  let r = 34
  let round = 10
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
  on:click="{() => (disabled ? checked : !checked)}">
  {#if circle}
    <circle
      class="bg"
      cx="{cx}"
      cy="{cy}"
      r="{r}"
      stroke-width="7.5"
      fill="none"
      stroke="currentcolor"></circle>
  {:else}
    <rect
      x="{cx - r}"
      y="{cx - r}"
      width="{2 * r}"
      height="{2 * r}"
      rx="{round}"
      ry="{round}"
      stroke-width="7.5"
      fill="none"
      stroke="currentcolor"></rect>
  {/if}
  {#if checked}
    <path
      fill="currentcolor"
      d="M28 50 l-3 7 l21 16 l30 -38 l-7 -4 l-24 35z"></path>
  {/if}
</svg>
