`getVariableMap(colors.orange)` generates the css variables below.

```json
{
    "--color-primary": "#60a5fa";
    "--color-primary-50": "#eff6ff";
    "--color-primary-100": "#dbeafe";
    "--color-primary-200": "#bfdbfe";
    "--color-primary-300": "#93c5fd";
    "--color-primary-400": "#60a5fa";
    "--color-primary-500": "#3b82f6";
    "--color-primary-600": "#2563eb";
    "--color-primary-700": "#1d4ed8";
    "--color-primary-800": "#1e40af";
    "--color-primary-900": "#1e3a8a";
    "--color-primary-950": "#172554";
}
```

and `getColorMap('primary')` generates the following object

```js
{
     "500": 'var(--color-primary-500)',
     "600": 'var(--color-primary-600)',
     "700": 'var(--color-primary-700)',
     "800": 'var(--color-primary-800)',
     "900": 'var(--color-primary-900)',
     "950": 'var(--color-primary-950)',
     /* other shades */
   }
```

Using `shorcuts` configuration in unocss.config.js I am able to change the colors using `bg-primary-500` styles.

Unocss config.

```js
;((shortcuts = [
  ['skin-orange', getVariableMap(colors.orange)],
  ['skin-green', getVariableMap(colors.green)]
]),
  (colors = {
    primary: getColorMap('primary')
  }))
```

The html and css are below.

```html
<section data-skin="orange">
  <div class="bg-primary-500 text-white p-4 rounded-md">This is an orange section.</div>
  <div class="bg-primary-500/20 text-white p-4 rounded-md">
    This is an orange section with opacity.
  </div>
</section>

<section data-skin="green">
  <div class="bg-primary-500 text-white p-4 rounded-md">This is an orange section.</div>
  <div class="bg-primary-500/20 text-white p-4 rounded-md">
    This is an orange section with opacity.
  </div>
</section>
```

```css
[data-skin='orange'] {
  @apply skin-orange;
}
[data-skin='green'] {
  @apply skin-green;
}
```

I am able to get the `bg-primary-500` style to work with the css variables as configured. However, the opacity one `bg-primary-500/20` is not working. Can you guide me on what changes I should make so that I can support the `/20` opacity style using css variable?

I needed to use the variables to switch the primary and secondary colors in the system, and I want to continue using the `bg-primary-500` or `bg-primary-500/20` css styles.

['theme-colors', theme.getPalette(mapping)],
['vibrant', theme.getPalette({ primary: 'blue', secondary: 'purple' })],

I was able to generate custom rules using the approach below
