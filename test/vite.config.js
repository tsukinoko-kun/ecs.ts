import { defineConfig } from "vite"
import { join } from "node:path"

export default defineConfig({
    root: join(process.cwd(), "src"),
    base: "/ecs.ts/",
    build: {
        outDir: join(process.cwd(), "dist"),
    },
})
