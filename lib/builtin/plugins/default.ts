import type { Plugin } from "../../plugin"
import { Time } from "../resources/time"

export const DefaultPlugin: Plugin = (world) => {
    world.insertResource(new Time())
}
