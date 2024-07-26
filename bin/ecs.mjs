import { join, relative, resolve } from "node:path"
import { existsSync, readFileSync } from "node:fs"
import { build as viteBuild, createServer as viteDev } from "vite"
import { lstat, readdir, writeFile } from "node:fs/promises"
import { chromium } from "playwright"
import express from "express"

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

    const server = await new Promise((res) => {
        const app = express()
        app.use(async (req, res) => {
            if (req.url.startsWith(viteConfig.base)) {
                req.url = req.url.slice(viteConfig.base.length)
            }
            if (!req.url.startsWith("/")) {
                req.url = "/" + req.url
            }
            let p = join(viteConfig.build.outDir, req.url)
            if (!existsSync(p)) {
                res.status(404).send("Not found")
                return
            }
            const stat = await lstat(p)
            if (stat.isDirectory()) {
                p = join(p, "index.html")
                if (!existsSync(p)) {
                    res.status(404).send("Not found")
                    return
                }
            }
            const f = readFileSync(p, "utf-8")
            if (req.url.endsWith(".html")) {
                res.setHeader("Content-Type", "text/html")
            } else if (req.url.endsWith(".js")) {
                res.setHeader("Content-Type", "text/javascript")
            } else if (req.url.endsWith(".css")) {
                res.setHeader("Content-Type", "text/css")
            }
            res.status(200)
            res.send(f)
        })
        const server = app.listen(0, () => {
            res(server)
        })
    })

    const adressInfo = server.address()
    const adr = `http://localhost:${adressInfo.port}${viteConfig.base}`

    const browser = await chromium.launch({ headless: false })
    const page = await browser.newPage({
        acceptDownloads: false,
        ignoreHTTPSErrors: true,
        bypassCSP: true,
    })

    for (let file of htmlFiles) {
        console.log("Rendering", file)
        await page.goto(adr + file)
        await page.waitForLoadState("networkidle")
        await page.waitForTimeout(500)
        const html = await page.content()
        await writeFile(resolve(viteConfig.build.outDir, file), html)
    }

    await browser.close()
    await server.close()
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

        config.default.base ||= def.base
        config.default.build ??= {}
        config.default.build.outDir ??= def.build.outDir

        return { ...def, ...config.default }
    } else {
        return def
    }
}

await main(process.argv.slice(2))
