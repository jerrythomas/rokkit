# Upload Components

Two separate components — one for file selection and one for progress display. The upload target accepts files while previous uploads are in progress. A third general-purpose Grid component is introduced for the grid/tile view mode.

**Consumer owns all upload logic.** Components are purely UI — no fetch/XHR built in.

---

## UploadTarget — File Selection

Drop zone with drag-and-drop support plus a browse button. Validates files before firing callbacks.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `accept` | `string` | `''` | MIME types / extensions (e.g. `'image/*,.pdf'`) |
| `maxSize` | `number` | `Infinity` | Maximum file size in bytes |
| `multiple` | `boolean` | `false` | Allow multiple files |
| `disabled` | `boolean` | `false` | Disable the target |
| `onfiles` | `(files: File[]) => void` | — | Called with valid files after selection/drop |
| `onerror` | `(err: {file, reason}) => void` | — | Called per file on validation failure (`reason`: `'type'` or `'size'`) |
| `class` | `string` | `''` | Additional CSS classes |

### Snippet

- `content(dragging: boolean)` — custom drop zone content

### Default UI

Dashed border zone with upload icon, "Drop files here or click to browse" text, and a styled browse button. Visual feedback when files are dragged over.

### Behavior

1. Drag over → visual highlight (`data-dragging` attribute)
2. Drop or button click → validate each file against `accept` and `maxSize`
3. Valid files → `onfiles(validFiles)`
4. Invalid files → `onerror({file, reason})` per invalid file
5. Hidden `<input type="file">` for button click fallback

---

## UploadProgress — File Status Viewer

Displays file upload status using the standard Rokkit field mapping + snippet framework. Composes existing List, Tree, and new Grid components internally. Built-in view mode toggle.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `files` | `unknown[]` | `[]` | File status objects (arbitrary shape) |
| `fields` | `Record<string, string>` | `{}` | Field mapping overrides |
| `view` | `'list'\|'tree'\|'grid'` | `'list'` | View mode (bindable) |
| `oncancel` | `(file) => void` | — | User clicked cancel on a file |
| `onremove` | `(file) => void` | — | User clicked remove |
| `onretry` | `(file) => void` | — | User clicked retry on errored file |
| `onclear` | `() => void` | — | User clicked clear all |
| `showActions` | `boolean` | `true` | Show action buttons per file |
| `disabled` | `boolean` | `false` | Disable all interaction |
| `class` | `string` | `''` | Additional CSS classes |

### Field Mapping

Extends BASE_FIELDS with upload-specific semantics:

| Semantic Key | Default Raw Key | Description |
|-------------|----------------|-------------|
| `label` | `'name'` | File display name |
| `value` | `'id'` | Unique identifier |
| `icon` | `'icon'` | File type icon (auto-inferred from MIME type if absent) |
| `status` | `'status'` | Arbitrary status string |
| `progress` | `'progress'` | 0–100 number |
| `size` | `'size'` | File size in bytes (auto-formatted for display) |
| `path` | `'path'` | Relative path (used for tree view grouping) |
| `type` | `'type'` | MIME type (for icon inference) |
| `error` | `'error'` | Error message string |

### View Modes

- **list** — Flat rows: icon, name, path, size, progress bar, status, actions
- **tree** — Files grouped by `path` into folder hierarchy; folders expandable; leaves show progress/status
- **grid** — Responsive tile grid: large icon, name, progress overlay, status badge

### Snippets (per view)

Each view mode has its own snippet set for independent customization:

| Snippet | Args | View | Description |
|---------|------|------|-------------|
| `listItem(proxy)` | ProxyItem | list | Custom row rendering |
| `treeItem(proxy)` | ProxyItem | tree | Custom leaf node rendering |
| `treeGroup(proxy)` | ProxyItem | tree | Custom folder header |
| `gridItem(proxy)` | ProxyItem | grid | Custom tile rendering |
| `headerContent(count, view)` | number, string | all | Custom header bar |

### Built-in Header

- File count summary (e.g. "3 files — 2 uploading, 1 done")
- Icon-only Toggle for list/tree/grid view switching
- Clear all button (when `onclear` provided)

### Icon Inference from MIME Type

When no explicit `icon` field is present, infer from `type`:

| MIME | Icon |
|------|------|
| `image/*` | `i-lucide:image` |
| `video/*` | `i-lucide:video` |
| `audio/*` | `i-lucide:music` |
| `application/pdf` | `i-lucide:file-text` |
| `text/*` | `i-lucide:file-text` |
| `*zip*`, `*gzip*`, `*tar*` | `i-lucide:archive` |
| default | `i-lucide:file` |

---

## Grid — General-Purpose Tile Grid

New reusable component (not upload-specific). Renders any item collection as a responsive CSS grid of tiles.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `unknown[]` | `[]` | Array of items |
| `fields` | `Record<string, string>` | `{}` | Field mapping overrides |
| `value` | `unknown` | — | Selected value (bindable) |
| `onselect` | `(value, item) => void` | — | Selection callback |
| `minSize` | `string` | `'120px'` | Minimum tile width for auto-fill layout |
| `gap` | `string` | `'1rem'` | Grid gap |
| `disabled` | `boolean` | `false` | Disable interaction |
| `class` | `string` | `''` | Additional CSS classes |

### Layout

`grid-template-columns: repeat(auto-fill, minmax(<minSize>, 1fr))` — tiles fill available space, wrapping responsively.

### Architecture

Uses Wrapper + Navigator pattern (horizontal navigation, wraps at edges).

### Snippet

- `itemContent(proxy)` — custom tile rendering (default: icon + label)

---

## Data Flow

```
User drops/selects files
        ↓
   UploadTarget
   (validates accept + maxSize)
        ↓
   onfiles(File[])
        ↓
   Consumer adds to state,
   starts upload, updates status/progress
        ↓
   UploadProgress
   (renders file state via field mapping)
```

Both components are independent — UploadTarget can be used without UploadProgress, and UploadProgress can be fed from any source.
