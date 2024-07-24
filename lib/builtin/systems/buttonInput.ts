import { res } from "../../resource"
import { LogicalButtonInput, PhysicalButtonInput } from "../resources"

export function resetPhysicalButtonInput() {
    const pbi = res(PhysicalButtonInput)
    pbi.clear()
}

export function resetLogicalButtonInput() {
    const lbi = res(LogicalButtonInput)
    lbi.clear()
}
