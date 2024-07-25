/**
 * @typedef {import("chrome-types")}
 */

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

function exec(code) {
    return new Promise((resolve, reject) => {
        chrome.devtools.inspectedWindow.eval(code, undefined, (res, err) => {
            if (err) {
                reject(err)
            } else {
                resolve(res)
            }
        })
    })
}

function hash(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i)
        hash = hash & hash
    }
    return hash
}

chrome.devtools.panels.elements.createSidebarPane("ECS.ts", async function (sidebar) {
    let lastHash = 0

    while (true) {
        await delay(5000)
        try {
            const res = await exec(`__ecs_debug__()`)
            const newHash = hash(JSON.stringify(res))
            if (newHash === lastHash) {
                continue
            }
            lastHash = newHash

            if (!res || !("worlds" in res)) {
                sidebar.setObject({ error: "EcsDebug not found" }, "ECS.ts Error")
            } else {
                if (res.worlds.length === 1) {
                    sidebar.setObject(res.worlds[0], "ECS.ts World")
                } else {
                    sidebar.setObject(res.worlds, "ECS.ts (Multiple Worlds)")
                }
            }
        } catch (err) {
            if (err) {
                sidebar.setObject({ error: err }, "ECS.ts Error")
                break
            }
        }
    }
})
