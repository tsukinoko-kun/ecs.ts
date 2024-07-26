import { useWorld } from "./world"

export function res<T extends Object>(type: { new (...args: any[]): T }): T {
    const world = useWorld()
    return world.getResource(type)
}
