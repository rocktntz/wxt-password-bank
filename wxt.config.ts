import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-vue"],
  manifest: {
    permissions: ["storage", "activeTab", "notifications", "scripting", "tabs"],
    host_permissions: [
      "http://*/*", // 允许所有 HTTP 网站
      "https://*/*", // 允许所有 HTTPS 网站
    ],
  },
});
