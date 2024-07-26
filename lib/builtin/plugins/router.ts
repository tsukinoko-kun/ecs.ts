import type { App } from "../../app"
import { Location, type TrainingSlash } from "../state"
import { updateLocationState } from "../systems/location"
import { Startup } from "../../schedule"
import { BasePath } from "../resources/basePath"

export function RouterPlugin(app: App) {
    app.insertResource(new BasePath("/")).insertState(Location.windowLocation()).addSystem(Startup, updateLocationState)
}

RouterPlugin.withSettings = (basePath: string, trailingSlash: TrainingSlash, trimIndexHtml: boolean) => (app: App) => {
    Location.trimIndexHtml = trimIndexHtml
    Location.trailingSlash = trailingSlash
    app.insertResource(new BasePath(basePath))
        .insertState(Location.windowLocation())
        .addSystem(Startup, updateLocationState)
}
