import type { Component } from "./component"
import { useWorld } from "./world"
import type { Equals } from "./traits"

export class Entity implements Equals {
    private static current = 0
    public readonly children = new Array<Entity>()
    public readonly id: number

    public constructor() {
        this.id = Entity.current++
    }

    public withChildren(children: (builder: ChildBuilder) => void): Entity {
        children(new ChildBuilder(this))
        return this
    }

    public toString(): string {
        return `Entity(${this.id})`
    }

    public equals(other: Entity): boolean {
        return this.id === other.id
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
