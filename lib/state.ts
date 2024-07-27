import { useWorld } from "./world"
import { type DeepReadonly, eq, type Eq } from "./traits"

export type State = object & Eq

/**
 * Access a state object.
 */
export function state<T extends State>(type: { new (...args: any[]): T }): DeepReadonly<T> & State {
    const world = useWorld()
    return world.getState(type) as DeepReadonly<T> & State
}

export function nextState(value: State): void {
    const world = useWorld()
    return world.nextState(value)
}

export function inState<T extends State>(value: T): () => boolean {
    return () => {
        const s = state((value as { constructor: { new (...args: any[]): T } }).constructor)
        return eq<State>(s, value)
    }
}
