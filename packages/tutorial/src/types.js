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

/**
 * @typedef {Object} TutorialOptions
 * @property {string} rootFolder - The root folder containing tutorial files.
 * @property {string} [metadataFilename='meta.json'] - The optional filename for metadata, defaults to 'meta.json'.
 * @property {string} [readmeFilename='README.md'] - The optional filename for the readme, defaults to 'README.md'.
 * @property {string} [partialFolder='pre'] - The folder containing partial solutions.
 * @property {string} [solutionFolder='src'] - The folder containing correct solutions.
 * @property {string} [tutorialMetadata='src/lib/tutorials.json'] - The filename to write the hierarchical data.
 */
export {}
