---
title: Editor Properties
labs: true
---

In the previous section, we added a custom layout to group elements together. You would have noticed that the gender field is a text box and wondered how can we change this to show a select, radio or a toggle instead.

The layout property is for providing additional presentation configuration which is not specifically associated with the data schema. So when you want to use an alternative input component or add a custom component as an editor, you can specify the editor property.

Modify the schema to specify the datatype to `enum` and provide the enum values in the data schema.

```js
const schema = {
  type: 'object',
  properties: {
    name: { type: 'string', required: true },
    category: { type: 'enum', required: true }
  }
}
```

```js
import { items } from './categories'
const layout = {
  elements: [
    {
      label: 'Item Name',
      scope: '#/name'
    },
    {
      label: 'Category',
      scope: '#/category',
      editor: 'select',
      items
    }
  ]
}
```

Now we have a custom
