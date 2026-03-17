import { FieldMapper } from '@rokkit/core'

const mapper = new FieldMapper({ label: 'name', value: 'id' })
const item = { id: 42, name: 'Widget', category: 'tools' }

const label = mapper.get('label', item)   // 'Widget'
const value = mapper.getValue(item)        // 42
const hasChildren = mapper.hasChildren(item) // false
