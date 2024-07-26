import type { World } from "./world"
import type { Entity } from "./entity"
import { First, Last, PostStartup, PostUpdate, PreStartup, PreUpdate, Startup, Update } from "./schedule"
import { identDisplay } from "./identify"

export const Debug = {
    worlds: new Array<World>(),
}

function debugEntity(w: World, e: Entity): object {
    return {
        id: e.id,
        components: Array.from(w.getEntityComponents(e).keys()).map(identDisplay),
        children: e.children.map((child) => debugEntity(w, child)),
    }
}

function systemName(system: Function): string {
    return system.name || system.toString().match(/^function\s*([^\s(]+)/)?.[1] || "anonymous"
}

;(globalThis as any).__ecs_debug__ = () => ({
    worlds: Debug.worlds.map((world) => {
        const entities = world.getEntities().map((entity) => debugEntity(world, entity))
        let systems = {}
        for (const [schedule, systemList] of world.getSystems().entries()) {
            let s = schedule.toString()
            switch (schedule) {
                case PreStartup:
                    s = "PreStartup"
                    break
                case Startup:
                    s = "Startup"
                    break
                case PostStartup:
                    s = "PostStartup"
                    break
                case First:
                    s = "First"
                    break
                case PreUpdate:
                    s = "PreUpdate"
                    break
                case Update:
                    s = "PostStartup"
                    break
                case PostUpdate:
                    s = "PostUpdate"
                    break
                case Last:
                    s = "Last"
                    break
            }
            // @ts-ignore
            systems[s] = systemList.map((system) => systemName(system))
        }
        const state = Array.from(world.getStates()).map((s) => JSON.parse(JSON.stringify(s)))
        return { entities, systems, state }
    }),
})
