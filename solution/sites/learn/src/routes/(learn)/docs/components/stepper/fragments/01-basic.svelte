<script>
  import { Stepper } from '@rokkit/ui'

  let steps = [
    { text: 'Account', completed: true },
    { text: 'Profile' },
    { text: 'Review' }
  ]
  let current = $state(1)
</script>

<Stepper {steps} bind:current onclick={(step) => current = step} />
