# Dynamic Forms

Dynamic forms created using [JSON Schema](https://json-schema.org) will speed up the UI development process.

Three ways to build dynamic forms:

- Write the form structure using JSON Schema
- Visually create the form using the `<FormBuilder>` component
- Convert a database table definition to JSON Schema

## Validation v/s Layout

I think that validation and layout should be different.

## Examples

```jsonc
{
  "type": "array",
  "component": "master-detail",
  "items": {
    "type": "object",
    "required": ["answers"],
    "layout": "vertical",
    "order": ["contenturl", "questionId", "question", "prompt", "answers"],
    "properties": {
      "contenturl": {
        "type": "string",
        "component": "custom"
      },
      "question": {
        "type": "string",
        "readOnly": true
      },
      "prompt": {
        "type": "string",
        "readOnly": true
      },
      "answers": {
        "type": "string"
      },
      "questionId": {
        "type": "string",
        "readOnly": true
      }
    }
  }
}
```

## Lists

Lists can be represented using a master-detail component.

DynamicField

A schema defines the field properties.

Any field can be defined using the properties below.

- [ ] Value: this is a bound property so that changes are propagated both ways
- [ ] Properties: this can be passed using a spread operator and can consist of multiple varied properties
- [ ] Events: in a generic input we can handle the blur event along with the change event to identify when a field should be validated
- [ ] hasChanged (can be a bound property to identify that this attribute has undergone a change and should be validated again)
- [ ] message : A message along with type to displayed the validation message. The type can be used to show an icon also

This covers all inputs provided Input handles all the types listed. Even select and range because the additional props are provided.

There are a few special types of inputs, which cannot be included in the generic `<InputField/>`. Object and array are two that come to mind. There are many ways an array can be visually represented. One of them is a tabbed view. This allows us to add and remove items as well. If the tabs are scrollable and an arbitrary index can be provided then this can support large arrays. Another approach is paginated tabs. This can have limited values visible with page increment/decrement options.

Another is a master detail, with a scrollable list to display items and detail for the item edit. To support add/delete action buttons need to be provided. A swipeable page with dots to navigate is yet another option to edit arrays. The content of an array can be an object, multiple typed items or a set of same type items. Like an array of mixed type elements, array of string or numbers, array of objects.

An object has multiple attributes and each attribute can be represented using the InputField or ArrayField or ObjectField.

The top level of any dynamic data input is either an array or an object. When the top level is an array it is preferable to use the master-detail approach. When the array is nested deeper, then one of the other approaches can be used. A paginated set seems to be the simplest user experience for an array.

At the top level using a master-detail approach allows us to perform independent updates on each item change instead of a bulk change at the array level. We also have the flexibility to use different types of list views for the master. This can be a simple list, accordion, tree or a nested list.

Properties to configure master detail. Another alternative is an inline list editor where each item is an editable form.

- [ ] type: type of list
- [ ] items: the array
- [ ] fields: field mapping for item
- [ ] using: the component for the item (this can be a predefined dynamic form)
- [ ] schema: schema to be used for the content. This can be used to generate the detail form for the object. In the case of mixed data types this can be a nested object with types as keys and for each key a schema for the data.
- [ ] mixed: false. Identifies whether the array is mixed.
- [ ] inline: false. identifies whether the detail should be inline or not.
- [ ] inline editing should be avoided for cases where we need accordion and addition of rows. It can be nice for a fixed set of rows.

Object field needs the following attributes.

- [ ] schema: schema definition to be used for validation
- [ ] value: the value object to be updated
- [ ] layout: optional layout that allows building multi column layout for the attributes in the object. In case it is not provided this can be derived from the schema.
- [ ] A group attribute can be used to identify the layout. If it is not provided then all attributes are in single group. If a group number is provided then we can split the schema into different arrays where group number is the index of the array. We may need to handle bad data (missing groups) in an optimal way. In case of grouped layout the layout attribute should be an array or the value should be used across all groups.

// ObjectField.svelte

```svelte
<script >
export let data={}
export let schema={}
export let layout

</script >

{#if typeof data == object }
{#if schema.groups}
<input-group class={layout}>
{#each schema.groups as {layout, label, keys}}
     <InputObject bind:value=data {label}bind:properties=schema.properties
keys/>
</input-group>
{/each}
{:else}

  <InputObject bind:value=data bind:properties=schema.properties
/>

{/if}
{:else}
  <error>
    expected data attribute to be an object.
  </error>
{/if}
```

// InputObject

```svelte
<script >
export let label
export let value
export let using
export let name
export let properties
export let keys = Object.keys(properties)
</script >

<Fieldset {label}>
{#each keys as k}
         {@const component=using[properties[k].component]}
         {@const props = omit([‘component’,’hasChanged’], schema.properties[k]}
         <svelte:component this=component bind:value=data[k]
            bind:hasChanged={properties[k].hasChanged]
{…props} />
// if type is object do svelte:self
      {/each}

 </Fieldset>
```
