// Guide content is project-authored markdown (no user input), and the
// list of guides is known at build time — so pre-render every /guides/*
// route to static HTML. Faster initial paint, better SEO, no server
// runtime needed for this section.
export const prerender = true
