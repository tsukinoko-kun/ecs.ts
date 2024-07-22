import { useWorld } from "./world"

export function res<T>(type: { new (...args: any[]): T }): T {
    const world = useWorld()
    return world.getResource(type)
}
