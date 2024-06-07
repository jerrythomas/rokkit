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
 * @property {string} [previewFilename='App.svelte'] - The optional filename for the preview, defaults to 'App.svelte'.
 * @property {string} [partialFolder='pre'] - The folder containing partial example.
 * @property {string} [solutionFolder='src'] - The folder containing correct example.
 * @property {string} [tutorialMetadata='src/lib/tutorials.json'] - The filename to write the hierarchical data.
 */

/**
 * @typedef {Object} FileMetadata
 * @property {string} name - The name of the file.
 * @property {string} path - The path to the file.
 * @property {string} type - The type of file.
 * @property {string} [content] - The content of the file.
 * @property {Array<FileMetadata>} [children] - Contains files in sub folder if the type is 'folder'.
 */

/**
 * @typedef {Object} SourceContent
 * @property {any}                 preview - Svelte component for previewing the example.
 * @property {Array<FileMetadata>} files   - Metadata including source for the example.
 */

/**
 * @typedef {Object} TutorialMetadata
 * @property {string}        title    - The title of the tutorial.
 * @property {number}        sequence - The sequence of the tutorial.
 * @property {string}        key      - Key used for identifying the tutorial.
 * @property {string}        route    - The route to the tutorial.
 * @property {any}           readme   - The readme content as a svelte component.
 * @property {any}           preview  - The app preview as a svelte component.
 * @property {SourceContent} [pre]    - Contains preview and source files for partial example
 * @property {SourceContent} [src]    - Contains preview and source files for completed example.
 * @property {Array<TutorialMetadata>} [children] - Contains metadata for sub tutorials.
 */

/**
 * @typedef {Object} TutorialData
 * @property {Array<TutorialMetadata>} tutorials - The metadata for the tutorials.
 * @property {Array<string>} routes - List of routes for the tutorials.
 */
export default {}
