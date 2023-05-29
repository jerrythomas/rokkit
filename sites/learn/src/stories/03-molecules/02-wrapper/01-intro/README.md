---
title: Basic Usage
---

The ItemWrapper component wraps a component and provides an optional remove functionality. This component can be used for displaying tags, selected items from a list, or other scenarios where a removable visual element is required. You can get all the features of the Item component in the ItemWrapper component. In addition, you can also use a custom component for the content.

## Basic Usage

To render a basic ItemWrapper component, pass a string as the `value` prop:

```svelte
<ItemWrapper value="Sample Content" />
```

## Removable

Enabling the removable option

```svelte
<ItemWrapper value="Removable" removable={true} on:remove={handleRemove} />
```

## Object data

Rendering a ItemWrapper with an icon:

```svelte
<ItemWrapper
  value={{ text: 'Removable with icon', icon: 'i-rokkit:heart-filled' }}
  removable={true}
/>
```

## Field Mapping

```svelte
<ItemWrapper
  value={{ title: 'Content with mapping' }}
  fields={{ text: 'title' }}
/>
```
