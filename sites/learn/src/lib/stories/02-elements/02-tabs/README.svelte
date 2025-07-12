<script>
  import StoryRoot from '$lib/components/Story/StoryRoot.svelte'
</script>

<svelte:head>
  <title>Tabs Component Tutorial | Learn Rokkit</title>
</svelte:head>

# Tabs Component

The Tabs component is a highly extensible and versatile UI element that simplifies navigation within your application. Like other Rokkit components, Tabs shares similar features such as the ability to define custom items, map fields, and provide custom components through the `using` property.

This allows for seamless integration and customization to match your application's theme and requirements. With the Tabs component, you can effortlessly create interactive and dynamic navigation experiences, while maintaining the flexibility to extend the component's functionality as needed.

## Overview

The Tabs component is designed with a horizontal layout, making it more suitable for a limited number of tabs. Including an excessive number of tabs may lead to a scrollable interface, which could negatively impact user-friendliness. Therefore, it's advisable to keep the number of tabs to a minimum for an optimal user experience.

Some of the notable features of this component are:

- Get started with a simple string array
- Attributes like text, icon/images or URLs can be mapped to attributes in the data
- Default item components like Text & Link are available, however, custom components can also be used
- It is also possible to configure a different component to be used for different items based on an attribute in the data

## Interactive Demo

<StoryRoot 
  slug="elements/tabs" 
  title="Basic Tabs Usage" 
  description="Learn how to use the Tabs component with different data structures and configurations"
/>

## Tutorials

### 1. Introduction
Get started with basic tabs using a simple string array.

### 2. Orientation
Learn how to control tab positioning and alignment with the `below` and `align` properties.

### 3. Custom Data
Use arrays of objects with the Tabs component, utilizing the built-in Text component for rendering.

### 4. Field Mapping
Adapt the Tabs component to your data structure using the `fields` property for flexible attribute mapping.

### 5. Custom Components
Implement custom components with the `using` property for advanced tab functionality and styling.

## Best Practices

- Keep the number of tabs to a minimum for optimal user experience
- Use descriptive tab labels that clearly indicate content
- Consider using icons or images to enhance visual appeal
- Ensure proper keyboard navigation support
- Test with different screen sizes to ensure responsive behavior

## Component Properties

- **options**: Supply the data for the tabs (array of strings or objects)
- **value**: Current selected value of the tabs (bindable)
- **fields**: Adapt to your data by customizing field mappings
- **using**: Object containing components to be used for displaying data
- **below**: Position tabs below content (default: false)
- **align**: Tab alignment - 'left', 'center', or 'right' (default: 'left')
- **class**: Set custom class for style overrides