// @ts-nocheck
// onlazyload receives the item and returns children
async function onlazyload(item) {
  const res = await fetch(`/api/tree/${item.value}`)
  return res.json() // returns array of child items
}
