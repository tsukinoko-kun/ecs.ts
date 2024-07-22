import type { Plugin } from "./plugin"
import { setCurrentWorld, World } from "./world"
import type { System } from "./system"
import { Schedule } from "./schedule"
import { Time } from "./builtin/resources/time"

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

    public run(): void {
        setCurrentWorld(this.world)

        for (const system of this.world.getSystemsBySchedule(Schedule.PreStart)) {
            system()
        }
        for (const system of this.world.getSystemsBySchedule(Schedule.Start)) {
            system()
        }
        for (const system of this.world.getSystemsBySchedule(Schedule.PostStart)) {
            system()
        }

        setCurrentWorld(null)

        const update = (elapsed: number) => {
            setCurrentWorld(this.world)

            {
                const time = this.world.getResourceSafe(Time)
                if (time) {
                    time.delta = elapsed - time.elapsed
                    time.elapsed = elapsed
                }
            }

            for (const system of this.world.getSystemsBySchedule(Schedule.PreUpdate)) {
                system()
            }
            for (const system of this.world.getSystemsBySchedule(Schedule.Update)) {
                system()
            }
            for (const system of this.world.getSystemsBySchedule(Schedule.PostUpdate)) {
                system()
            }
            setCurrentWorld(null)
            requestAnimationFrame(update)
        }

        window.requestAnimationFrame(update)
    }
}
