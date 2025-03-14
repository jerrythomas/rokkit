---
title: Editors
labs: true
---

In the previous section, we changed the data type for the gender attribute to enum and provided the enum values in the schema. In some cases, this is not practical as the list of items might vary and may need to be obtained using an API.

One such example is given below.

```js
const schema = {
  type: 'object',
  properties: {
    gender: { type: 'enum', required: true, enum: ['male', 'female'] }
  }
}
```

```js
const layout = {
  elements: [
    {
      label: 'Gender',
      scope: '#/gender',
      editor: 'switch'
    }
  ]
}
```
