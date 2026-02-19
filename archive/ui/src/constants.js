import { FieldMapper } from '@rokkit/core'
import Item from './Item.svelte'

export const defaultMapping = new FieldMapper({}, { default: Item })
