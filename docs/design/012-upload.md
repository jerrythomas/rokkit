# Upload Components Design

> Design for UploadTarget, UploadProgress, and Grid components using the ProxyItem + Wrapper + Navigator stack.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  UploadTarget.svelte                                            │
│                                                                 │
│  Drop zone (dragover/dragleave/drop) + hidden <input type=file> │
│  Validates: accept (MIME match), maxSize (byte limit)           │
│  Fires: onfiles(File[]) or onerror({file, reason})              │
│                                                                 │
│  Snippet: content(dragging: boolean)                            │
│  Data attrs: data-upload-target, data-dragging, data-disabled   │
└─────────────────────────────────────────────────────────────────┘
          │ onfiles(File[])
          ▼
┌─────────────────────────────────────────────────────────────────┐
│  Consumer State                                                 │
│                                                                 │
│  let files = $state([...])   // arbitrary shape per file        │
│  Consumer owns: upload logic, status updates, progress tracking │
└─────────────────────────────────────────────────────────────────┘
          │ files (reactive array)
          ▼
┌─────────────────────────────────────────────────────────────────┐
│  UploadProgress.svelte                                          │
│                                                                 │
│  Header: file count summary + view Toggle + clear button        │
│                                                                 │
│  ┌─── view='list' ────┐ ┌── view='tree' ──┐ ┌── view='grid' ─┐│
│  │ List (internal)     │ │ Tree (internal)  │ │ Grid (new)     ││
│  │ Flat rows:          │ │ Path-grouped:    │ │ Responsive:    ││
│  │ icon name size      │ │ ▼ images/        │ │ ┌────┐ ┌────┐ ││
│  │ [████░░] status     │ │   ├ photo.jpg    │ │ │icon│ │icon│ ││
│  │ [actions]           │ │   └ banner.png   │ │ │name│ │name│ ││
│  └─────────────────────┘ └──────────────────┘ │ │prog│ │prog│ ││
│                                               │ └────┘ └────┘ ││
│  Field mapping: label, value, icon, status,   └───────────────┘│
│    progress, size, path, type, error                            │
│                                                                 │
│  Per-view snippets:                                             │
│    listItem(proxy), treeItem(proxy), treeGroup(proxy),          │
│    gridItem(proxy), headerContent(count, view)                  │
│                                                                 │
│  Actions: oncancel, onremove, onretry, onclear                  │
│  Data attrs: data-upload-progress, data-upload-view,            │
│    data-upload-file, data-upload-bar, data-upload-status        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component 1: UploadTarget

### Internal Structure

```svelte
<div
  data-upload-target
  data-disabled={disabled || undefined}
  data-dragging={dragging || undefined}
  role="button"
  tabindex="0"
  aria-label={labels.dropzone}
  aria-disabled={disabled}
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}
  onclick={() => inputRef.click()}
  class={klass}
>
  {#if content}
    {@render content(dragging)}
  {:else}
    <!-- Default: icon + text + browse button -->
    <span data-upload-icon class="i-lucide:upload"></span>
    <p>Drop files here or click to browse</p>
    <button data-upload-button disabled={disabled}>Browse</button>
  {/if}

  <input
    bind:this={inputRef}
    type="file"
    {accept}
    {multiple}
    {disabled}
    hidden
    onchange={handleInputChange}
  />
</div>
```

### Validation Logic

```js
function validateFile(file) {
  if (accept && !matchesAccept(file, accept)) {
    onerror?.({ file, reason: 'type' })
    return false
  }
  if (file.size > maxSize) {
    onerror?.({ file, reason: 'size' })
    return false
  }
  return true
}

function handleFiles(fileList) {
  const valid = [...fileList].filter(validateFile)
  if (valid.length) onfiles?.(valid)
}
```

`matchesAccept(file, accept)` checks against comma-separated MIME types and extensions:
- `image/*` → matches `file.type.startsWith('image/')`
- `.pdf` → matches `file.name.endsWith('.pdf')`
- `application/json` → exact match on `file.type`

---

## Component 2: Grid

### Architecture

Follows the same Wrapper + Navigator pattern as List and Toggle:

```
┌──────────────────────────────────────────┐
│  Grid.svelte                             │
│                                          │
│  wrapper = new Wrapper(items, fields)    │
│  use:navigator={{ wrapper, orientation:  │
│                   'horizontal' }}         │
│                                          │
│  CSS Grid:                               │
│  repeat(auto-fill, minmax(minSize, 1fr)) │
│                                          │
│  {#each wrapper.flatView as node}        │
│    <button data-grid-item data-path=...> │
│      {itemContent(proxy) or default}     │
│    </button>                             │
│  {/each}                                 │
└──────────────────────────────────────────┘
```

### Template

