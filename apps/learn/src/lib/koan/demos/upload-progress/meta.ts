import type { DemoMeta } from '../../types'
import docs from './docs.md?raw'
const meta: DemoMeta = {
	id: 'upload-progress',
	title: 'UploadProgress',
	description: 'Multi-file upload status orchestrator — list/grid view, per-row progress + actions.',
	keywords: [
		'upload-progress', 'uploads', 'file-list', 'upload-status',
		'progress-list', 'upload-queue', 'cancel-retry'
	],
	category: 'feedback',
	icon: '上',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_upload_progress',
		description: 'Mount an UploadProgress list on the canvas.',
		parameters: { files: 'array of UploadItem', view: 'list | grid' }
	},
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{ name: 'files', type: 'UploadItem[]', default: '[]', desc: 'Rows with `label`, `size`, `type`, `progress`, `status`, optional `error`' },
			{ name: 'fields', type: 'Record<string, string>', desc: 'Remap data keys to component fields' },
			{ name: 'view', type: "'list' | 'grid'", default: "'list'", desc: 'Layout mode' },
			{ name: 'cancelWhen', type: 'string[]', default: '[]', desc: 'Statuses where the Cancel action is enabled' },
			{ name: 'retryWhen', type: 'string[]', default: '[]', desc: 'Statuses where the Retry action is enabled' },
			{ name: 'removeWhen', type: 'string[]', default: '[]', desc: 'Statuses where the Remove action is enabled' },
			{ name: 'labels', type: 'Record<string, string>', desc: 'Override labels (clear, retry, etc.)' },
			{ name: 'class', type: 'string', default: "''", desc: 'Extra CSS classes' }
		],
		events: [
			{ name: 'oncancel', signature: '(file) => void', desc: 'Cancel button clicked on a row' },
			{ name: 'onretry', signature: '(file) => void', desc: 'Retry button clicked on a row' },
			{ name: 'onremove', signature: '(file) => void', desc: 'Remove button clicked on a row' },
			{ name: 'onclear', signature: '() => void', desc: 'Clear-all header button clicked' }
		],
		attrs: [
			{ selector: '[data-upload-progress]', desc: 'Root container (carries data-upload-view)' },
			{ selector: '[data-upload-header]', desc: 'Header bar with summary + Clear all' },
			{ selector: '[data-upload-file-status]', desc: 'Each row (carries data-status, data-progress)' }
		]
	},
	snippets: [
		{
			id: 'intro',
			title: 'Basic — mixed statuses',
			lang: 'svelte',
			code: `<script>
  import { UploadProgress } from '@rokkit/ui'

  const files = $state([
    { id: '1', label: 'spec.pdf',  size: 240_000,   progress: 100, status: 'completed' },
    { id: '2', label: 'logo.svg',  size: 12_000,    progress: 64,  status: 'uploading' },
    { id: '3', label: 'video.mp4', size: 8_400_000, progress: 0,   status: 'failed', error: 'Network timeout' }
  ])
</script>

<UploadProgress
  {files}
  cancelWhen={['uploading']}
  retryWhen={['failed']}
  removeWhen={['completed', 'failed']}
/>`
		},
		{
			id: 'grid',
			title: 'Grid view',
			lang: 'svelte',
			code: `<UploadProgress files={images} view="grid" />`
		}
	],
	docs
}

export default meta
