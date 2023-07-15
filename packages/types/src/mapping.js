/**
 * Structure to map custom fields for rendering. This is used to identofy the attributes for various purposes.
 *
 * @typedef FieldMapping
 * @property {string} [id='id']              Unique id for the item
 * @property {string} [text='text']          the text to render
 * @property {string} [url='url']            a URL
 * @property {string} [icon='icon']          icon to render
 * @property {string} [image='image']        the image to render
 * @property {string} [children='children']  children of the item
 * @property {string} [summary='summary']
 * @property {string} [notes='notes']
 * @property {string} [props='props']
 * @property {string} [isOpen='_open']       item is open or closed
 * @property {string} [level='level']        level of item
 * @property {string} [parent='parent']      item is a parent
 * @property {string} [isDeleted='_deleted'] item is deleted
 * @property {FieldMapping} [fields]         Field mapping to be used on children in the next level
 */

/**
 * Component map to be used to render the item.
 * @typedef {Object<string, any>} ComponentMap
 */
