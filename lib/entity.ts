import type { Component } from "./component"
import { useWorld } from "./world"

export class Entity {
    private static current = 0
    public readonly children = new Array<Entity>()
    private readonly id: number

    public constructor() {
        this.id = Entity.current++
    }

    public withChildren(children: (builder: ChildBuilder) => void): Entity {
        children(new ChildBuilder(this))
        return this
    }
}

export class ChildBuilder {
    private readonly entity: Entity

    public constructor(entity: Entity) {
        this.entity = entity
    }

    public spawn(...components: Component[]): Entity {
        const world = useWorld()
        const entity = new Entity()
        this.entity.children.push(entity)
        world.addComponents(entity, ...components)
        return entity
    }
}
