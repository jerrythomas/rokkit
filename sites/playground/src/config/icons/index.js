import { iconStore } from '@svelte-spice/icons'
import {
	Check,
	ChartBar,
	Sparkles,
	Beaker
} from '@svelte-spice/icons/heroicons/outline'
const icons = {
	tick: Check
}

iconStore.set(icons)

export { ChartBar, Beaker, Sparkles }