```svelte
<div
  data-grid
  data-grid-min-size={minSize}
  role="grid"
  use:navigator={{ wrapper, orientation: 'horizontal' }}
  style:--grid-min-size={minSize}
  style:--grid-gap={gap}
  class={klass}
>
  {#each wrapper.flatView as node (node.key)}
    {@const proxy = node.proxy}
    {@const sel = wrapper.isSelected(node.key)}
    <button
      data-grid-item
      data-path={node.key}
      data-active={sel || undefined}
      data-disabled={proxy.get('disabled') || undefined}
      disabled={proxy.get('disabled')}
      role="gridcell"
      aria-selected={sel}
      aria-label={proxy.label}
    >
      {#if itemContent}
        {@render itemContent(proxy)}
      {:else}
        <ItemContent {proxy} />
      {/if}
    </button>
  {/each}
</div>
```

### CSS Layout

```css
[data-grid] {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--grid-min-size, 120px), 1fr));
  gap: var(--grid-gap, 1rem);
}
```

### Keyboard Navigation

Horizontal: ArrowRight → next, ArrowLeft → prev, Home → first, End → last, Enter/Space → select. Navigation wraps at row edges naturally since items are in DOM order.

---

## Component 3: UploadProgress

### Internal Composition

UploadProgress is a **composition component** that delegates rendering to List, Tree, or Grid depending on the active view mode.

```svelte
<div data-upload-progress data-upload-view={view} class={klass}>
  <!-- Header -->
  <div data-upload-header>
    {#if headerContent}
      {@render headerContent(files.length, view)}
    {:else}
      <span>{files.length} files — {statusSummary}</span>
      <Toggle
        options={viewOptions}
        bind:value={view}
        showLabels={false}
        size="sm"
      />
      {#if onclear}
        <button data-upload-clear onclick={onclear}>Clear all</button>
      {/if}
    {/if}
  </div>

  <!-- View body -->
  {#if view === 'list'}
    <List items={files} fields={resolvedFields} ...>
      {#snippet itemContent(proxy)}
        {#if listItem}
          {@render listItem(proxy)}
        {:else}
          <DefaultUploadRow {proxy} {showActions} {oncancel} {onremove} {onretry} />
        {/if}
      {/snippet}
    </List>
  {:else if view === 'tree'}
    <Tree items={treeData} fields={resolvedFields} ...>
      {#snippet content(proxy)}
        {#if treeItem}
          {@render treeItem(proxy)}
        {:else}
          <DefaultUploadRow {proxy} {showActions} {oncancel} {onremove} {onretry} />
        {/if}
      {/snippet}
    </Tree>
  {:else if view === 'grid'}
    <Grid items={files} fields={resolvedFields} minSize={gridMinSize} ...>
      {#snippet itemContent(proxy)}
        {#if gridItem}
          {@render gridItem(proxy)}
        {:else}
          <DefaultUploadTile {proxy} {showActions} {oncancel} {onremove} {onretry} />
        {/if}
      {/snippet}
    </Grid>
  {/if}
</div>
```

### Tree Data Transformation

For tree view, flat file array is grouped by `path` field into a nested structure:

```js
// Input:
[
  { name: 'photo.jpg', path: 'images/', status: 'uploading', progress: 45 },
  { name: 'banner.png', path: 'images/', status: 'done', progress: 100 },
  { name: 'doc.pdf', path: 'docs/', status: 'done', progress: 100 },
  { name: 'readme.md', path: '', status: 'pending', progress: 0 }
]

// Transformed to:
[
  { label: 'images', children: [
    { name: 'photo.jpg', status: 'uploading', progress: 45 },
    { name: 'banner.png', status: 'done', progress: 100 }
  ]},
  { label: 'docs', children: [
    { name: 'doc.pdf', status: 'done', progress: 100 }
  ]},
  { name: 'readme.md', status: 'pending', progress: 0 }
]
```

Nested paths (e.g. `images/thumbnails/`) produce nested folders.

### Default Row Rendering (List & Tree)

```
┌─[icon]─ photo.jpg ── images/ ── 245 KB ──[████████░░ 80%]── uploading ──[✕]─┐
└──────────────────────────────────────────────────────────────────────────────┘
```

- Icon: resolved from `icon` field or inferred from MIME `type`
- Progress bar: `[data-upload-bar]` track + `[data-upload-fill]` at width = progress%
- Status: `[data-upload-status]` with `data-status={statusValue}` for CSS hooks
- Actions: cancel (uploading), remove (done/error), retry (error)

### Default Tile Rendering (Grid)

```
┌────────────┐
│   [icon]   │
│            │
│ photo.jpg  │
│ [████░░]   │
│ uploading  │
│    [✕]     │
└────────────┘
```

### Icon Inference

```js
const MIME_ICONS = {
  'image/':       'i-lucide:image',
  'video/':       'i-lucide:video',
  'audio/':       'i-lucide:music',
  'application/pdf': 'i-lucide:file-text',
  'text/':        'i-lucide:file-text',
  'application/zip': 'i-lucide:archive',
  'application/gzip': 'i-lucide:archive',
}

function inferIcon(mimeType) {
  if (!mimeType) return 'i-lucide:file'
  for (const [prefix, icon] of Object.entries(MIME_ICONS)) {
    if (mimeType.startsWith(prefix) || mimeType === prefix) return icon
  }
  return 'i-lucide:file'
}
```

