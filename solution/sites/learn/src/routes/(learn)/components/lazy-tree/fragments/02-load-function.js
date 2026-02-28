// @ts-nocheck
// onloadchildren receives the node's value and returns children
async function onloadchildren(value) {
  const res = await fetch(`/api/tree/${value}`)
  return res.json() // returns array of child items
}
