# UploadProgress Redesign — Design

**Date:** 2026-03-02
**Status:** Approved

## Summary

Redesign UploadProgress to compose with existing List/Grid components and follow the established snippet/proxy/state-icons patterns. Extract a new `UploadFileStatus` sub-component for single-file rendering. Replace hardcoded status-value assumptions with configurable status-to-action mapping. Status values are machine-readable keys; display text comes from the `labels` prop (merged with `messages` store).

## Components

### UploadFileStatus

Renders a single file's status and action buttons. Receives a `ProxyItem` from the parent layout component.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `proxy` | `ProxyItem` | required | File data via field mapping |
| `cancelWhen` | `string[]` | `[]` | Status keys that enable cancel |
| `retryWhen` | `string[]` | `[]` | Status keys that enable retry |
| `removeWhen` | `string[]` | `[]` | Status keys that enable remove |
| `oncancel` | `(proxy) => void` | — | Cancel callback |
| `onretry` | `(proxy) => void` | — | Retry callback |
| `onremove` | `(proxy) => void` | — | Remove callback |
| `labels` | `Record<string, string>` | `{}` | Status key → display text mapping |
| `icons` | `UploadActionIcons` | `DEFAULT_STATE_ICONS.action.*` | Icon overrides |

**Default rendering:**

1. File icon — inferred from MIME type via `inferIcon(proxy.get('type'))`, or explicit via `proxy.get('icon')`
2. File name — `proxy.label`
3. File size — `formatSize(proxy.get('size'))`
4. Status text — `labels[statusKey]` if mapped, otherwise raw key as-is
5. Progress bar — shown when `0 < progress < 100`, driven by `proxy.get('progress')`
6. Action buttons — rendered when the file's status is in the corresponding `*When` array AND `on*` callback is provided. Icons from `DEFAULT_STATE_ICONS.action.cancel`, `.retry`, `.remove`

**Data attributes:**

- `data-upload-file-status` — root
- `data-upload-file-icon` — file type icon
- `data-upload-status` — status text badge
- `data-upload-bar` — progress bar track
- `data-upload-fill` — progress bar fill
- `data-upload-actions` — action buttons wrapper
- `data-upload-cancel` — cancel button
- `data-upload-retry` — retry button
- `data-upload-remove` — remove button

### UploadProgress

Thin orchestrator: header + layout delegation to List or Grid.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `files` | `unknown[]` | `[]` | File data items |
| `fields` | `Record<string, string>` | `{}` | Field mapping for ProxyItem |
| `view` | `'list' \| 'grid'` | `'list'` | Layout mode |
| `cancelWhen` | `string[]` | `[]` | Status keys that show cancel button |
| `retryWhen` | `string[]` | `[]` | Status keys that show retry button |
| `removeWhen` | `string[]` | `[]` | Status keys that show remove button |
| `oncancel` | `(file) => void` | — | Cancel callback (receives raw item) |
| `onretry` | `(file) => void` | — | Retry callback (receives raw item) |
| `onremove` | `(file) => void` | — | Remove callback (receives raw item) |
| `onclear` | `() => void` | — | Clear all callback; controls clear button visibility |
| `labels` | `Record<string, string>` | `{}` | Merged with `messages.current.uploadProgress`. Known keys are structural (`label`, `clear`, `cancel`, `retry`, `remove`). Other keys are status display labels. |
| `class` | `string` | `''` | CSS class on root |
| `...snippets` | — | — | Snippet overrides (`itemContent`, named) |

**Internal structure:**

```svelte
<div data-upload-progress data-upload-view={view}>
  <!-- Header: file count + status summary + clear-all button -->
  <div data-upload-header>
    <span>{files.length} files — {statusSummary}</span>
    {#if onclear}
      <button data-upload-clear onclick={onclear}>Clear all</button>
    {/if}
  </div>

  <!-- Layout delegation -->
  {#if view === 'grid'}
    <Grid items={files} fields={mergedFields} ...>
      default itemContent → <UploadFileStatus {proxy} ... />
      consumer itemContent snippet overrides if provided
    </Grid>
  {:else}
    <List items={files} fields={mergedFields} ...>
      default itemContent → <UploadFileStatus {proxy} ... />
      consumer itemContent snippet overrides if provided
    </List>
  {/if}
</div>
```