### Size Formatting

```js
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}
```

### Status Summary

Header displays a summary derived from file statuses:

```js
const statusSummary = $derived(() => {
  const counts = {}
  for (const f of files) {
    const s = f[fields.status] || 'unknown'
    counts[s] = (counts[s] || 0) + 1
  }
  return Object.entries(counts).map(([s, n]) => `${n} ${s}`).join(', ')
})
```

---

## Data Attributes

### UploadTarget

| Attribute | Element | Description |
|-----------|---------|-------------|
| `data-upload-target` | Root | Container / drop zone |
| `data-upload-button` | Button | Browse button |
| `data-dragging` | Root | Present when files dragged over |
| `data-disabled` | Root | When disabled |

### Grid

| Attribute | Element | Description |
|-----------|---------|-------------|
| `data-grid` | Root | Grid container |
| `data-grid-item` | Button | Individual tile |
| `data-grid-min-size` | Root | Min tile size |
| `data-active` | Tile | Selected tile |
| `data-disabled` | Tile | Disabled tile |
| `data-path` | Tile | Navigator path key |

### UploadProgress

| Attribute | Element | Description |
|-----------|---------|-------------|
| `data-upload-progress` | Root | Container |
| `data-upload-view` | Root | Current view mode |
| `data-upload-header` | Div | Header bar |
| `data-upload-file` | Row/tile | Individual file wrapper |
| `data-upload-bar` | Div | Progress bar track |
| `data-upload-fill` | Div | Progress bar fill |
| `data-upload-status` | Span | Status text |
| `data-status` | Row/tile | Status value (for CSS theming) |
| `data-upload-actions` | Div | Action buttons |
| `data-upload-error` | Span | Error message |
| `data-upload-clear` | Button | Clear all button |

---

## Accessibility

### UploadTarget

- `role="button"` on drop zone (clickable to open file dialog)
- `aria-disabled` when disabled
- `aria-label` translatable via labels system
- Keyboard: Enter/Space activates file dialog

### Grid

- `role="grid"` on container, `role="gridcell"` on tiles
- `aria-selected` on selected tile
- Standard horizontal keyboard navigation

### UploadProgress

- Inherits accessibility from List/Tree/Grid internals
- Progress bars: `role="progressbar"` + `aria-valuenow` + `aria-valuemin="0"` + `aria-valuemax="100"`
- Status changes announced via `aria-live="polite"` region
- Action buttons: `aria-label` with file name context (e.g. "Cancel upload for photo.jpg")

---

## Theme / Layout CSS

### File Structure

```
packages/themes/src/base/
  upload-target.css     # Layout: drop zone sizing, flex centering, dashed border
  upload-progress.css   # Layout: header flex, row layout, progress bar track
  grid.css              # Layout: CSS grid, tile padding

packages/themes/src/rokkit/
  upload-target.css     # Theme: colors, drag-over highlight, transitions
  upload-progress.css   # Theme: status colors, progress fill, action buttons
  grid.css              # Theme: tile borders, hover/focus, selection
```

### Status-Based Theming

```css
[data-upload-file][data-status="error"]     { /* red tint, error icon */ }
[data-upload-file][data-status="done"]      { /* green tint, check icon */ }
[data-upload-file][data-status="uploading"] { /* blue tint, animated bar */ }
[data-upload-file][data-status="pending"]   { /* muted, waiting */ }
```

---

## File Structure

```
packages/ui/src/components/
  UploadTarget.svelte       # Drop zone component
  Grid.svelte               # General-purpose tile grid
  UploadProgress.svelte     # File status viewer (composes List, Tree, Grid)
  upload-utils.js           # Shared: file validation, size formatting, icon inference
  index.js                  # Add exports: UploadTarget, Grid, UploadProgress
```

---

## Usage Example

```svelte
<script>
  import { UploadTarget, UploadProgress } from '@rokkit/ui'

  let files = $state([])

  function addToQueue(newFiles) {
    for (const f of newFiles) {
      const entry = {
        id: crypto.randomUUID(),
        name: f.name,
        size: f.size,
        type: f.type,
        path: f.webkitRelativePath || '',
        status: 'pending',
        progress: 0
      }
      files.push(entry)
      startUpload(f, entry) // consumer's upload logic
    }
  }

  function cancelUpload(file) { /* abort XHR, update status */ }
  function retryUpload(file)  { /* restart upload */ }
</script>

<UploadTarget
  multiple
  accept="image/*,.pdf"
  maxSize={10_000_000}
  onfiles={addToQueue}
  onerror={({ file, reason }) => toast(`${file.name}: rejected (${reason})`)}
/>

<UploadProgress
  {files}
  view="list"
  oncancel={cancelUpload}
  onremove={(file) => files = files.filter(f => f.id !== file.id)}
  onretry={retryUpload}
  onclear={() => files = []}
/>
```
