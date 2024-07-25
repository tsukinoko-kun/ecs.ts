import type { World } from "./world"
import type { Entity } from "./entity"
import { Schedule } from "./schedule"

export const Debug = {
    worlds: new Array<World>(),
}

function symbolDisplayName(symbol: symbol): string {
    return symbol.toString().replace(/^Symbol\((.*)\)$/, "$1")
}

function debugEntity(w: World, e: Entity): object {
    return {
        id: e.id,
        components: Array.from(w.getEntityComponents(e).keys()).map(symbolDisplayName),
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
            const s = typeof schedule === "string" ? schedule : Schedule[schedule]
            // @ts-ignore
            systems[s] = systemList.map((system) => systemName(system))
        }
        return { entities, systems }
    }),
})
