---
title: Introduction
---

## {title}

An accordion consists of multiple sections, each section contains a heading and content.
Users can click on the headings to expand or collapse a section revealing the content within.

Some of the notable features of this component are:

- It provides a set of sane defaults and you can get started with a nested object array
- Attributes like text, icon, image or url can be mapped to attributes in the data
- Default item components like Text & Link are available. However, custom components can also be used
- It is also possible to configure a different component to be used for different items based on an
  attribute in the data.

## Properties

- _items_ : Supply the data for the accordion
- _fields_ : Adapt to your data by customising the fields
- _using_ : An object containing components to be used for displaying data. Uses the Text component by default.
- _value_ : Current selected value of the accordion
- _class_ : Set custom class for style overrides
- _autoClose_ : Enable of disable automatic closing of previous open section. Defaults to false
