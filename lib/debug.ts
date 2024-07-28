import type { World } from "./world"
import type { Entity } from "./entity"
import { First, Last, PostStartup, PostUpdate, PreStartup, PreUpdate, Startup, Update } from "./schedule"
import { identDisplay } from "./identify"
import { err, type ErrorTuple, ok } from "./err"

export const Debug = {
    worlds: new Array<World>(),
}

export function insertDebugObject<T extends object>(key: string, obj: T): ErrorTuple<T> {
    {
        let d: Record<string, object | Record<string, object>> = Debug
        const path = key.split(".")
        for (let i = 0; i < path.length - 1; i++) {
            const k = path[i]!
            if (!(k in d)) {
                d[k] = {}
            }
            d = d[k] as Record<string, object | Record<string, object>>
        }
        if (path[path.length - 1]! in d) {
            return err(`failed to insert debug object, key "${key}" already exists`)
        }
        d[path[path.length - 1]!] = obj
    }
    return ok(obj)
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

;(globalThis as any).__ecs_debug__ = (all = false) =>
    all
        ? Debug
        : {
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
          }
