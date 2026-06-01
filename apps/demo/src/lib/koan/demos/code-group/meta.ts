import type { DemoMeta } from '../../types'
import { codeGroupDocs } from './docs'

const meta: DemoMeta = {
	id: 'code-group',
	title: 'CodeGroup',
	description: 'Multi-file code display with a tree picker + optional preview panel.',
	keywords: [
		'code-group', 'codegroup', 'multi-file', 'project-skeleton',
		'file-tree', 'code-walkthrough', 'tree-picker'
	],
	category: 'content',
	icon: '集',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_code_group',
		description: 'Mount a CodeGroup on the canvas.',
		parameters: { files: 'array of CodeGroupFile', initialFile: 'path to open first' }
	},
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{ name: 'files', type: 'CodeGroupFile[]', desc: 'Files to display — `{ path, language, code, name?, icon? }`' },
			{ name: 'initialFile', type: 'string', desc: 'Path of the file selected on first mount' },
			{ name: 'icons', type: 'IconOverrides', desc: 'Override the doc / folder / view / action icon groups' },
			{ name: 'preview', type: 'Snippet', desc: 'Optional preview snippet (collapsed by default)' },
			{ name: 'showCopyButton', type: 'boolean', default: 'true', desc: 'Render the copy button on the code block' },
			{ name: 'class', type: 'string', default: "''", desc: 'Extra CSS classes' }
		],
		events: [],
		attrs: [
			{ selector: '[data-code-group]', desc: 'Root container' },
			{ selector: '[data-code-group-tree]', desc: 'Left-rail file tree (≥768px)' },
			{ selector: '[data-code-group-pill]', desc: 'Collapsed file picker (<768px)' },
			{ selector: '[data-code-group-code]', desc: 'Code panel showing the active file' }
		]
	},
	snippets: [
		{
			id: 'intro',
			title: 'Basic — 3 files, App.svelte selected',
			lang: 'svelte',
			code: `<script>
  import { CodeGroup } from '@rokkit/ui'

  const files = [
    { path: 'src/App.svelte', language: 'svelte', code: appSrc },
    { path: 'src/lib/Button.svelte', language: 'svelte', code: buttonSrc },
    { path: 'package.json', language: 'json', code: pkgSrc }
  ]
</script>

<CodeGroup {files} initialFile="src/App.svelte" />`
		},
		{
			id: 'nested',
			title: 'Nested folders (tree shape)',
			lang: 'svelte',
			code: `<CodeGroup files={[
  { path: 'src/lib/Button.svelte', language: 'svelte', code: btn },
  { path: 'src/lib/Card.svelte',   language: 'svelte', code: card },
  { path: 'src/routes/+page.svelte', language: 'svelte', code: page },
  { path: 'src/app.css',           language: 'css',    code: css }
]} />`
		}
	],
	docs: codeGroupDocs
}

export default meta
