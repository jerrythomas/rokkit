<script>
	import NodeCollapsed from '../src/icons/NodeCollapsed.svelte'
	import NodeExpanded from '../src/icons/NodeExpanded.svelte'
	import { iconStore } from '@sparsh-ui/icons'
	import {
		ChevronRight,
		ChevronDown,
		Sun,
		PlusCircle,
		MinusCircle
	} from '@sparsh-ui/icons/heroicons/outline'
	import ConnectorStory from './Connector.story.svelte'
	import ListStory from './List.story.svelte'
	import NodeListStory from './NodeList.story.svelte'

	$: iconStore.set({
		ChevronRight,
		ChevronDown,
		Sun,
		PlusCircle,
		MinusCircle,
		NodeCollapsed,
		NodeExpanded
	})
</script>

<ConnectorStory />
<NodeListStory />
<ListStory />
