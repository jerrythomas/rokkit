---
title: Fields
---

# {title}

The Select component is flexible and can adapt to your data structure. Instead of altering your attributes
to conform to the expected structure, you can use the `fields` property to specify which attributes
should be used by the component.

A snippet of one of the items is below

```json
{
  "name": "Fruits",
  "photo": "/examples/fruits.jpg"
}
```

In this we want to show `name` and the `photo` attributes as the text and image respectively.
To do this we can configure fields as below

```js
let fields = {
  text: 'name',
  image: 'photo'
}
```
