// vitest.config.js
import { defineConfig } from "file:///Users/Jerry/Code/Vikalp/sparsh-ui/node_modules/.pnpm/vite@3.2.2/node_modules/vite/dist/node/index.js";
import { svelte } from "file:///Users/Jerry/Code/Vikalp/sparsh-ui/node_modules/.pnpm/@sveltejs+vite-plugin-svelte@1.1.0_svelte@3.52.0+vite@3.2.2/node_modules/@sveltejs/vite-plugin-svelte/dist/index.js";
var vitest_config_default = defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST })],
  test: {
    globals: true,
    environment: "jsdom",
    coverage: {
      reporter: ["text", "lcov"],
      all: false,
      include: ["src"],
      exclude: ["src/**/*.spec.js"]
    }
  }
});
export {
  vitest_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZXN0LmNvbmZpZy5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9KZXJyeS9Db2RlL1Zpa2FscC9zcGFyc2gtdWkvcGFja2FnZXMvYmFzZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL0plcnJ5L0NvZGUvVmlrYWxwL3NwYXJzaC11aS9wYWNrYWdlcy9iYXNlL3ZpdGVzdC5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL0plcnJ5L0NvZGUvVmlrYWxwL3NwYXJzaC11aS9wYWNrYWdlcy9iYXNlL3ZpdGVzdC5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHsgc3ZlbHRlIH0gZnJvbSAnQHN2ZWx0ZWpzL3ZpdGUtcGx1Z2luLXN2ZWx0ZSdcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcblx0cGx1Z2luczogW3N2ZWx0ZSh7IGhvdDogIXByb2Nlc3MuZW52LlZJVEVTVCB9KV0sXG5cdHRlc3Q6IHtcblx0XHRnbG9iYWxzOiB0cnVlLFxuXHRcdGVudmlyb25tZW50OiAnanNkb20nLFxuXHRcdGNvdmVyYWdlOiB7XG5cdFx0XHRyZXBvcnRlcjogWyd0ZXh0JywgJ2xjb3YnXSxcblx0XHRcdGFsbDogZmFsc2UsXG5cdFx0XHRpbmNsdWRlOiBbJ3NyYyddLFxuXHRcdFx0ZXhjbHVkZTogWydzcmMvKiovKi5zcGVjLmpzJ11cblx0XHR9XG5cdH1cbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXNVLFNBQVMsb0JBQW9CO0FBQ25XLFNBQVMsY0FBYztBQUV2QixJQUFPLHdCQUFRLGFBQWE7QUFBQSxFQUMzQixTQUFTLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxRQUFRLElBQUksT0FBTyxDQUFDLENBQUM7QUFBQSxFQUM5QyxNQUFNO0FBQUEsSUFDTCxTQUFTO0FBQUEsSUFDVCxhQUFhO0FBQUEsSUFDYixVQUFVO0FBQUEsTUFDVCxVQUFVLENBQUMsUUFBUSxNQUFNO0FBQUEsTUFDekIsS0FBSztBQUFBLE1BQ0wsU0FBUyxDQUFDLEtBQUs7QUFBQSxNQUNmLFNBQVMsQ0FBQyxrQkFBa0I7QUFBQSxJQUM3QjtBQUFBLEVBQ0Q7QUFDRCxDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
