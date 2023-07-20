---
title: Validations
labs: true
---

You can provide a boolean variable to toggle validations on or off for the form. This allows users to choose whether they want to display validation messages as they move away from input controls.

```svelte
<script>
  import { Form } from '@rokkit/organisms'

  const schema = {
    name: { type: 'string', required: true },
    email: { type: 'email', required: true },
    age: { type: 'number', min: 18, max: 99 }
  }

  const layout = [
    { type: 'group', label: 'Personal Information', fields: ['name', 'email'] },
    { type: 'group', label: 'Age', fields: ['age'] }
  ]

  let value = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    age: 30
  }

  let showValidations = true
</script>

<Form bind:value {schema} {layout} {showValidations} />
```

In this example, we added a boolean variable `showValidations` to toggle validations on or off. The form will now display validation messages only if `showValidations` is true.

Congratulations! You've learned how to create a dynamic form component that can be progressively enhanced with schema, layout, and toggleable validations. Feel free to explore more features and customize
