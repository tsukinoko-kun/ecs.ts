import type { Plugin } from "./plugin"
import { inWorld, setCurrentWorld, World } from "./world"
import type { System } from "./system"
import { Schedule } from "./schedule"
import { Time } from "./builtin"

export class App {
    private readonly plugins = new Array<Plugin>()
    private readonly world = new World()

    public addPlugin(plugin: Plugin): this {
        inWorld(this.world, () => {
            plugin(this)
        })
        return this
    }

    public addSystem(schedule: Schedule, system: System): this {
        this.world.addSystem(schedule, system)
        return this
    }

    public async run(): Promise<void> {
        setCurrentWorld(this.world)

        for (const system of this.world.getSystemsBySchedule(Schedule.PreStartup)) {
            await system()
        }
        for (const system of this.world.getSystemsBySchedule(Schedule.Startup)) {
            await system()
        }
        for (const system of this.world.getSystemsBySchedule(Schedule.PostStartup)) {
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

            for (const system of this.world.getSystemsBySchedule(Schedule.First)) {
                await system()
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

            for (const system of this.world.getSystemsBySchedule(Schedule.Last)) {
                await system()
            }

            setCurrentWorld(null)
            requestAnimationFrame(update)
        }

        window.requestAnimationFrame(update)
    }
}
