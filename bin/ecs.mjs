import { join, relative, resolve } from "node:path"
import { existsSync } from "node:fs"
import { build as viteBuild, createServer as viteDev } from "vite"
import { readdir, readFile, writeFile } from "node:fs/promises"
import { JSDOM } from "jsdom"
import { Script } from "node:vm"

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

    // build
    await viteBuild(viteConfig)

    // find all html files
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

    const adr = `http://localhost${viteConfig.base}`

    // render html files
    for (let file of htmlFiles) {
        console.log("Rendering", file)
        const p = resolve(viteConfig.build.outDir, file)
        const dom = new JSDOM(await readFile(p, "utf-8"), {
            runScripts: "outside-only",
            resources: undefined,
            url: adr + file,
            pretendToBeVisual: true,
        })
        // wait for html to be loaded
        await new Promise((res) => {
            dom.window.onload = res
            if (dom.window.document.readyState === "complete") {
                res()
            }
        })
        // get all scripts
        const scripts = Array.from(dom.window.document.querySelectorAll("script[src]"))
        for (const script of scripts) {
            const url = new URL(script.src, adr)
            let filePath = url.pathname
            if (filePath.startsWith(viteConfig.base)) {
                filePath = filePath.slice(viteConfig.base.length)
            }
            const p = join(viteConfig.build.outDir, filePath)
            if (!existsSync(p)) {
                continue
            }
            const content = await readFile(p, "utf-8")
            const s = new Script(content, { filename: url.pathname })
            s.runInContext(dom.getInternalVMContext())
        }

        await delay(500)

        const html = dom.serialize()
        console.log("Writing", file, html)
        await writeFile(resolve(viteConfig.build.outDir, file), html)
        dom.window.close()
    }
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

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

await main(process.argv.slice(2))
