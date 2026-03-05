<script>
	// @ts-nocheck
  import { Pill } from '@rokkit/ui'
  import { FieldMapper } from '@rokkit/core'
  import Status from './Status.svelte'

  let mapping = new FieldMapper({}, { default: Status })
</script>

<Pill value="success" {mapping} />