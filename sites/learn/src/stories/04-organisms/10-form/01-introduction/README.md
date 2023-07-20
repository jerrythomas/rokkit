---
title: Introduction
---

The `Form` component allows you to create forms easily by providing an object as the initial value. You can progressively enhance the form by adding a schema to define the structure and validation properties for each attribute of the object. Additionally, you can control the layout of the form using another schema, toggle validations on or off, and display validation messages as users move away from input controls.

## A Simple form

To get started, you can simply provide an object as the initial value for the form. The component will automatically create input controls for each attribute in the object. Here's how you can use the component:

```svelte
<script>
  import { Form } from '@rokkit/organisms'

  let value = {
    name: 'John Doe',
    gender: 'male',
    email: 'john.doe@example.com',
    age: 30
  }
</script>

<Form bind:value />
```

In this example, we initialize the form with an object containing name, email, and age attributes. The component will automatically create input controls for each attribute and bind them to the form's state.

Note that the value changes are being displayed as you make changes. Also, note that email is identified as a string and does not have any validations attached to it.
