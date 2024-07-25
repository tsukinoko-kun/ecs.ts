import type { Plugin } from "./plugin"
import { inWorld, setCurrentWorld, World } from "./world"
import type { System } from "./system"
import { Schedule } from "./schedule"
import { Time } from "./builtin"
import { Debug } from "./debug"

export class App {
    private readonly plugins = new Array<Plugin>()
    private readonly world = new World()

    public constructor() {
        this.insertResource(new Time())
        Debug.worlds.push(this.world)
    }

    public addPlugin(plugin: Plugin): this {
        inWorld(this.world, () => {
            plugin(this)
        })
        return this
    }

    public insertResource(resource: Object): this {
        this.world.insertResource(resource)
        return this
    }

    public addSystem(schedule: Schedule, system: System): this {
        this.world.addSystem(schedule, system)
        return this
    }

    public async run(): Promise<void> {
        setCurrentWorld(this.world)

        await Promise.all(this.world.getSystemsBySchedule(Schedule.PreStartup).map((system) => system()))
        await Promise.all(this.world.getSystemsBySchedule(Schedule.Startup).map((system) => system()))
        await Promise.all(this.world.getSystemsBySchedule(Schedule.PostStartup).map((system) => system()))

        setCurrentWorld(null)

        const update = async (elapsed: number) => {
            setCurrentWorld(this.world)

            {
                const time = this.world.getResource(Time)
                time.delta = elapsed - time.elapsed
                time.elapsed = elapsed
            }

            await Promise.all(this.world.getSystemsBySchedule(Schedule.First).map((system) => system()))

            await Promise.all(this.world.getSystemsBySchedule(Schedule.PreUpdate).map((system) => system()))
            await Promise.all(this.world.getSystemsBySchedule(Schedule.Update).map((system) => system()))
            await Promise.all(this.world.getSystemsBySchedule(Schedule.PostUpdate).map((system) => system()))

            await Promise.all(this.world.getSystemsBySchedule(Schedule.Last).map((system) => system()))

            setCurrentWorld(null)
            requestAnimationFrame(update)
        }

        window.requestAnimationFrame(update)
    }
}
