import type { App } from "../../app"
import { Location, type TrainingSlash } from "../state"
import { updateLocationState } from "../systems"
import { PreStartup } from "../../schedule"
import { BasePath } from "../resources"

export function RouterPlugin(app: App) {
    app.insertResource(new BasePath("/"))
        .insertState(Location.windowLocation())
        .addSystem(PreStartup, updateLocationState)
}

RouterPlugin.withSettings = (basePath: string, trailingSlash: TrainingSlash, trimIndexHtml: boolean) => (app: App) => {
    Location.trimIndexHtml = trimIndexHtml
    Location.trailingSlash = trailingSlash

    app.insertResource(new BasePath(basePath))
        .insertState(Location.windowLocation())
        .addSystem(PreStartup, updateLocationState)
}
