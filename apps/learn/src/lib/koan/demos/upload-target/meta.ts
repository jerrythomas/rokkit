import type { DemoMeta } from '../../types'
import docs from './docs.md?raw'
const meta: DemoMeta = {
	id: 'upload-target',
	title: 'UploadTarget',
	description: 'Drop zone + click-to-browse with accept-pattern + maxSize validation.',
	keywords: [
		'upload-target', 'drop-zone', 'file-drop', 'dropzone',
		'file-input', 'drag-drop', 'browse'
	],
	category: 'feedback',
	icon: '投',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_upload_target',
		description: 'Mount an UploadTarget drop zone on the canvas.',
		parameters: { accept: 'MIME / extensions', maxSize: 'bytes', multiple: 'boolean' }
	},
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{ name: 'accept', type: 'string', default: "''", desc: 'MIME pattern or extension list (e.g. `image/*`, `.pdf,.docx`)' },
			{ name: 'maxSize', type: 'number', default: 'Infinity', desc: 'Maximum file size in bytes' },
			{ name: 'multiple', type: 'boolean', default: 'false', desc: 'Allow more than one file in one drop / select' },
			{ name: 'disabled', type: 'boolean', default: 'false', desc: 'Disable both drag and click-to-browse' },
			{ name: 'size', type: "'sm' | 'md' | 'lg' | 'full'", default: "'full'", desc: 'Visual size variant — `full` expands to container width' },
			{ name: 'labels', type: 'Record<string, string>', desc: 'Override the prompt / browse / drop labels (i18n)' },
			{ name: 'class', type: 'string', default: "''", desc: 'Extra CSS classes' }
		],
		events: [
			{ name: 'onfiles', signature: '(files: File[]) => void', desc: 'Fires with the valid file array' },
			{ name: 'onerror', signature: '({ file, reason }) => void', desc: '`reason` is `\'type\'` or `\'size\'`' }
		],
		attrs: [
			{ selector: '[data-upload-target]', desc: 'Root drop zone (carries data-dragging, data-disabled)' },
			{ selector: '[data-upload-icon]', desc: 'Default upload icon' },
			{ selector: '[data-upload-button]', desc: 'Browse button (triggers the hidden file input)' }
		]
	},
	snippets: [
		{
			id: 'intro',
			title: 'Basic — images, 5 MB max, multiple',
			lang: 'svelte',
			code: `<script>
  import { UploadTarget } from '@rokkit/ui'
</script>

<UploadTarget
  accept="image/*"
  maxSize={5 * 1024 * 1024}
  multiple
  onfiles={(files) => console.log(files)}
  onerror={({ reason }) => console.warn(reason)}
/>`
		},
		{
			id: 'extensions',
			title: 'Extension list',
			lang: 'svelte',
			code: `<UploadTarget accept=".pdf,.docx,.md" onfiles={handle} />`
		},
		{
			id: 'compact',
			title: 'Compact size',
			lang: 'svelte',
			code: `<UploadTarget size="sm" onfiles={handle} />`
		}
	],
	docs
}

export default meta
