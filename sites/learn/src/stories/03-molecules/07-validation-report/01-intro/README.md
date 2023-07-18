---
title: Introduction
---

The ValidationReport component is a versatile component that displays the result for multiple validation rules on a data item. It provides a visual representation of the validation status and allows users to easily identify any validation errors or warnings associated with the data.

```svelte
<script>
  import { ValidationReport } from '@rokkit/atoms'

  let items = [
    { text: 'Required field', valid: false },
    { text: 'Value must be a number', valid: false },
    { text: 'Value must be greater than 0', valid: true }
  ]
</script>

<ValidationReport {items} />
```
