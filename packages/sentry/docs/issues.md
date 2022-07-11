# Issues

## Cookie

Running the `dev` and `preview` scripts were showing errors due to the default import of cookie CJS library. The code from teh cookie library has been added to sentry after converting it into ESM.

## Infinite Refresh

Running the final app using `node` (see script `start`) causes the root page to continuously refresh itself after auth.

https://github.com/supabase/gotrue-js/issues/46
