---
title: Custom Items
---

The Switch component provides multiple properties, allowing you to change its behavior to suit your needs.

## Properties

- _items_ : Supply the data for the switch. Defaults to `[false, true]`.
- _fields_ : Adapt to your data by customizing the fields
- _using_ : An object containing components to be used for displaying data. Uses the Text component by default.
- _value_ : Current selected value
- _class_ : Set custom class for style overrides
- _compact_ : Used to set the compact mode where padding and spacing are removed. Set this to false to override spacing and padding.

You can customize the items displayed in the Switch by providing an array of strings.

Define an array of strings.

```js
let items = ['one', 'two', 'three']
```

Set the `items` property using the array.

```svelte
<Switch {items} />
```
