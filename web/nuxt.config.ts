export default defineNuxtConfig({
  compatibilityDate: "2026-05-11",

  devtools: { enabled: true },

  ssr: false,

  devServer: {
    port: 3001,
  },

  nitro: {
    preset: "static",
  },

  vite: {
    server: {
      hmr: {
        protocol: "ws",
        host: "localhost",
      },
      watch: {
        usePolling: true,
      },
    },
  },

  css: ["~/assets/css/main.css"],

  runtimeConfig: {
    public: {
      apiBase: "http://localhost:3000/api",
    },
  },
});
