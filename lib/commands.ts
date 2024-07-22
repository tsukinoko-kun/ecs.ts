import type { Component } from "./component"
import { useWorld } from "./world"
import type { Entity } from "./entity"

export const Commands = {
    spawn(...components: Component[]): Entity {
        const world = useWorld()
        return world.spawn(...components)
    },
    insertResource<T extends Object>(resource: T): void {
        const world = useWorld()
        world.insertResource(resource)
    },
    trigger(event: Event) {},
    components(entity: Entity): IterableIterator<Component> {
        const world = useWorld()
        return world.getEntityComponents(entity).values()
    },
}
