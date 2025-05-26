/**
 * @typedef {Object} IconPackageInfo
 * @property {string} [namespace]
 * @property {string} [version]
 * @property {string} [homepage]
 */
/**
 * @typedef {Object} BundleConfig
 * @property {boolean} [color]
 */

/**
 * @typedef {Object} BundleConfiguration
 * @property {IconPackageInfo} [package]
 * @property {Object<string,BundleConfig} [bundles]
 */

/**
 * @typedef {Object} IconBuilderOptions
 * @property {string} target
 * @property {string} prefix
 * @property {boolean} color
 * @property {IconPackageInfo} [package]
 */

/**
 * @typedef {Object} FolderOptions
 * @property {string} input
 * @property {string} output
 */
export {}
