import type { Plugin } from "../../plugin"
import { LogicalButtonInput, PhysicalButtonInput, Time } from "../resources"

export const DefaultPlugin: Plugin = (world) => {
    world.insertResource(new Time())
    world.insertResource(new LogicalButtonInput())
    world.insertResource(new PhysicalButtonInput())
}
