import { type App, Commands, Entity, OnEnter, OnExit, query, UiNode, UiText } from "@tsukinoko-kun/ecs.ts"
import { Location } from "../../../lib/builtin/state"

class MeepPageMarker {}

// this system is used to spawn the UI elements initially
function spawnUi() {
    Commands.spawn(new MeepPageMarker(), new UiNode("h1"), new UiText("Meep?"))
}

function despawnUi() {
    for (const [entity] of query.root([Entity], query.and(MeepPageMarker))) {
        Commands.despawn(entity)
    }
}

export function MeepPlugin(app: App) {
    app
        // this system should run when the location changes to "/meep"
        .addSystem(OnEnter(Location.fromPath("/meep")), spawnUi)
        // this system should run when the location changes from "/" to something else
        .addSystem(OnExit(Location.fromPath("/meep")), despawnUi)
}
