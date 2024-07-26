import type { State } from "./state"
import { eq } from "./traits"

export type Schedule = StaticSchedule | DynamicSchedule

export type StaticSchedule = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

export const PreStartup: StaticSchedule = 0
export const Startup: StaticSchedule = 1
export const PostStartup: StaticSchedule = 2
export const First: StaticSchedule = 3
export const PreUpdate: StaticSchedule = 4
export const Update: StaticSchedule = 5
export const PostUpdate: StaticSchedule = 6
export const Last: StaticSchedule = 7

export type DynamicSchedule = (prev: ReadonlyArray<State>, next: ReadonlyArray<State>) => boolean

export function OnEnter(state: State): DynamicSchedule {
    return (_, next) => {
        for (const nextS of next) {
            if (eq(nextS, state)) {
                return true
            }
        }
        return false
    }
}

export function OnExit(state: State): DynamicSchedule {
    return (prev, _) => {
        for (const prevS of prev) {
            if (eq(prevS, state)) {
                return true
            }
        }
        return false
    }
}

export function OnTransition<T extends State>(from: T, to: T): DynamicSchedule {
    return (prev, next) => {
        let fromFound = false
        for (const prevS of prev) {
            if (eq(prevS, from)) {
                fromFound = true
            }
        }
        if (!fromFound) {
            return false
        }

        for (const nextS of next) {
            if (eq(nextS, to)) {
                return true
            }
        }
        return false
    }
}
