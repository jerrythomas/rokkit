/**
 * A layout element, describes how a part of the form should be rendered.
 *
 * - When key is present, it is a field and label, description and component are associated.
 *
 * @typedef LayoutElement
 * @property {string} type - Type of layout 'Horizontal, Vertical, Grid, Group'.
 * @property {string} [scope] - Provides a path to an attribute in an object
 * @property {string} [label] - The label of the field.
 * @property {string} [description] - The name of the field.
 * @property {string} [component] - Component used for the field.
 * @property {Array<LayoutElement>} [elements] - The elements of the field.
 */
/**
 * @typedef FieldLayout
 * @property {string} [description] - The description of the field.
 * @property {Array<LayoutElement>} [elements] - The elements of the field.
 */
