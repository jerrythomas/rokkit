---
title: Introduction
---

The ValidationReport component is a versatile component that displays the result for multiple validation rules on a data item. It provides a visual representation of the validation status and allows users to easily identify any validation errors or warnings associated with the data.

```svelte
<script>
  import { ValidationReport } from '@rokkit/atoms'

  let items = [
    { text: 'Should be a number', valid: true, status: 'pass' },
    { text: 'Should be > 5', valid: false, status: 'fail' },
    { text: 'Should be < 15', valid: false, optional: true, status: 'warn' }
  ]
</script>

<ValidationReport {items} />
```
