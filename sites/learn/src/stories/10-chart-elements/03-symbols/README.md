---
title: Symbols
---

# {title}

Symbols are graphical representations used in charts to convey data points, categories, or other information visually. They provide a way to represent data in a concise and easily understandable manner. In charting, symbols can take various forms such as circles, squares, triangles, or custom shapes, and they can be customized with attributes like size, fill color, and stroke color to enhance their visual appeal and convey additional information.

## Symbol Component

The Symbol component is a versatile tool used in charting libraries to generate and render symbols at specified coordinates on a chart. It supports creating multiple shapes by providing the following attributes:

- **x**: The x-coordinate of the symbol's position on the chart.
- **y**: The y-coordinate of the symbol's position on the chart.
- **name**: Specifies the name of the symbol, such as "circle", "square", "triangle", etc.
- **size** (optional): Determines the size of the symbol. If not specified, a default size is used.
- **fill** (optional): Specifies the fill color of the symbol. If not provided, the symbol may be rendered with a default fill color or left unfilled.
- **stroke** (optional): Specifies the stroke color or border color of the symbol. If not provided, the symbol may be rendered without a border.

## Example

```svelte
<Symbol x={10} y={20} name="circle" />
```

In this example, the Symbol component is used to render a circle symbol at coordinates (10, 20) on the chart. The circle symbol is created with default or predefined attributes such as size, fill color, and stroke color. However, these attributes can be customized based on the specific requirements of the chart or visualization.

The sample displays all shapes available in the library.

## Customization

Developers can also add their custom symbols to the symbol library and use them in their charts. This allows for greater flexibility and creativity in visualizing data.
