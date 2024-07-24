import { relative, resolve } from "node:path"
import { existsSync } from "node:fs"
import { build as viteBuild, createServer as viteDev, preview as vitePreview } from "vite"
import { readdir, writeFile } from "node:fs/promises"
import { chromium } from "playwright"

const __dirname = process.cwd()

/** @param {string[]} args */
async function main(args) {
    if (args.length === 0) {
        console.error("Usage: ecs <command>")
        console.error("Commands:")
        console.error("  build")
        console.error("  dev")
        process.exit(1)
    }

    switch (args[0]) {
        case "build":
            await build()
            break
        case "dev":
            await dev()
            break
        default:
            console.error(`Unknown command: ${args[0]}`)
            process.exit(1)
    }
}

async function build() {
    const viteConfig = await getViteConfig()
    await viteBuild(viteConfig)

    // render all html files in vite build output
    const htmlFiles = []
    const dirs = [viteConfig.build.outDir]
    while (dirs.length > 0) {
        const dir = dirs.pop()
        const files = await readdir(dir, { withFileTypes: true })
        for (const file of files) {
            if (file.isDirectory()) {
                dirs.push(resolve(dir, file.name))
            } else if (file.isFile() && file.name.endsWith(".html")) {
                htmlFiles.push(relative(viteConfig.build.outDir, resolve(dir, file.name)))
            }
        }
    }

    const server = await vitePreview(viteConfig)

    await delay(200)

    const browser = await chromium.launch({ headless: true })
    const page = await browser.newPage({
        acceptDownloads: false,
        baseURL: server.resolvedUrls.local[0],
        ignoreHTTPSErrors: true,
        bypassCSP: true,
    })

    const writeFilePromises = []

    for (const file of htmlFiles) {
        await page.goto(file)
        await page.waitForTimeout(1000)
        const html = await page.content()
        writeFilePromises.push(writeFile(resolve(viteConfig.build.outDir, file), html))
    }

    await browser.close()
    await server.close()

    await Promise.all(writeFilePromises)
}

async function dev() {
    const viteConfig = await getViteConfig()
    const server = await viteDev(viteConfig)
    await server.listen()

    server.printUrls()
    server.bindCLIShortcuts({ print: true })
}

async function getViteConfig() {
    const def = {
        root: resolve(__dirname, "./src"),
        base: "/",
        build: {
            outDir: resolve(__dirname, "./dist"),
            emptyOutDir: true,
        },
    }

    const viteConfigPath = resolve(__dirname, "vite.config.js")
    if (existsSync(viteConfigPath)) {
        const config = await import(viteConfigPath)

        config.default.base ??= def.base
        config.default.build ??= {}
        config.default.build.outDir ??= def.build.outDir

        return { ...def, ...config.default }
    } else {
        return def
    }
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

await main(process.argv.slice(2))
