import type { Plugin } from "../../plugin"
import { LogicalButtonInput, PhysicalButtonInput } from "../resources"
import { Last } from "../../schedule"
import { resetLogicalButtonInput, resetPhysicalButtonInput } from "../systems/buttonInput"
import { Commands } from "../../commands"

export const DefaultPlugin: Plugin = (app) => {
    Commands.insertResource(new LogicalButtonInput())
    Commands.insertResource(new PhysicalButtonInput())
    app.addSystem(Last, resetLogicalButtonInput)
    app.addSystem(Last, resetPhysicalButtonInput)
}
