import type { Plugin } from "./plugin"
import { setCurrentWorld, World } from "./world"
import type { System } from "./system"
import { Schedule } from "./schedule"
import { Time } from "./builtin/resources/time"
import { LogicalButtonInput, PhysicalButtonInput, UiInteraction } from "./builtin"
import { query } from "./query"

export class App {
    private readonly plugins = new Array<Plugin>()
    private readonly world = new World()

    public addPlugin(plugin: Plugin): this {
        plugin(this.world)
        return this
    }

    public addSystem(schedule: Schedule, system: System): this {
        this.world.addSystem(schedule, system)
        return this
    }

    public async run(): Promise<void> {
        setCurrentWorld(this.world)

        for (const system of this.world.getSystemsBySchedule(Schedule.PreStart)) {
            await system()
        }
        for (const system of this.world.getSystemsBySchedule(Schedule.Start)) {
            await system()
        }
        for (const system of this.world.getSystemsBySchedule(Schedule.PostStart)) {
            await system()
        }

        setCurrentWorld(null)

        const update = async (elapsed: number) => {
            setCurrentWorld(this.world)

            {
                const time = this.world.getResourceSafe(Time)
                if (time) {
                    time.delta = elapsed - time.elapsed
                    time.elapsed = elapsed
                }
            }

            for (const system of this.world.getSystemsBySchedule(Schedule.PreUpdate)) {
                await system()
            }
            for (const system of this.world.getSystemsBySchedule(Schedule.Update)) {
                await system()
            }
            for (const system of this.world.getSystemsBySchedule(Schedule.PostUpdate)) {
                await system()
            }

            // cleanup builtins
            {
                const pb = this.world.getResourceSafe(PhysicalButtonInput)
                if (pb) {
                    pb.clear()
                }

                const lb = this.world.getResourceSafe(LogicalButtonInput)
                if (lb) {
                    lb.clear()
                }

                for (const [interaction] of query([UiInteraction])) {
                    interaction.resetClick()
                }
            }

            setCurrentWorld(null)
            requestAnimationFrame(update)
        }

        window.requestAnimationFrame(update)
    }
}
