import { default as RadioGroup } from './RadioGroup.svelte'
import { default as CheckBox } from './CheckBox.svelte'
// import { default as CheckBoxGroup } from './CheckBoxGroup.svelte'
import { default as Range } from './Range.svelte'
import { default as RangeMinMax } from './RangeMinMax.svelte'
import { default as Rating } from './Rating.svelte'

export const rokkitInputTypes = {
	radio: RadioGroup,
	checkbox: CheckBox,
	// 'checkbox-group': CheckBoxGroup,
	range: Range,
	'range-min-max': RangeMinMax,
	rating: Rating
}

export { RadioGroup, CheckBox, Range, RangeMinMax, Rating }
