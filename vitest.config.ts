import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    resolve: {
        tsconfigPaths: true,
    },
    test: {
        environment: "happy-dom",
        setupFiles: ["./src/test/setup.ts"],
        globals: true,
        // Exclude e2e/ so Playwright specs don't get picked up by Vitest
        exclude: ["e2e/**", "node_modules/**"],
    },
});