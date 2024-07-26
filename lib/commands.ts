import type { Component } from "./component"
import { useWorld } from "./world"
import type { Entity } from "./entity"
import { identify } from "./identify"

export const Commands = {
    spawn(...components: Component[]): Entity {
        const world = useWorld()
        return world.spawn(...components)
    },
    despawn(entity: Entity, keepChildren = false): void {
        const world = useWorld()
        world.despawn(entity, keepChildren)
    },
    addComponents(entity: Entity, ...components: Component[]): void {
        const world = useWorld()
        world.addComponents(entity, ...components)
    },
    insertResource<T extends Object>(resource: T): void {
        const world = useWorld()
        world.insertResource(resource)
    },
    getEntityById(id: number | string): Entity {
        const world = useWorld()
        return world.getEntityById(id)
    },
    components(entity: Entity): IterableIterator<Component> {
        const world = useWorld()
        return world.getEntityComponents(entity).values()
    },
    component<T extends Component>(entity: Entity, type: { new (...args: any[]): T }): T | undefined {
        const world = useWorld()
        return world.getComponents().get(entity)?.get(identify(type)) as T | undefined
    },
}
