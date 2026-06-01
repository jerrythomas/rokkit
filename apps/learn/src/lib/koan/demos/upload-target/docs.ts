export const uploadTargetDocs = `## Drop zone with file validation

UploadTarget is a drag-and-drop region that doubles as a click-to-
browse button. Files are validated against \`accept\` (MIME pattern
or extension list) and \`maxSize\` (bytes) — valid files fire
\`onfiles\`, invalid ones fire \`onerror\` with the reason.

## Basic example

\`\`\`svelte
<script>
  import { UploadTarget } from '@rokkit/ui'

  function handleFiles(files) {
    // valid \`File[]\` array
    for (const file of files) startUpload(file)
  }

  function handleError({ file, reason }) {
    // reason is 'type' or 'size'
    toast.error(\`\${file.name} rejected: \${reason}\`)
  }
</script>

<UploadTarget
  accept="image/*"
  maxSize={5 * 1024 * 1024}
  multiple
  onfiles={handleFiles}
  onerror={handleError}
/>
\`\`\`

## Accept patterns

The \`accept\` prop matches the HTML \`<input>\` syntax:

- \`image/*\` — any image MIME type.
- \`.pdf,.docx\` — extensions list.
- \`application/pdf,image/png\` — explicit MIME types.
- empty string — accept anything.

## Size

\`maxSize\` is in bytes (defaults to \`Infinity\`). Files larger than
the limit fire \`onerror\` with \`{ reason: 'size' }\`.

## Multiple files

\`multiple={true}\` lets the user drop / select more than one file at
a time. Combined with onfiles + UploadProgress, this is the
canonical multi-file upload flow.

## Custom content

The default content slot is the icon + browse button. Override via
the \`content\` snippet — it receives the live \`dragging\` boolean
so you can swap visuals while a drag is over the target.
`
