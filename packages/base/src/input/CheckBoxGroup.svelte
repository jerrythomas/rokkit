<script>
  import CheckBox from './CheckBox.svelte'
  export let options = []
  export let fail = false
  export let pass = false
  export let warn = false
  export let disabled = false

  $: disabled = disabled || pass || fail || warn
</script>

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
    border-radius: 0;
  }
  div:first-child {
    border-radius: 2mm 2mm 0 0;
  }
  div:last-child {
    border: none;
    border-radius: 0 0 2mm 2mm;
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
  .warn {
    background-color: var(--bg-warn);
    color: var(--fg-warn);
  }
  .item-pass {
    color: var(--fg-pass);
  }
  .item-fail {
    color: var(--fg-fail);
  }
</style>

<section class:disabled class:fail class:pass class:warn>
  {#each options as { label, checked, pass, fail }, i}
    <div
      class:item-pass="{pass}"
      class:item-fail="{fail}"
      on:click="{() => (checked = disabled ? checked : !checked)}">
      <CheckBox id="{i}" checked="{checked}" alignTop />
      <label for="{i}">{label}</label>
    </div>
  {/each}
</section>
