import type { Plugin } from "../../plugin"
import { LogicalButtonInput, PhysicalButtonInput, Time } from "../resources"
import { Schedule } from "../../schedule"
import { resetLogicalButtonInput, resetPhysicalButtonInput } from "../systems/buttonInput"
import { Commands } from "../../commands"

export const DefaultPlugin: Plugin = (app) => {
    Commands.insertResource(new Time())
    Commands.insertResource(new LogicalButtonInput())
    Commands.insertResource(new PhysicalButtonInput())
    app.addSystem(Schedule.Last, resetLogicalButtonInput)
    app.addSystem(Schedule.Last, resetPhysicalButtonInput)
}
