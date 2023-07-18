---
title: Use Item as Value
---

## {title}

The default approach is to use an id or text value for the selected value attribute. This is useful when you are building forms and the form uses a reference id and the select component is used to show the value associated with the attribute.

However, sometimes it is helpful if the entire object is available as the selected value. This feature can be turned on by setting the property `useItemAsValue`.

```json
{
  "name": "Fruits",
  "photo": "/examples/fruits.jpg"
}
```

Using this, we can now show the actual object that was selected instead of just the id.
