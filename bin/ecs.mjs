import { dirname, join, relative } from "node:path"
import { join as posixJoin } from "node:path/posix"
import { existsSync } from "node:fs"
import { build as viteBuild, createServer as viteDev } from "vite"
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises"
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
            await build(args.slice(1))
            break
        case "dev":
            await dev(args.slice(1))
            break
        default:
            console.error(`Unknown command: ${args[0]}`)
            process.exit(1)
    }
}

/** @param {string[]} args */
async function build(args) {
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
                dirs.push(join(dir, file.name))
            } else if (file.isFile() && file.name.endsWith(".html")) {
                htmlFiles.push(relative(viteConfig.build.outDir, join(dir, file.name)))
            }
        }
    }

    const adr = `http://localhost${viteConfig.base}`

    const done = new Set(htmlFiles.map((f) => join(viteConfig.build.outDir, f)))

    /**
     * @param {string} pathname
     * @param {string} file
     * @param {string|undefined} html
     */
    async function render(pathname, file, html) {
        done.add(file)

        if (!html) {
            html = await readFile(file, "utf-8")
        }
        console.log(`render("${pathname}", "${file}")`)
        const url = new URL(pathname, adr)
        const dom = new JSDOM(html, {
            runScripts: "outside-only",
            resources: undefined,
            url: url.href,
            pretendToBeVisual: true,
        })

        let open = true
        try {
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

            const newHtml = dom.serialize()
            const dir = dirname(file)
            await mkdir(dir, { recursive: true })
            await writeFile(file, newHtml)

            /** @type {Array<string>} */
            const routerPaths = Array.from(dom.window.__ecs_debug__(true).location.pathCache.keys())

            dom.window.close()
            open = false

            if (routerPaths.length === 0) {
                return
            }

            for (const href of routerPaths) {
                try {
                    const targetUrl = new URL(href, url)
                    if (targetUrl.origin !== url.origin) {
                        continue
                    }
                    let targetPath = targetUrl.pathname
                    if (targetPath.startsWith(viteConfig.base)) {
                        targetPath = targetPath.slice(viteConfig.base.length)
                    }
                    if (!targetPath.endsWith(".html")) {
                        targetPath = posixJoin(targetPath, "index.html")
                    }
                    const file = join(viteConfig.build.outDir, targetPath)
                    if (done.has(file)) {
                        continue
                    }
                    if (existsSync(file)) {
                        continue
                    }
                    if (targetPath.endsWith("index.html")) {
                        targetPath = targetPath.slice(0, -10)
                    }
                    await render(targetPath, file, newHtml)
                } catch {}
            }
        } finally {
            if (open) {
                dom.window.close()
            }
        }
    }

    // render html files
    for (const file of htmlFiles) {
        let p = file
        if (p.endsWith("index.html")) {
            p = p.slice(0, -10)
        }
        if (p === "") {
            p = "/"
        }
        await render(p, join(viteConfig.build.outDir, file), undefined)
    }
}

/** @param {string[]} args */
async function dev(args) {
    const viteConfig = await getViteConfig()
    const server = await viteDev(viteConfig)
    await server.listen()

    server.printUrls()
    server.bindCLIShortcuts({ print: true })
}

async function getViteConfig() {
    const def = {
        root: join(__dirname, "./src"),
        base: "/",
        build: {
            outDir: join(__dirname, "./dist"),
            emptyOutDir: true,
        },
    }

    const viteConfigPath = join(__dirname, "vite.config.js")
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
    return new Promise((res) => setTimeout(res, ms))
}

await main(process.argv.slice(2))
