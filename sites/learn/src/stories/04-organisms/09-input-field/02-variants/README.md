---
title: Variants
---

The InputField component goes beyond standard HTML inputs and allows you to use custom components seamlessly. You can integrate components like select dropdowns, rating systems, or radio button groups easily.

Example:

```html
<!-- Using a custom select component -->
<InputField type="select" options="{selectOptions}" />

<!-- Using a custom rating component -->
<InputField type="rating" max="{5}" />

<!-- Using a custom radiogroup component -->
<InputField type="radiogroup" options="{radioOptions}" />
```

By specifying the `type` property with the corresponding value (select, rating, or radiogroup) and providing the necessary props (e.g., `options`, `max`), you can use custom components within the InputField.
