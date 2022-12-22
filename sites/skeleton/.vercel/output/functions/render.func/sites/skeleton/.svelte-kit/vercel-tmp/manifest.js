export const manifest = {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png","icons/dark-mode.svg","icons/light-mode.svg","icons/palette.svg","icons/properties.svg","icons/swatch.svg","icons/themes.svg"]),
	mimeTypes: {".png":"image/png",".svg":"image/svg+xml"},
	_: {
		entry: {"file":"_app/immutable/start-4e8e529e.js","imports":["_app/immutable/start-4e8e529e.js","_app/immutable/chunks/index-fe20bb88.js","_app/immutable/chunks/singletons-f0c967fe.js"],"stylesheets":[],"fonts":[]},
		nodes: [
			() => import('../output/server/nodes/0.js'),
			() => import('../output/server/nodes/1.js'),
			() => import('../output/server/nodes/2.js')
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0], errors: [1], leaf: 2 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		}
	}
};
