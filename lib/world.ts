import { Entity } from "./entity"
import { type Component } from "./component"
import type { System } from "./system"
import type { DynamicSchedule, Schedule, StaticSchedule } from "./schedule"
import { type Ident, identDisplay, identify } from "./identify"
import { eq } from "./traits"
import type { State } from "./state"

let currentWorld: World | null = null

/** @internal */
export function setCurrentWorld(world: World | null) {
    if (currentWorld && world && currentWorld !== world) {
        throw new Error(
            "Tried to set the world context while it was already set. The reason for this is likely because there are multiple worlds being used at the same time.",
        )
    }
    currentWorld = world
}

export function useWorld(): World {
    if (!currentWorld) {
        throw new Error("it seems you are trying to use the world outside of a system")
    }
    return currentWorld
}

export function inWorld(world: World, fn: (world: World) => void): void {
    const oldWorld = currentWorld
    setCurrentWorld(world)
    fn(world)
    setCurrentWorld(oldWorld)
}

export class World {
    private readonly entities = new Array<Entity>()
    private readonly components = new Map<Entity, Map<Ident, Component>>()
    private readonly staticSystems = new Map<StaticSchedule, Array<System>>()
    private readonly dynamicSystems = new Array<[DynamicSchedule, System[]]>()
    private readonly resources = new Map<Ident, Object>()
    private readonly state = new Map<Ident, State>()
    private _nextStates = new Map<Ident, State>()

    public getSystems(): ReadonlyMap<StaticSchedule, ReadonlyArray<System>> {
        return this.staticSystems
    }

    public getSystemsBySchedule(schedule: StaticSchedule): ReadonlyArray<System> {
        return this.staticSystems.get(schedule) ?? []
    }

    public getDynamicSystems(): ReadonlyArray<[DynamicSchedule, System[]]> {
        return this.dynamicSystems
    }

    public getEntities(): ReadonlyArray<Entity> {
        return this.entities
    }

    public getAllEntities(): IterableIterator<Entity> {
        return this.components.keys()
    }

    public getEntityById(id: number | string): Entity {
        for (const e of this.getAllEntities()) {
            if (e.id == id || e.toString() == id) {
                return e
            }
        }
        throw new Error(`Entity with id ${id} not found in world`)
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
            throw new Error(`Resource ${t.name} does not exist in the world`)
        }
        return r as T
    }

    public getState<T>(t: { new (...args: any[]): T }): T {
        const s = this.state.get(identify(t))
        if (!s) {
            throw new Error(`State ${t.name} does not exist in the world`)
        }
        return s as T
    }

    public getStates(): IterableIterator<State> {
        return this.state.values()
    }

    /** @internal */
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

    public despawn(e: Entity, keepChildren = false): void {
        if (!this.doesEntityExist(e, true)) {
            throw new Error(`Entity ${e} does not exist in the world`)
        }

        if (this.components.has(e)) {
            this.components.delete(e)
        }

        for (let i = 0; i < this.entities.length; i++) {
            if (this.entities[i]!.id === e.id) {
                this.entities.splice(i, 1)
                break
            }
        }

        if (!keepChildren) {
            for (const entity of this.getAllEntities()) {
                const childIndex = entity.children.indexOf(e)
                if (childIndex >= 0) {
                    entity.children.splice(childIndex, 1)
                }
            }
        }
    }

    public addSystem(schedule: Schedule, ...system: System[]): void {
        if (typeof schedule === "number" && Number.isInteger(schedule)) {
            if (!this.staticSystems.has(schedule)) {
                this.staticSystems.set(schedule, [])
            }
            this.staticSystems.get(schedule)!.push(...system)
        } else if (typeof schedule === "function") {
            this.dynamicSystems.push([schedule, system])
        } else {
            throw new Error(`Invalid schedule ${schedule}`)
        }
    }

    public insertResource<T extends Object>(r: T): void {
        this.resources.set(identify(r), r)
    }

    public insertState(stateValue: State): void {
        this.state.set(identify(stateValue), stateValue)
        this._nextStates.set(identify(stateValue), stateValue)
    }

    public nextState(stateValue: State): void {
        const i = identify(stateValue)
        if (this.state.has(i)) {
            const old = this.state.get(i)!
            if (!eq(old, stateValue)) {
                this._nextStates.set(i, stateValue)
            } else {
                console.warn(`State ${identDisplay(i)} was set to the same value`)
            }
        } else {
            throw new Error(`State ${identDisplay(i)} does not exist in the world`)
        }
    }

    /** @internal */
    public applyNextState(): { enter: ReadonlyArray<State>; exit: ReadonlyArray<State> } {
        const enter = new Array<State>()
        const exit = new Array<State>()
        for (const [i, state] of this._nextStates) {
            exit.push(this.state.get(i)!)
            this.state.set(i, state)
            enter.push(state)
        }
        this._nextStates.clear()
        return { enter, exit }
    }
}
