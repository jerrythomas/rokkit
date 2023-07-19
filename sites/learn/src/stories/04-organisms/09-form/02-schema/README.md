---
title: Schema
---

To add validation properties and datatypes to each attribute of the form, we can provide a schema. The `schema` property is a structured object that defines the structure of the form value, along with validation properties.

```svelte
<script>
  import { Form } from '@rokkit/organisms'

  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string', required: true },
      email: { type: 'email', required: true },
      age: { type: 'number', min: 18, max: 99 }
    }
  };

  let value = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    age: 30
  };
</script>

<Form bind:value {schema} />
```

In this example, we added a schema object to specify the validation properties for each form attribute. The form will now display validation messages if a user enters invalid data. Try it out, provide some invalid data and click on the submit button.
