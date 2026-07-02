import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "/",
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-dom") || id.includes("react-router")) {
              return "vendor";
            }
            if (id.includes("@privy-io")) {
              return "privy";
            }
            if (id.includes("@dnd-kit")) {
              return "dnd";
            }
            if (id.includes("@google/generative-ai")) {
              return "ai";
            }
            if (id.includes("drizzle-orm") || id.includes("@neondatabase")) {
              return "db";
            }
            if (id.includes("react-markdown") || id.includes("remark") || id.includes("rehype")) {
              return "markdown";
            }
          }
        },
      },
    },
  },
});
