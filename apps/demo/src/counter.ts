import {
    type App,
    Commands,
    Entity,
    HtmlTitle,
    inState,
    Location,
    OnEnter,
    OnExit,
    query,
    res,
    UiAnchor,
    UiButton,
    UiInteraction,
    UiNode,
    UiText,
    Update,
} from "@tsukinoko-kun/ecs.ts"
import { UiClassList } from "../../../lib/builtin/components/uiClassList"

// this resource is used to store the counter value
class Counter {
    public value = 0
}

// this component is used to mark the button for the counter
class CounterButtonMarker {}

class CounterPageMarker {}

function setTitle() {
    const t = res(HtmlTitle)
    t.title = "Counter example"
}

// this system is used to spawn the UI elements initially
function spawnUi() {
    Commands.spawn(
        new CounterPageMarker(),
        new UiNode("div"),
        new UiClassList(
            "bg-gray-300",
            "border",
            "border-gray-800",
            "rounded-md",
            "px-4",
            "py-2",
            "max-w-96",
            "mx-auto",
            "my-16",
            "flex",
            "flex-col",
            "items-center",
            "gap-md",
        ),
    ).withChildren((parent) => {
        parent.spawn(new UiNode("h1"), new UiText("Counter example"), new UiClassList("text-red-400", "text-4xl"))
        parent.spawn(new UiNode("p"), new UiText("This is a simple counter example using the ECS.ts library."))
        parent.spawn(
            new UiAnchor("https://github.com/tsukinoko-kun/ecs.ts"),
            new UiText("ECS.ts on GitHub"),
            new UiClassList("block", "text-blue-500", "hover:text-blue-700", "underline"),
        )
        parent.spawn(
            new UiAnchor("./meep"),
            new UiText("Meep"),
            new UiClassList("block", "text-blue-500", "hover:text-blue-700", "underline"),
        )
        parent.spawn(
            new UiButton(),
            new UiText("Click me!"),
            new UiInteraction(),
            new UiClassList(
                "px-4",
                "py-2",
                "border",
                "border-gray-800",
                "rounded-md",
                "bg-gray-400",
                "hover:bg-gray-500",
            ),
            new CounterButtonMarker(),
        )
    })
}

// this system is used to increment the counter value on button click
function incrementCounter() {
    for (const [btn] of query([UiInteraction], query.and(CounterButtonMarker))) {
        if (btn.clicked) {
            const counter = res(Counter)
            counter.value++
        }
    }
}

// this system is used to update the button text based on the current counter value
function updateButtonText() {
    const counter = res(Counter)
    for (const [text] of query([UiText], query.and(CounterButtonMarker))) {
        if (counter.value === 0) {
            text.value = "Click to start the counter!"
        } else {
            text.value = `Counter: ${counter.value}\nClick to increment further!`
        }
    }
}

function despawnUi() {
    for (const [entity] of query.root([Entity], query.and(CounterPageMarker))) {
        Commands.despawn(entity)
    }
}

// this plugin bundles everything that is needed for this counter example to work
export function CounterPlugin(app: App) {
    app.insertResource(new Counter())
        .addSystem(OnEnter(Location.fromPath("/")), setTitle)
        // this system should run when the location changes to "/"
        .addSystem(OnEnter(Location.fromPath("/")), spawnUi)
        // this systems should only run if the current location is "/"
        .addSystem(Update, incrementCounter.runIf(inState(Location.fromPath("/"))))
        .addSystem(Update, updateButtonText.runIf(inState(Location.fromPath("/"))))
        // this system should run when the location changes from "/" to something else
        .addSystem(OnExit(Location.fromPath("/")), despawnUi)
}
