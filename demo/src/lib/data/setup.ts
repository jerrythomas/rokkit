import type { SetupData } from '$lib/types'
import { m } from '$lib/paraglide/messages.js'

export function loadSetupData(): SetupData {
	return {
		steps: [
			{ id: 'welcome',    kanji: '始', label: m.setup_step_welcome(),    description: m.setup_step_welcome_desc(),    status: 'completed' },
			{ id: 'components', kanji: '具', label: m.setup_step_components(), description: m.setup_step_components_desc(), status: 'completed' },
			{ id: 'assistants', kanji: '助', label: m.setup_step_assistants(), description: m.setup_step_assistants_desc(), status: 'completed' },
			{ id: 'folders',    kanji: '箱', label: m.setup_step_folders(),    description: m.setup_step_folders_desc(),    status: 'current'   },
			{ id: 'scan',       kanji: '探', label: m.setup_step_scan(),       description: m.setup_step_scan_desc(),       status: 'pending'   },
			{ id: 'projects',   kanji: '組', label: m.setup_step_projects(),   description: m.setup_step_projects_desc(),   status: 'pending'   },
			{ id: 'libraries',  kanji: '書', label: m.setup_step_libraries(),  description: m.setup_step_libraries_desc(),  status: 'pending'   },
			{ id: 'inference',  kanji: '脳', label: m.setup_step_inference(),  description: m.setup_step_inference_desc(),  status: 'pending'   },
			{ id: 'registry',   kanji: '器', label: m.setup_step_registry(),   description: m.setup_step_registry_desc(),   status: 'pending'   },
			{ id: 'enter',      kanji: '門', label: m.setup_step_enter(),      description: m.setup_step_enter_desc(),      status: 'pending'   }
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
				role: m.role_frontend(),
				confirmed: true
			},
			{
				id: 'p2',
				name: 'Lumen Cloud',
				repos: ['lumen-cloud', 'lumen-api', 'lumen-workers'],
				role: m.role_backend(),
				confirmed: false
			},
			{
				id: 'p3',
				name: 'Brand Kit',
				repos: ['brand-kit'],
				role: m.role_library(),
				confirmed: true
			}
		]
	}
}
