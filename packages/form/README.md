# Dynamic Forms

Dynamic forms created using [JSON Schema](https://json-schema.org) will speed up the UI development process.

Three ways to build dynamic forms:

- Write the form structure using JSON Schema
- Visually create the form using `<FormBuilder>` component
- Convert a database table definition to JSON Schema

## Validation v/s Layout

I think that validation and layout should be different.

## Examples

```jsonc
{
  "type": "array",
  "items": {
    "type": "object",
    "required": ["answers"],
    "layout": "vertical",
    "order": ["contenturl", "questionId", "question", "prompt", "answers"],
    "properties": {
      "contenturl": {
        "type": "string",
        "widget": "custom",
        "widgetType": "image-component"
      },
      "question": {
        "type": "string",
        "readOnly": true,
        "class": ["field-width"]
      },
      "prompt": {
        "type": "string",
        "readOnly": true,
        "class": ["field-width"]
      },
      "answers": {
        "type": "string",
        "class": ["field-width"]
      },
      "questionId": {
        "type": "string",
        "readOnly": true
      }
    }
  }
}
```
