import {
    type App,
    Commands,
    Entity,
    HtmlTitle,
    Location,
    OnEnter,
    OnExit,
    query,
    res,
    UiNode,
    UiText,
} from "@tsukinoko-kun/ecs.ts"
import { UiClassList } from "../../../lib/builtin/components/uiClassList"

class MeepPageMarker {}

function setTitle() {
    const t = res(HtmlTitle)
    t.title = "Meep!"
}

// this system is used to spawn the UI elements initially
function spawnUi() {
    Commands.spawn(new MeepPageMarker(), new UiNode("h1"), new UiText("Meep?"), new UiClassList("text-4xl"))
}

function despawnUi() {
    for (const [entity] of query.root([Entity], query.and(MeepPageMarker))) {
        Commands.despawn(entity)
    }
}

export function MeepPlugin(app: App) {
    app.addSystem(OnEnter(Location.fromPath("/meep")), setTitle)
        // this system should run when the location changes to "/meep"
        .addSystem(OnEnter(Location.fromPath("/meep")), spawnUi)
        // this system should run when the location changes from "/" to something else
        .addSystem(OnExit(Location.fromPath("/meep")), despawnUi)
}
