import type { Plugin } from "./plugin"
import { inWorld, setCurrentWorld, World } from "./world"
import type { System } from "./system"
import { First, Last, PostStartup, PostUpdate, PreStartup, PreUpdate, type Schedule, Startup, Update } from "./schedule"
import { Time } from "./builtin"
import { Debug } from "./debug"
import type { State } from "./state"

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

    public insertState(stateValue: State): this {
        this.world.insertState(stateValue)
        return this
    }

    public addSystem(schedule: Schedule, system: System): this {
        this.world.addSystem(schedule, system)
        return this
    }

    public async run(): Promise<void> {
        setCurrentWorld(this.world)

        await Promise.all(this.world.getSystemsBySchedule(PreStartup).map((system) => system()))
        await Promise.all(this.world.getSystemsBySchedule(Startup).map((system) => system()))

        const transitions = this.world.applyNextState()
        if (transitions.enter.length) {
            for (const [schedule, systems] of this.world.getDynamicSystems()) {
                if (schedule([], transitions.enter)) {
                    await Promise.all(systems.map((system) => system()))
                }
            }
        }

        await Promise.all(this.world.getSystemsBySchedule(PostStartup).map((system) => system()))

        setCurrentWorld(null)

        const update = async (elapsed: number) => {
            setCurrentWorld(this.world)

            {
                const time = this.world.getResource(Time)
                time.delta = elapsed - time.elapsed
                time.elapsed = elapsed
            }

            await Promise.all(this.world.getSystemsBySchedule(First).map((system) => system()))

            await Promise.all(this.world.getSystemsBySchedule(PreUpdate).map((system) => system()))
            await Promise.all(this.world.getSystemsBySchedule(Update).map((system) => system()))
            await Promise.all(this.world.getSystemsBySchedule(PostUpdate).map((system) => system()))

            await Promise.all(this.world.getSystemsBySchedule(Last).map((system) => system()))

            const transitions = this.world.applyNextState()
            if (transitions.exit.length || transitions.enter.length) {
                for (const [schedule, systems] of this.world.getDynamicSystems()) {
                    if (schedule(transitions.exit, transitions.enter)) {
                        await Promise.all(systems.map((system) => system()))
                    }
                }
            }

            setCurrentWorld(null)
            requestAnimationFrame(update)
        }

        window.requestAnimationFrame(update)
    }
}
