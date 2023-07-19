---
title: Layout
---

You can further enhance the form by providing a layout schema to control the layout of the form controls. The layout schema allows you to customize the form's appearance, such as arranging controls vertically or horizontally, adding collapsible sections, and grouping sections.

Consider the scenario when you have two attributes like first name and last name which you wish to show in a single row, while the other attributes are on different rows. This can be achieved using a custom layout.

```js
export const layout = {
  type: 'vertical',
  elements: [
    {
      title: 'name',
      type: 'horizontal',
      elements: [
        {
          label: 'First Name',
          scope: '#/first_name'
        },
        {
          label: 'Last Name',
          scope: '#/last_name'
        }
      ]
    },
    {
      label: 'gender',
      scope: '#/gender'
    },
    {
      label: 'age',
      scope: '#/age'
    }
  ]
}
```

In this example, we added a layout schema to arrange the form controls into groups. The form will now display grouped sections for a more organized layout.
