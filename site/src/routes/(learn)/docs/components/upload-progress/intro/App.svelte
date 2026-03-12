<script>
	// @ts-nocheck
	import { UploadProgress } from '@rokkit/ui'

	const files = [
		{
			label: 'photo.jpg',
			value: '1',
			size: 245760,
			type: 'image/jpeg',
			status: 'uploading',
			progress: 65
		},
		{
			label: 'document.pdf',
			value: '2',
			size: 1048576,
			type: 'application/pdf',
			status: 'done',
			progress: 100
		},
		{
			label: 'report.xlsx',
			value: '3',
			size: 524288,
			type: 'application/vnd.ms-excel',
			status: 'error',
			progress: 30
		},
		{
			label: 'readme.md',
			value: '4',
			size: 2048,
			type: 'text/plain',
			status: 'pending',
			progress: 0
		}
	]
</script>

<UploadProgress {files} />
