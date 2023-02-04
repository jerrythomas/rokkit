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
 * @property {SvelteComponent} preview
 * @property {SvelteComponent} notes
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

export {}
