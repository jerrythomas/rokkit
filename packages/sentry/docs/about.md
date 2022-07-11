# Sentry

There are four routes associated with authentication. This includes two pages and two endpoints. The default configuration has been outlined below.

Pages:

- /auth : UI for authentication
- /auth/logout: UI for logging out

Endpoints:

- /auth/signin: endpoint used as action for the auth forms. This performs the actual sign in.
- /auth/session: endpoint to update the session when logging in or out

## Configuration

The example uses default routes. This can be overridden by specifying configuring the following auth attributes.

```javascript
{
  auth: {
    login: '/auth',
    logout: '/auth/logout'
    session: '/auth/session',
    authenticate: '/auth/sign-in'
  }
}

```

Any attribute not provided will use the defaults.

## Rules

The following rules are applied for route handling.

- All routes are restricted by default unless specified in the public routes
- Auth routes are public by default except for the logout route which is restricted by default
- / is a special route and does not include sub paths
- For all other routes, sub paths are automatically included
- A private or restricted route under an allowed route is not currently supported
- logout route is only allowed after authentication
- All restricted routes will be rerouted to the the home route if authenticated and to the login route otherwise

## Adapters

Different auth libraries implement auth functions in different ways. Sentry provides a wrapper over the auth functions including route protections.

- Sentry can be used with supabase client as is
- A firebase adapter mimicks the supabase approach

## Todo

- Test a few social auths on supabase
- Test magic link on firebase
- Fix the todo flows on firebase/supabase example
- Fix sample UI
- Fix error messages (rate limit on supabase)

## Following work

- Supabase
  - Magic Link
- Firebase
  - Google
  - Microsoft
