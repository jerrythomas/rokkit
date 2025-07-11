---
title: Field Mapping
---

You can customize the field mapping of items.

## Fields

Field mapping allows you to customize which properties of the items are displayed or used for specific purposes. This means you can have more control over the appearance and behavior of the Switch switches in your application.

By using field mapping, you can easily adapt the Switch component to work with different data structures. This makes it easier to integrate the component into various contexts, even when your data comes from different sources or has varying structures.

```js
let fields = {
  text: 'mode'
}
```

In this example, we have mapped the text to the mode attribute and the icon to the image attribute. Notice that we only had to specify the attributes that need to be mapped. Since the default attribute for showing the icon is 'icon', we did not have to provide mapping for it.
