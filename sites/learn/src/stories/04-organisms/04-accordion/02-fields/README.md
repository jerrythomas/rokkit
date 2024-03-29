---
title: Fields
---

## {title}

The accordion displays the content using the Text component. This expects the attributes `text`; an
optional `icon` or `image`, and displays content. However, data from APIs may not match this structure.
To use data with custom attributes, use the fields attribute and the accordion can adapt to the data.

Since accordion is a nested structure, it expects a nested array. If the data provided does not have nested elements then it is more suitable for a list.

A short snippet of the data is shown below

```json
[
  {
    "category": "Fruits",
    "values": [
      {
        "name": "apple",
        "photo": "/examples/apple.jpg"
      }
    ]
  }
]
```

In this example, we want to show `category` as sections and the nested data which is in `values` attribute. In the inner data structure, we want to use the `name` and `photo` attributes.

Note the nested fields property which allows us to map the inner structure elements.

```js
const fields = {
  text: 'category',
  data: 'values',
  fields: {
    text: 'name',
    image: 'photo'
  }
}
```

We will also set the autoClose property so that opening one section closes the remaining sections.
