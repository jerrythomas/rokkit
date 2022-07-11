# Sentry

![GitHub Workflow Status](https://img.shields.io/github/workflow/status/jerrythomas/sentry/Release)
[![Test Coverage](https://api.codeclimate.com/v1/badges/081db4df4bb805fb0e87/test_coverage)](https://codeclimate.com/github/jerrythomas/sentry/test_coverage)
![GitHub last commit](https://img.shields.io/github/last-commit/jerrythomas/sentry)
![NPM](https://img.shields.io/npm/l/@jerrythomas/sentry)

Drop in authentication including route protection and redirects for SvelteKit apps.

![sentry](src/sentry.svg)

## Why?

Adding authentication to front end is one of the most time consuming tasks. Building apps in Svelte is great but there is no standard way to implement authentication. There are multiple libraries that allow us to add authentication for multiple providers. However, switching from one to another is not easy. The UI components for all the providers also need to meet the provider guidelines for the final app to be approved.

This is an attempt to make adding authentication to SvelteKit apps as simple as possible. This framework has been designed for Svelte.

## Features

- [x] Configuration driven
- [x] Secrets using environment variables
- [x] Unit tests
- [x] Route protection
  - [x] Public pages
  - [x] Protected routes
  - [x] Role based protection for route
  - [ ] Caching blocked routes to be redirected on login
- [ ] Different auth libraries
  - [x] Supabase
  - [x] Firebase
  - [ ] Auth0
  - [ ] Amplify
- [ ] Multiple providers
  - [x] Magic Link
  - [x] Google
  - [x] Microsoft
  - [ ] Github
  - [ ] Twitter
  - [ ] Facebook
- [ ] Examples with protected routes and data operations
  - [ ] Supabase
  - [ ] Firebase
- [ ] Emulator tests where available

## Getting started

Get started quickly using [degit](https://github.com/Rich-Harris/degit). Select the library you want to use and run degit to get a sample app.

- [x] [Supabase](examples/supabase)

```bash
degit jerrythomas/sentry/examples/supabase my-app
```

- [x] [Firebase](examples/firebase)
- [ ] [Auth0](examples/auth0)
- [ ] [Amplify](examples/amplify)

Take a look at the following files/folders in the sample to understand how it works.

- config
- hooks.js
- login/index.svelte
- logout.svelte
- data
- todos
- auth

### WindiCSS

This library uses WindiCSS and the components will not render properly if the required classes are not included in the final bundle. Ensure that the sentry library is included in the extract configuration of `windi.config.js`

```js
extract: {
  include: [
    './src/**/*.{html,js,svelte,ts}',
    'node_modules/@jerrythomas/sentry/src/**/*.{html,js,svelte,ts,css}}'
  ]
}
```

## Route Configuration

Routes are configurable as shown in the example `config/routes.js` file. Sentry assumes that all routes are private by default. Public routes need to be listed so that they can be accessed without logging in.

## Components

This library consists of the following components.

- UI component with buttons for different OAuth providers
- Utility functions for various stages of auth lifecycle
- Store for managing the user session
- Route protection for pages & endpoints
- Logged in session details available in load function

## References

Cookie parsing and serializing is required to support server side auth guard. The original npm library [jshttp/cookie](https://github.com/jshttp/cookie) ran into problems on SvelteKit v1.0.0-next.218. The code has been converted from CJS to ESM.

## License

MIT © [Jerry Thomas](https://jerrythomas.name)
