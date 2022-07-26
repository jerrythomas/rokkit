import { iconStore } from '@sparsh-ui/icons'
import {
	Sun,
	Moon,
	Folder,
	FolderOpen,
	ChevronDown,
	ChevronRight
} from '@sparsh-ui/icons/heroicons/outline'

import NodeClosed from './NodeCollapsed.svelte'
import NodeOpen from './NodeExpanded.svelte'
iconStore.set({
	Sun,
	Moon,
	Folder,
	FolderOpen,
	ChevronDown,
	ChevronRight,
	NodeOpen,
	NodeClosed
})
