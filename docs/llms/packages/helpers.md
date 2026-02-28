# @rokkit/helpers

> Testing utilities: vitest matchers, mocks, and event simulators for Svelte and DOM testing.

## Position in Dependency Hierarchy
**Depends on**: @vitest/expect, ramda
**Depended on by**: test suites across @rokkit packages

## Exports

### Custom Vitest Matchers

| Export | Signature | Description |
|--------|-----------|-------------|
| `toIncludeAll(received, expected)` | Verify array includes all expected values |
| `toUseHandlersFor(action, options, events)` | Verify action registers and cleans up event handlers |
| `toOnlyTrigger(handler, events)` | Verify only specified events are triggered |
| `toHaveValidData(received, expected)` | Verify element.dataset matches expected |
| `toHaveBeenDispatchedWith(spy, data)` | Verify custom event detail payload |

### Simulators

| Export | Signature | Description |
|--------|-----------|-------------|
| `simulateMouseEvent(x, y)` | Creates mock mouse event |
| `simulateTouchEvent(clientX, clientY)` | Creates mock touch event |
| `simulateTouchSwipe(node, distance, delay?)` | Simulates touch swipe on DOM node |
| `simulateMouseSwipe(node, distance, delay?)` | Simulates mouse swipe |

### Mocks

| Export | Description |
|--------|-------------|
| `matchMediaMock` | Mocks window.matchMedia |
| `updateMedia` | Updates media query match status |
| `elementsWithSize(n, size)` | Creates n elements with uniform size |
| `mixedSizeElements()` | Creates elements with mixed sizes |
| `getMockNode(events)` | Creates mock DOM node with event tracking |
| `createNestedElement(data)` | Creates nested HTML structure from data |
| `mockFormRequestSubmit()` | Mocks HTMLFormElement.requestSubmit (JSDOM) |

### Components

| Export | Description |
|--------|-------------|
| `MockItem` | Test helper component for mock data rendering |
| `StaticContent` | Test helper for static content snapshots |

## Key Patterns

### Extending Vitest

```javascript
import { toIncludeAll, toUseHandlersFor } from '@rokkit/helpers/matchers'
expect.extend({ toIncludeAll, toUseHandlersFor })
expect([1, 2, 3]).toIncludeAll([2, 3])
```

### Swipe Testing

```javascript
import { simulateTouchSwipe } from '@rokkit/helpers/simulators'
simulateTouchSwipe(element, { x: 100, y: 0 }, 300)
```

### Mock DOM Node

```javascript
import { getMockNode } from '@rokkit/helpers/mocks'
const { node, listeners } = getMockNode(['click', 'focus'])
myAction(node, {})  // Test action lifecycle
```
