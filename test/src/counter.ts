import {
    Commands,
    query,
    res,
    Schedule,
    UiButton,
    UiInteraction,
    UiNode,
    UiStyle,
    UiText,
    type World,
} from "@tsukinoko-kun/ecs.ts"

class Counter {
    public value = 0
}

class CounterMarker {}

function spawnUi() {
    Commands.spawn(
        new UiNode(),
        new UiStyle()
            .set("backgroundColor", "whitesmoke")
            .set("border", "solid 1px gray")
            .set("padding", "0.5rem 1rem")
            .set("margin", "1rem 0"),
    ).withChildren((parent) => {
        parent.spawn(new UiText("a"), new UiStyle().set("color", "red"))
        parent.spawn(new UiText("b"), new UiStyle().set("color", "blue"))
        parent.spawn(new UiText("c"), new UiStyle().set("color", "green"))
    })

    Commands.spawn(new CounterMarker(), new UiButton(), new UiText("Click me!"), new UiInteraction())
}

function incrementCounter() {
    for (const [btn] of query([UiInteraction], query.and(CounterMarker))) {
        if (btn.clicked) {
            const counter = res(Counter)
            counter.value++
        }
    }
}

function updateButtonText() {
    const counter = res(Counter)
    for (const [text] of query([UiText], query.and(CounterMarker))) {
        if (counter.value === 0) {
            text.value = "Press 'b' to increment the counter!"
        } else {
            text.value = `Counter: ${counter.value}\nPress 'b' to increment further!`
        }
    }
}

export function counterPlugin(world: World) {
    world.insertResource(new Counter())
    world.addSystem(Schedule.Start, spawnUi)
    world.addSystem(Schedule.Update, incrementCounter)
    world.addSystem(Schedule.Update, updateButtonText)
}
