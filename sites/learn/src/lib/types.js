/**
 * @typedef Reference
 * @property {string} source
 * @property {string|Array.<string>} items
 */

/**
 * @typedef Sample
 * @property {string} [code]
 * @property {any} [article]
 * @property {any} [component]
 * @property {string} [class]
 * @property {Array<Reference>} [refs]
 * @property {Object<string, any>} [props]
 * @property {Object<string, string>} [declarations]
 */

/**
 * @typedef Snippet
 * @property {Array<Reference>} refs
 * @property {Object<string, string>} [defs]
 * @property {Array<string>} [exclusions]
 */

/**
 * @typedef TutorialSlide
 * @property {any} guide
 * @property {any} component
 * @property {string} [title]
 * @property {Object<string, any>} [metadata]
 */

/**
 * @typedef Tutorial
 * @property {string} name
 * @property {string} [neutral]
 * @property {Array<TutorialSlide>} slides
 */
/**
 * @typedef Navigation
 * @property {string} title
 * @property {string} url
 */

/**
 * @typedef StoryFile
 * @property {string} file
 * @property {string} fileName
 * @property {string} folder
 * @property {string} pageNumber
 * @property {string} [code]
 * @property {any} [preview]
 * @property {any} [notes]
 */

/**
 * @typedef SampleWithCode
 * @property {string} file
 * @property {string} code
 * @property {string} language
 */

/**
 * @typedef StoryPage
 * @property {Array<SampleWithCode>} files
 * @property {*} preview
 * @property {*} notes
 * @property {Object<string, any>} metadata
 */

/**
 * @typedef ComponentStory
 * @property {string} name
 * @property {Object<string, any>} [metadata]
 * @property {Array<StoryPage>} pages
 */

/**
 * @typedef {Object<string, ComponentStory>} Stories
 */

/**
 * @typedef StoryOptions
 * @property {string} preview - filename to render the preview component
 * @property {string} notes - filename to render the notes component
 * @property {string} metadata - filename containing component metadata
 */

export default {}
