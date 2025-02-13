import { MetadataFactory } from './factory.js'
import { MetadataRegistry } from './registry.js'
import { JavaScriptMetadata } from './javascript.js'
import { JsonMetadata } from './json.js'
import { MarkdownMetadata } from './markdown.js'

const registry = new MetadataRegistry()

registry.register('js', JavaScriptMetadata)
registry.register('json', JsonMetadata)
registry.register('md', MarkdownMetadata)

export const factory = new MetadataFactory(registry)
