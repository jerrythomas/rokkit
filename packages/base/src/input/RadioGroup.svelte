<script>
  import Radio from './Radio.svelte'

  export let options = []
  export let value

  let index = options.findIndex((option) => option['isDefault'])
  $: value = index > 0 ? options[index] : null

  export let fail = false
  export let pass = false
  export let disabled = false

  $: disabled = disabled || pass || fail
</script>

<section class:disabled class:fail class:pass>
  {#each options as { label }, i}
    <div on:click={() => (index = disabled ? index : i)}>
      <Radio id={i} checked={index == i} alignTop />
      <label for={i}>{label}</label>
    </div>
  {/each}
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    border-radius: 2mm;
    background-color: var(--bg-600);
    color: var(--fg-600);
    padding: 0.5em 1em;
  }
  div {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0.3em 0;
    line-height: 1.5em;
    border-bottom: 1px dotted rgba(0, 0, 0, 0.3);
  }
  div:last-child {
    border: none;
  }
  label {
    display: flex;
    flex: 1 1 auto;
    padding-left: 1em;
  }
  .disabled {
    color: var(--fg-disabled);
  }
  .fail {
    background-color: var(--bg-fail);
    color: var(--fg-fail);
  }
  .pass {
    background-color: var(--bg-pass);
    color: var(--fg-pass);
  }
</style>
