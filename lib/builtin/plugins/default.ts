import type { Plugin } from "../../plugin"
import { LogicalButtonInput, PhysicalButtonInput } from "../resources"
import { Last } from "../../schedule"
import { resetLogicalButtonInput, resetPhysicalButtonInput } from "../systems"

export const DefaultPlugin: Plugin = (app) => {
    app.insertResource(new LogicalButtonInput())
        .insertResource(new PhysicalButtonInput())
        .addSystem(Last, resetLogicalButtonInput)
        .addSystem(Last, resetPhysicalButtonInput)
}
