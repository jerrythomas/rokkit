<UploadTarget
	accept="image/*,.pdf"
	onfiles={handleFiles}
	onerror={(err) => console.log(err.file.name, err.reason)}
/>
