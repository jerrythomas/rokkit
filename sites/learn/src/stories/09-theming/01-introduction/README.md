---
title: Introduction
---

The Rokkit library provides a versatile palette containing various shades of the following colors:

- Neutral
- Primary
- Secondary
- Accent
- Success
- Warning
- Danger
- Info

Each color in the palette has shades ranging from 50 to 950, allowing users to customize the appearance of their applications with a wide range of color options.

The preview section shows the current palette with all the colors and their respective shades. Try clicking on the dark/light mode toggle to see how the palette looks in different modes.

## Usage

Users can apply colors from the Rokkit palette to different elements of their application using the following classes:

- `bg-{color}-shade` for background color
- `border-{color}-{shade}` for border color
- `text-{color}-{shade}` for text color

For example, to set a background color to the Primary color with shade 500, you would use the class `bg-primary-500`.

Additionally, users can use CSS variables to apply colors directly to elements. The format for CSS variables is `--{color}-{shade}`. For example, to set a custom background color using CSS variables, you would use `background-color: var(--primary-500);`.

## Customization

The Rokkit library allows users to customize the palette by calling the `themeRules(themename, mapping, colors)` function. This function accepts three parameters:

1. `themename`: Name of the theme to be customized.
2. `mapping`: A map that provides overrides for specific colors in the palette.
3. `colors`: An object containing standard defaults for all palette colors.

Users can override one or more colors in the palette by providing custom values in the `mapping` parameter. Additionally, users can customize all colors in the palette by providing a completely new set of color values in the `colors` parameter.

Example usage:

```javascript
// Customizing the palette
const mapping = {
  primary: 'norway', // Override Primary color with custom color
};
const colors = {
  norway: {
    DEFAULT: '#83A666',
    50: '#E1EADA',
    100: '#D7E2CE',
    200: '#C2D3B4',
    300: '#ADC49A',
    400: '#98B580',
    500: '#83A666',
    600: '#6F9054',
    700: '#5B7645',
    800: '#475C36',
    900: '#334227',
    950: '#29361F'
  },
  // Include other palette colors with custom values as needed
};
themeRules('custom', mapping, colors);
```

By using the `themeRules` function, users can tailor the Rokkit palette to suit the specific design requirements of their application. They can also utilize CSS variables for more granular control over color application.

You can include the call to the `themeRules` function in your `uno.config.js` in the rules section to apply the custom theme to your application.
