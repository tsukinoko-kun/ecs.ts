# ECS.ts

Strongly inspired by Bevy

```ts
import { App, Commands, DefaultPlugin, HtmlPlugin, Schedule, UiNode, UiText } from "@tsukinoko-kun/ecs.ts"

const app = new App()

app.addPlugin(DefaultPlugin)
    .addPlugin(HtmlPlugin("#app"))
    .addPlugin((world) => {
        world.addSystem(Schedule.Start, () => {
            Commands.spawn(new UiNode()).withChildren((parent) => {
                parent.spawn(new UiText("meep"))
            })

            Commands.spawn(new UiText("hello world"))
        })
    })

app.run()
```
