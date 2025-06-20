---
title: Introduction
---

InputField wraps input, label and instructions/validation messages together.

## Features

- Wraps standard HTML inputs with labels, status, and validations.
- Handles various HTML input types, providing a consistent and user-friendly experience.
- Supports custom components like select & rating adding versatility to the component.
- Developers can add their custom input components also
- Offers validation support for inputs, including password input type.

By using the InputField component, you can seamlessly integrate these input types into your Svelte application without worrying about complex implementation details.

## Properties

- _name_ : Name used for the input element
- _value_ : Current value of the input
- _label_ : Label for the input
- _description_ : A description that is used as aria-label, label is used if description is empty
- _icon_ : Optional icon used for presentation
- _type_ : The component type to be used, defaults to text
- _required_ : Identifies whether the input is required
- _status_ : Current validation status, can be 'pass', 'fail', or 'warn'
- _disabled_ : Whether the input is disabled or not
- _message_ : The validation message
- _using_ : A set of custom inputs to be rendered using input field
- _nolabel_ : Optionally hide the label, using it for aria-label instead
- _using_ : An object containing components to be used for input, all html inputs and rokkit input components are included by default.
- _class_ : Set custom class for style overrides

## Support for Custom Components

## Validations using Password Input Type

The InputField component supports validation for inputs, with a special focus on password input types. It allows you to define validation rules for passwords, ensuring they meet specific security requirements.

Example:

```html
<InputField type="password" validations="{passwordValidations}" />
```

By providing a `validations` prop with an array of password validation rules, you can ensure that users follow secure password practices, such as minimum length, special characters, and uppercase letters.

Please note that the example above showcases password validations, but you can use similar validation techniques for other input types as well.

---

With the InputField component, you can create robust and user-friendly input forms in your Svelte applications. Its flexibility, support for various input types, and validation capabilities make it a powerful tool for enhancing the user experience. Use the provided examples and guidelines to incorporate the InputField component seamlessly into your projects.
