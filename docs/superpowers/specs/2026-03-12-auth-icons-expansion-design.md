# Auth Icon Set Expansion — Design Spec

**Date:** 2026-03-12
**Status:** Approved

## Overview

Expand `@rokkit/icons` auth set from 13 flat icons to a comprehensive auth icon collection covering auth platforms, social providers, and auth methods — with brand variants and Solar-style design variants.

## Naming Convention

Flat hyphenated filenames in `src/auth/`. No build system changes required.

### Brand icon variants
```
{name}                    # default (color)
{name}-white              # white mono
{name}-black              # black mono
{name}-wordmark           # wordmark, dark (where brand publishes one)
{name}-wordmark-white     # wordmark, white
{name}-logo               # symbol + wordmark, color (where available)
{name}-logo-white
{name}-logo-black
```

### Auth method variants (Solar-style)
Solar icon set has 4 variants per icon:
```
{name}                    # solid (filled, default)
{name}-outline            # linear/outline stroked
{name}-duotone            # duotone solid (two-tone fill)
{name}-duotone-outline    # duotone outline (stroked two-tone)
```

## Icon Sizing

- **Symbol/icon:** 24×24 viewBox
- **Wordmark / logo (symbol+wordmark):** height=24, width proportional (aspect ratio preserved)

## Full Icon Set

### Auth Platforms
Icons with published wordmarks get full variants; others get color/white/black only.

| Name | Variants | Source |
|------|----------|--------|
| `supabase` | color, white, black, wordmark, wordmark-white | simpleicons / official |
| `firebase` | color, white, black | New 2024 brand — official Firebase kit |
| `convex` | color, white, black + logo, logo-white, logo-black + wordmark, wordmark-white | `/Users/Jerry/Downloads/Logos/SVG/` |
| `auth0` | color, white, black, wordmark, wordmark-white | Official Auth0 brand kit |
| `amplify` | color, white, black, wordmark | AWS Amplify brand |
| `cognito` | color, white, black | AWS Cognito |
| `clerk` | color, white, black, wordmark, wordmark-white | clerk.com brand kit |
| `okta` | color, white, black, wordmark | okta.com brand |
| `keycloak` | color, white, black | keycloak.org |
| `nextauth` | color, white, black, wordmark | authjs.dev |
| `pocketbase` | color, white, black, wordmark | pocketbase.io |
| `appwrite` | color, white, black, wordmark, wordmark-white | appwrite.io brand kit |
| `azure` | color, white, black | Already present — keep |
| `microsoft` | color, white, black | Already present — keep |

### Social Auth Providers
| Name | Variants | Notes |
|------|----------|-------|
| `google` | color, white, black | Already present |
| `github` | color, white, black | Already present |
| `apple` | color, white, black | Already present |
| `twitter` | color, white, black | Already present (Twitter/X) |
| `facebook` | color, white, black | New — add |
| `microsoft` | color, white, black | Shared with platforms |

### Auth Methods (Solar-style 4 variants each)
| Name | Notes |
|------|-------|
| `email` | Already present — add Solar variants |
| `phone` | Already present — add Solar variants |
| `password` | Already present — add Solar variants |
| `magic` | Already present — add Solar variants |
| `incognito` | New — hat + glasses anonymous figure |
| `authy` | Already present — 2FA app brand icon (brand only, no Solar variants) |
| `passkey` | New — fingerprint or hardware key visual |
| `mfa` | New — shield + check or multi-device visual |

## SVG Sourcing Strategy

1. **Convex** — use provided files from `/Users/Jerry/Downloads/Logos/SVG/`
2. **Simple Icons** (`simpleicons.org`) — fetch SVGs for: github, google, apple, twitter, facebook, supabase, firebase, auth0, amplify, cognito, clerk, okta, keycloak, appwrite, pocketbase, nextauth, microsoft, azure
3. **Official brand kits** — for wordmarks not in Simple Icons: clerk, auth0, appwrite, pocketbase, supabase
4. **Firebase** — fetch new 2024 brand from Firebase brand guidelines
5. **Solar-style auth method icons** — source from Solar icon set (available via iconify: `solar:*`) or draw custom SVGs matching Solar aesthetic for: email, phone, password, magic, incognito, passkey, mfa

## File Structure After Implementation

```
src/auth/
  # Auth platforms
  supabase.svg, supabase-white.svg, supabase-black.svg, supabase-wordmark.svg, ...
  firebase.svg, firebase-white.svg, firebase-black.svg
  convex.svg, convex-white.svg, convex-black.svg
  convex-logo.svg, convex-logo-white.svg, convex-logo-black.svg
  convex-wordmark.svg, convex-wordmark-white.svg
  auth0.svg, auth0-white.svg, auth0-black.svg, auth0-wordmark.svg, ...
  # ... (all platforms)

  # Social
  google.svg, google-white.svg, google-black.svg
  github.svg, github-white.svg, github-black.svg
  facebook.svg, facebook-white.svg, facebook-black.svg
  # ...

  # Auth methods (Solar-style)
  email.svg, email-outline.svg, email-duotone.svg, email-duotone-outline.svg
  phone.svg, phone-outline.svg, phone-duotone.svg, phone-duotone-outline.svg
  password.svg, password-outline.svg, password-duotone.svg, password-duotone-outline.svg
  magic.svg, magic-outline.svg, magic-duotone.svg, magic-duotone-outline.svg
  incognito.svg, incognito-outline.svg, incognito-duotone.svg, incognito-duotone-outline.svg
  passkey.svg, passkey-outline.svg, passkey-duotone.svg, passkey-duotone-outline.svg
  mfa.svg, mfa-outline.svg, mfa-duotone.svg, mfa-duotone-outline.svg
  authy.svg
```

## Build System

No changes required. Existing `src/config.json` already marks `auth` bundle as `color: true`. The `bundleFolders` CLI reads all SVGs from `src/auth/` and exports to `lib/auth.json`.

## Out of Scope

- No changes to other icon bundles (base, solid, light, twotone)
- No new exports in `package.json` (auth stays as single `./auth.json` export)
- No split into sub-bundles by category
