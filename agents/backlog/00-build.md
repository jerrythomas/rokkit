# build warnings

I see messages like below during build on the sites packages. 

`The attribute 'aria-multiselectable' is not supported by the role 'navigation'. This role is implicit on the element `<nav>`
https://svelte.dev/e/a11y_role_supports_aria_props_implicit
`

`List.svelte:355:3 The attribute 'aria-selected' is not supported by the role 'button'. This role is implicit on the element `<button>`
https://svelte.dev/e/a11y_role_supports_aria_props_implicit
`

`[vite-plugin-svelte] src/routes/components/palette-manager/+page.svelte:171:4 A form label must be associated with a control
https://svelte.dev/e/a11y_label_has_associated_control`

We need fix these and clean up the codebase.

refer the icons we have (ex) the getting started, styling. and create similar icons in /Users/Jerry/Developer/rokkit/solution/packages/icons/src/components
we can copy over the icons from solar into components .

- introduction page Second item in why rokkit says "composable" is this the correct word or should it be customizable. ?
- 
- lets include a fieldMapping `title` or `tooltip` prop to be used for tooltips.
- lets change fieldmapping `description` field to `subtitle` or `tagline`
- remove `component` prop from fieldmapping
- proxy.get('avatar') won't work because get works using fieldMapping and avatar is not a listed field, unless fields has `avatar`. This would be a custom fieldMapping
- Swap the order of github link and the themeswitcher.
- Add icon for code component.
- item is deprecated.
- We need to document icon sets provided by rokkit. we could show a gallery with all icon collections with icons and their names.
- Predefined palettes available and how to create a custom palette, and a theme editor helps build one using color picker, shades generator. option to see the generated code for the palette and download.
- A form builder would be nice to have.
- Top menu, docs|builder? builders for theme, forms,
