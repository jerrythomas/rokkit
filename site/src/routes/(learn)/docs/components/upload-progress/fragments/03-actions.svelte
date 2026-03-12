<UploadProgress
	{files}
	cancelWhen={['uploading']}
	retryWhen={['error']}
	removeWhen={['done', 'error', 'cancelled']}
	oncancel={(file) => cancel(file)}
	onretry={(file) => retry(file)}
	onremove={(file) => remove(file)}
	onclear={() => clearAll()}
/>
