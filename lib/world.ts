import { Entity } from "./entity"
import { type Component } from "./component"
import type { System } from "./system"
import { Schedule } from "./schedule"
import { type Ident, identify } from "./identify"

let currentWorld: World | null = null

/** @internal */
export function setCurrentWorld(world: World | null) {
    currentWorld = world
}

export function useWorld(): World {
    if (!currentWorld) {
        throw new Error("it seems you are trying to use the world outside of a system")
    }
    return currentWorld
}

export class World {
    private readonly entities = new Array<Entity>()
    private readonly components = new Map<Entity, Map<Ident, Component>>()
    private readonly systems = new Map<Schedule, Array<System>>()
    private readonly resources = new Map<Ident, Object>()

    public getSystems(): ReadonlyMap<Schedule, ReadonlyArray<System>> {
        return this.systems
    }

    public getSystemsBySchedule(schedule: Schedule): ReadonlyArray<System> {
        for (const [regSchedule, regSystem] of this.systems) {
            if (regSchedule === schedule) {
                return regSystem
            }
        }
        return []
    }

    public getEntities(): ReadonlyArray<Entity> {
        return this.entities
    }

    public getComponents(): ReadonlyMap<Entity, ReadonlyMap<Ident, Component>> {
        return this.components
    }

    public getEntityComponents(e: Entity): ReadonlyMap<Ident, Component> {
        if (!this.components.has(e)) {
            throw new Error(`Entity ${e} does not exist in the world`)
        }
        return this.components.get(e) ?? new Map()
    }

    public getResourceSafe<T extends Object>(t: { new (...args: any[]): T }): T | undefined {
        return this.resources.get(identify(t)) as T | undefined
    }

    public getResource<T>(t: { new (...args: any[]): T }): T {
        const r = this.resources.get(identify(t))
        if (!r) {
            throw new Error(`Resource ${t.name} does not exist`)
        }
        return r as T
    }

    public spawnEmpty(): Entity {
        const e = new Entity()
        this.entities.push(e)
        return e
    }

    public doesEntityExist(e: Entity, searchChildren: boolean): boolean {
        if (this.entities.includes(e)) {
            return true
        }

        if (!searchChildren) {
            return false
        }

        for (const entity of this.entities) {
            if (entity.children.includes(e)) {
                return true
            }
        }

        return false
    }

    public addComponent(e: Entity, component: Component): void {
        if (!this.doesEntityExist(e, true)) {
            throw new Error(`Entity ${e} does not exist in the world`)
        }

        if (!this.components.has(e)) {
            this.components.set(e, new Map())
        }
        this.components.get(e)!.set(identify(component), component)
    }

    public addComponents(e: Entity, ...components: Component[]): void {
        if (!this.doesEntityExist(e, true)) {
            throw new Error(`Entity ${e} does not exist in the world`)
        }

        if (!this.components.has(e)) {
            this.components.set(e, new Map())
        }
        for (const component of components) {
            this.components.get(e)!.set(identify(component), component)
        }
    }

    public spawn(...components: Component[]): Entity {
        const e = this.spawnEmpty()
        const entityComponents = new Map<Ident, Component>()
        for (const component of components) {
            entityComponents.set(identify(component), component)
        }
        this.components.set(e, entityComponents)
        return e
    }

    public addSystem(schedule: Schedule, system: System): void {
        if (!this.systems.has(schedule)) {
            this.systems.set(schedule, [])
        }
        this.systems.get(schedule)!.push(system)
    }

    public insertResource<T extends Object>(r: T): void {
        this.resources.set(identify(r), r)
    }
}