**Status summary:** Groups by status key, displays counts using `labels[key]` when available, raw key otherwise. E.g. `"1 uploading, 1 extracting, 1 queued"`.

**Snippet forwarding:** Consumer `itemContent` snippet passed through to the inner List/Grid. When not provided, the default renders `<UploadFileStatus>`.

## New State Icons

Add to `DEFAULT_ICONS` array in `packages/core/src/constants.js`:

- `action-cancel` — new (e.g. × icon)
- `action-retry` — new (e.g. rotate-cw icon)
- `action-remove` — already exists

Add corresponding SVGs to `packages/icons/src/base/`:

- `action-cancel.svg`
- `action-retry.svg`

## What Changes From Current Implementation

### Removed
- Hardcoded status-value logic (`uploading`/`done`/`error` controlling button visibility and progress bar)
- HTML entity icons (`&#x2715;`, `&#x21bb;`)
- Duplicated list/grid rendering templates
- Custom rendering loop (replaced by List/Grid composition)

### Added
- `UploadFileStatus` sub-component
- Composition with existing `List` and `Grid` components
- `cancelWhen`, `retryWhen`, `removeWhen` status-to-action mapping arrays
- `labels` prop following established pattern (merged with `messages.current.uploadProgress`)
- Semantic state icons via `DEFAULT_STATE_ICONS.action.*`
- Progress bar driven purely by numeric `progress` field (shown when `0 < progress < 100`)

### Unchanged
- `UploadTarget` component (unaffected)
- `upload-utils.js` (inferIcon, formatSize, etc.)
- Header with file count + status summary + clear-all
- Field mapping via `fields` prop
- Data-attribute theming hooks (names preserved where possible)

## Labels & i18n

Status values are machine-readable keys (e.g. `'uploading'`, `'failed'`). Display text comes from the `labels` prop merged with `messages.current.uploadProgress`.

```js
// messages store defaults
messages.current.uploadProgress = {
  label: 'Upload progress',    // aria-label
  clear: 'Clear all',          // clear button text
  cancel: 'Cancel',            // cancel button aria-label
  retry: 'Retry',              // retry button aria-label
  remove: 'Remove',            // remove button aria-label
}
```

Consumer adds status display labels via `labels` prop:
```svelte
<UploadProgress
  labels={{
    uploading: 'Uploading…',
    done: 'Complete',
    failed: 'Failed'
  }}
/>
```

Known keys (`label`, `clear`, `cancel`, `retry`, `remove`) are structural. Any other key is a status display label — if `labels[statusKey]` exists, show it; otherwise show the raw key.

## Strategos Consumption Example

```svelte
<UploadProgress
  files={activeUploads}
  fields={{ label: 'filename', status: 'stage', type: 'mimeType', size: 'size' }}
  cancelWhen={['uploading', 'queued', 'extracting', 'chunking', 'embedding']}
  retryWhen={['failed']}
  labels={{
    queued: 'Queued',
    uploading: 'Uploading…',
    extracting: 'Extracting text…',
    chunking: 'Chunking…',
    embedding: 'Embedding…',
    failed: 'Failed'
  }}
  oncancel={(file) => cancelItem(file.id)}
  onretry={(file) => retryItem(file)}
/>
```

Or with a custom snippet for full control:
```svelte
<UploadProgress
  files={activeUploads}
  fields={{ label: 'filename', status: 'stage', type: 'mimeType', size: 'size' }}
  cancelWhen={['uploading', 'queued', 'extracting', 'chunking', 'embedding']}
  retryWhen={['failed']}
  oncancel={(file) => cancelItem(file.id)}
  onretry={(file) => retryItem(file)}
>
  {#snippet itemContent(proxy)}
    {@const stage = proxy.get('status')}
    <span class={inferIcon(proxy.get('type'))}></span>
    <span>{proxy.label}</span>
    <span>{STAGE_LABELS[stage]}</span>
  {/snippet}
</UploadProgress>
```

## Complexity

Small-Medium — mostly restructuring existing code into composition pattern.
