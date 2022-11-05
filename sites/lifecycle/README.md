# Svelte-Kit Lifecycle

This is an experimental svelte-kit repo used to understand the lifecycle of a `svelte-kit` route.

Below is the sequence in which some of the functions are called when the '/' route is accessed by the user.

On Server:

- handle method in "hooks.server.js"
- load method in "/layout.server.js"
- load method in "/page.js"
- load method in "/layout.js"
- script block in "/layout.svelte"
- script block in "/page.svelte"

On Browser:

- load method in "/layout.js"
- load method in "/page.js"
- script block in "/layout.svelte"
- script block in "/page.svelte"
