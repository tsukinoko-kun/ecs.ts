import type { App } from "../../app"
import { Location } from "../state"
import { updateLocationState } from "../systems/location"
import { Startup } from "../../schedule"
import { BasePath } from "../resources/basePath"

export function RouterPlugin(app: App) {
    app.insertResource(new BasePath("/")).insertState(Location.windowLocation()).addSystem(Startup, updateLocationState)
}

RouterPlugin.withBasePath = (basePath: string) => (app: App) => {
    app.insertResource(new BasePath(basePath))
        .insertState(Location.windowLocation())
        .addSystem(Startup, updateLocationState)
}
