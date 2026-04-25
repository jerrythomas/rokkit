import type { SetupData } from '$lib/types'

export function loadSetupData(): SetupData {
	return {
		steps: [
			{ id: 'welcome',    kanji: '始', label: 'Welcome',    description: 'Introduction',          status: 'completed' },
			{ id: 'components', kanji: '具', label: 'Components', description: 'Install tools',          status: 'completed' },
			{ id: 'assistants', kanji: '助', label: 'Assistants', description: 'Coding tools',           status: 'completed' },
			{ id: 'folders',    kanji: '箱', label: 'Folders',    description: 'Code locations',         status: 'current'   },
			{ id: 'scan',       kanji: '探', label: 'Scan',       description: 'Discover repos',         status: 'pending'   },
			{ id: 'projects',   kanji: '組', label: 'Projects',   description: 'Group repos',            status: 'pending'   },
			{ id: 'libraries',  kanji: '書', label: 'Libraries',  description: 'Wrap docs',              status: 'pending'   },
			{ id: 'inference',  kanji: '脳', label: 'Inference',  description: 'Models & providers',     status: 'pending'   },
			{ id: 'registry',   kanji: '器', label: 'Registry',   description: 'MCP services',           status: 'pending'   },
			{ id: 'enter',      kanji: '門', label: 'Enter',      description: 'Ready',                  status: 'pending'   }
		],
		folders: [
			'~/code/lumen',
			'~/code/brand-kit'
		],
		projects: [
			{
				id: 'p1',
				name: 'Lumen Studio',
				repos: ['lumen-studio', 'lumen-ui', 'lumen-canvas'],
				role: 'frontend',
				confirmed: true
			},
			{
				id: 'p2',
				name: 'Lumen Cloud',
				repos: ['lumen-cloud', 'lumen-api', 'lumen-workers'],
				role: 'backend',
				confirmed: false
			},
			{
				id: 'p3',
				name: 'Brand Kit',
				repos: ['brand-kit'],
				role: 'library',
				confirmed: true
			}
		]
	}
}
