---
title: Object Array
---

## {title}

Here's another example which uses an array of objects.

List expects `text` attribute on each item. Optionally an `image` or `icon` attributes can be provided for each item.

In this example, the value attribute has been included. Click on any item in the list to see the data of the selected item.

## Properties

- _items_ : Supply the data for the list.
- _value_ : Current selected value of the list
- _fields_ : Adapt to your data by providing a custom field mapping.

## Snippets

- _header_: Add a custom header, say a search box to the list
- _footer_: Add a custom footer, say a toolbar to the list
- _empty_: Provide custom empty state message
- _stub_: Provide the default template for the list item

## Events

- _select_: Triggered when an item is selected.
- _move_: Triggered when the current item changes (example navigating)
