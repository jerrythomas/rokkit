# Rokkit Stories

This package contains the code for the documentation site for Rokkit. The website is automatically published to [Vercel](https://vercel.com) on push/merge into the main branch. Visit the documentation at [rokkit.vercel.app](https://rokkit.vercel.app)

## Structure

All of the content for the instructions for each component, action, and utility is located in the subdi metarectory "lib/stories."

A story consists of the following components:

- A metadata.js file containing metadata about the component
- One or more subfolders with content for the component.
- Each subfolder
  - uses a sequence number to indicate the order in which they should be displayed.
  - contains a `guide.svx` containing the notes on the component.
  - includes an `App.svelte` with code for previewing the component
  - Additional supporting code files `*.svelte` or `*.js` may be included.
