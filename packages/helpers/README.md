# @rokkit/helpers

Test utilities for Rokkit — custom Vitest matchers, DOM mocks, and touch/mouse event simulators.

## Install

```bash
bun add -D @rokkit/helpers
# or
npm install --save-dev @rokkit/helpers
```

This package is for testing only. Add it to `devDependencies`.

## Overview

`@rokkit/helpers` provides four subpath imports:

| Import                       | Contents                                                        |
| ---------------------------- | --------------------------------------------------------------- |
| `@rokkit/helpers/matchers`   | Custom Vitest matchers for dataset, actions, events, and arrays |
| `@rokkit/helpers/mocks`      | DOM mocks auto-installed into the global scope for jsdom        |
| `@rokkit/helpers/simulators` | Touch and mouse event simulators                                |
| `@rokkit/helpers/components` | Minimal Svelte test components                                  |

## Setup

Register the mocks and matchers in a Vitest setup file:

```js
// vitest.config.js
import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte({ hot: false })],
  test: {
    environment: 'jsdom',
    setupFiles: ['./test-setup.js']
  }
})
```

```js
// test-setup.js
import { expect } from 'vitest'
import { matchers } from '@rokkit/helpers/matchers'
import '@rokkit/helpers/mocks' // installs ResizeObserver, IntersectionObserver, etc.

expect.extend(matchers)
```

## Usage

### Custom matchers

```js
import { render } from '@testing-library/svelte'
import MyComponent from './MyComponent.svelte'

test('renders with correct data attribute', async () => {
  const { getByRole } = render(MyComponent, { props: { value: 'active' } })
  const el = getByRole('listitem')

  // Assert a single data-* attribute
  expect(el).toHaveDataset('value', 'active')

  // Assert all data attributes at once
  expect(el).toHaveValidData({ value: 'active', index: '0' })
})
```

```js
import { toHaveAction } from '@rokkit/helpers/matchers'

test('action is applied to element', () => {
  // toHaveAction checks that a Svelte action registered its event listeners
  expect(el).toHaveAction('navigate')
})
```

### DOM mocks

Importing `@rokkit/helpers/mocks` installs the following globals automatically:

- `ResizeObserver` — records observed elements; no-op callbacks
- `IntersectionObserver` — records observed elements; no-op callbacks
- `requestAnimationFrame` / `cancelAnimationFrame` — synchronous shims
- `matchMedia` — returns a configurable mock

```js
import { setMatchMedia } from '@rokkit/helpers/mocks'

test('responds to dark mode', () => {
  setMatchMedia({ matches: true })
  // ... render component and assert
})
```

### Event simulators

```js
import { simulateTouchSwipe, simulateMouseSwipe } from '@rokkit/helpers/simulators'

test('swipe left triggers dismiss', async () => {
  const el = document.querySelector('.card')

  // simulateTouchSwipe(element, distancePx, delayMs)
  await simulateTouchSwipe(el, -150, 50)

  expect(el).not.toBeInTheDocument()
})
```

```js
import { simulateTouchEvent, simulateMouseEvent } from '@rokkit/helpers/simulators'

// Low-level control
simulateTouchEvent(el, 0, 0, 'touchstart')
simulateTouchEvent(el, 80, 0, 'touchmove')
simulateTouchEvent(el, 80, 0, 'touchend')
```

## API

### `@rokkit/helpers/matchers`

| Matcher                      | Description                                         |
| ---------------------------- | --------------------------------------------------- |
| `toHaveDataset(key, value)`  | Assert a single `data-*` attribute                  |
| `toHaveValidData(object)`    | Assert all dataset attributes match an object       |
| `toHaveAction(actionName)`   | Assert a Svelte action registered its listeners     |
| `toDispatchEvent(eventName)` | Assert a custom DOM event was dispatched            |
| `toBeArrayOf(type)`          | Assert every element in an array is of a given type |

### `@rokkit/helpers/mocks`

| Export                          | Description                                             |
| ------------------------------- | ------------------------------------------------------- |
| `ResizeObserver`                | ResizeObserver mock (auto-installed globally on import) |
| `IntersectionObserver`          | IntersectionObserver mock (auto-installed globally)     |
| `setMatchMedia(options)`        | Configure the matchMedia mock                           |
| `elementsWithSize(count, size)` | Create element stubs with a fixed `offsetHeight`        |

### `@rokkit/helpers/simulators`

| Export                                    | Description                                     |
| ----------------------------------------- | ----------------------------------------------- |
| `simulateTouchEvent(el, x, y, type)`      | Fire a single touch event                       |
| `simulateMouseEvent(el, x, y, type)`      | Fire a single mouse event                       |
| `simulateTouchSwipe(el, distance, delay)` | Fire touchstart → touchmove → touchend sequence |
| `simulateMouseSwipe(el, distance, delay)` | Fire mousedown → mousemove → mouseup sequence   |

## Peer Dependencies

- `vitest` >= 2.0

---

Part of [Rokkit](https://github.com/jerrythomas/rokkit) — a Svelte 5 component library and design system.
