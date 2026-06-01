## Multi-file upload status with per-file actions

UploadProgress orchestrates a list (or grid) of files, each
rendered as an UploadFileStatus row with progress + name + size +
status badge. The component is purely presentational — your code
manages the upload, this component shows the current state and
emits cancel / retry / remove callbacks.

## Basic example

```svelte
<script>
  import { UploadProgress } from '@rokkit/ui'

  const files = $state([
    { id: '1', label: 'spec.pdf', size: 240_000, progress: 100, status: 'completed' },
    { id: '2', label: 'logo.svg', size: 12_000,  progress: 64,  status: 'uploading' },
    { id: '3', label: 'video.mp4', size: 8_400_000, progress: 0, status: 'failed', error: 'Network timeout' }
  ])
</script>

<UploadProgress
  {files}
  cancelWhen={['uploading', 'queued']}
  retryWhen={['failed']}
  removeWhen={['completed', 'failed']}
  oncancel={(file) => api.cancel(file.id)}
  onretry={(file) => api.retry(file.id)}
  onremove={(file) => api.remove(file.id)}
  onclear={() => api.clearAll()}
/>
```

## File shape

Each row reads from these fields (override via `fields`):

| Field      | Type           | Notes                                         |
| ---------- | -------------- | --------------------------------------------- |
| `label`    | string         | filename to display                           |
| `size`     | number         | bytes — formatted as human-readable           |
| `type`     | string         | MIME or extension, picks the file icon        |
| `progress` | number (0–100) | uploaded percentage                           |
| `status`   | string         | drives the badge + which actions apply        |
| `error`    | string         | shown beneath the row when status is `failed` |

## Actions

`cancelWhen` / `retryWhen` / `removeWhen` are arrays of status
values that gate which action button appears per row. Header
"Clear all" fires `onclear` and is suppressed when no actions are
available across the list.

## View modes

`view` switches between `list` (vertical rows, default) and
`grid` (tile layout for thumbnail-style image uploads).
