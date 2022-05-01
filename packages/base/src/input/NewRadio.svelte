<script>
  // import RadioGroup from '$lib/input/RadioGroup'
  // import Radio from '$lib/input/Radio'
  import RadioOff from '$lib/icons/RadioOff.svelte'
  import RadioOn from '$lib/icons/RadioOn.svelte'
  import Icon from '$lib/Icon.svelte'
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  export let checked = false
  export let header
  export let label
  export let pass = false
  export let fail = false
  export let disabled = false

  function toggle() {
    checked = !checked
    dispatch('change', { checked })
  }
  function handleKeypress(event) {
    if (event.key === ' ') toggle()
  }
  $: icon = checked ? RadioOn : RadioOff
  $: text = header == '' ? label : `${header}. ${label}`

  $: console.log('header', header)
</script>

<section
  class="p-4 rounded-lg bg-accent-200 text-accent-900 items-start shadow flex flex-row justify-top space-x-4 outline-none focus:border focus:border-accent-500"
  tabindex="0"
  on:click={toggle}
  on:keypress={handleKeypress}
  class:disabled
  class:pass
  class:fail
>
  <Icon {icon} title={text} />
  <span class="flex-grow space-y-2">
    {#if header}
      <h1 class="font-bold">{header}</h1>
    {/if}
    <p class=" text-sm">{label}</p>
  </span>
</section>

<style lang="postcss">
  .pass {
    @apply bg-pass-100 text-pass-900;
  }
  .fail {
    @apply bg-fail-100 text-fail-900;
  }
  .disabled {
    @apply text-accent-400;
  }
</style>
