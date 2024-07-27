# ECS.ts

Strongly inspired by Bevy

## Installation

```shell
npm i @tsukinoko-kun/ecs.ts
```

```shell
pnpm add @tsukinoko-kun/ecs.ts
```

## Build

ECS.ts comes with a build script that is based on Vite and JSDOM.  
You can of course use your own build system if you want.
Just keep in mind that ECS.ts is written in TypeScript and is not shipping any JavaScript files.

You can use a `vite.config.ts` file to configure the build process.  
By default, ECS.ts expects a `src` folder with an `index.html` as entry point.

```json
{
    "scripts": {
        "dev": "ecs dev",
        "build": "ecs build"
    }
}
```

## Concepts

### World

The world is the main container for all entities, components, resources, and systems.

Inside a system you can access the world through the `useWorld` function.
But you should only use it if you really need to.  
Use `Commands`, `query` and `res` to interact with the world.

### Entity

An entity is a unique identifier for a collection of components.
It doesn't have any data or logic, it is just an ID.

An entity can have multiple children.

To create an entity, use the `Commands.spawn` function and pass in the components you want to attach.

```ts
Commands.spawn(new MyComponent1(), new MyComponent2())
```

To create a child entity, use the `withChildren` function.

```ts
Commands.spawn(new MyComponent1()).withChildren((parent) => {
    parent.spawn(new MyComponent2())
})
```

### Component

A component is a piece of data that is associated with an entity.
It is just a plain data class with no logic.

Write your components as classes (not object notation `{}`), this is important for the ECS to work correctly.

A component instance can only be attached once per entity.
If you try to attach multiple instances of the same component to an entity,
the last one will overwrite the previous ones.  
Nothing stops you from attaching the same component to multiple entities,
but you really shouldn't do that.

### System

A system is the only place where you should put your logic.
It is just a function that gets called on a specified schedule.

To add a system to the world, use the `addSystem` function.

```ts
world.addSystem(Schedule.Update, mySystem)
```

### Schedule

When adding a system to the world, you can specify on which schedule it should run.

-   `Schedule.PreStartup` runs once and is the first system to run
-   `Schedule.Startup` runs once at the start of the application
-   `Schedule.PostStartup` runs once and is the last system to run during the startup phase
-   `Schedule.First` is the first system to run every frame
-   `Schedule.PreUpdate` runs every frame before the update systems
-   `Schedule.Update` runs every frame
-   `Schedule.PostUpdate` runs every frame after the update systems
-   `Schedule.Last` is the last schedule to run every frame and is meant for cleanup tasks

### Resource

A resource is a piece of data that is shared across all systems.
It is also persistent across the entire application lifetime.

Write your resources as classes (not object notation {}), this is important for the ECS to work correctly.

Accessing a resource is done through the `res` function.  
This function errors if the resource is not found.

```ts
const myResource = res(MyResource)
```

Register a resource with the world using the `insertResource` function.

```ts
Commands.insertResource(new MyResource())
```

### State

The state is a way to store the overall state of the application.  
This is very similar to resources,
but the state is used to specify which systems should run
while the resources are used to store data used by the systems.

You can only use classes (not object notation `{}`) as state which implement the `Eq` type
(`Equals` or `Comparable` interface).  
You can have multiple types of state at the same time.

To create a state, use `app.insertState` and pass in the state value.

```ts
class MyState implements Equals {
    public value = 0

    public constructor(value: number) {
        this.value = value
    }

    public static default() {
        return new MyState(0)
    }

    public equals(other: MyState): boolean {
        return this.value === other.value
    }
}

export function MyPlugin(app: App) {
    app.insertState(new MyState(0))
}
```

To access the state, use the `state` function. The returned object is read-only.

```ts
function mySystem() {
    const myState = state(MyState)
    console.log(myState.value)
}
```

The main use case for the state is to control which systems should run based on the current state value.
You can use the state in the Schedule (for transitions), in the system itself (for conditional execution) or combine both.

```ts
export function MyPlugin(app: App) {
    app.addSystem(OnEnter(new MyState(1)), fooSystem)
        .addSystem(Update, barSystem.runIf(inState(new MyState(1))))
        .addSystem(OnExit(new MyState(1)), bazSystem)
        .addSystem(OnTransition(new MyState(1), new MyState(2)), quxSystem)
}
```

Use `nextState` to change the state.  
The change is not immediate, it will only take effect after the current frame.

```ts
function mySystem() {
    nextState(new MyState(1))
}
```

### Query

A query is a way to filter entities based on their components.

The query takes a tuple of components (and optional filters) and returns an iterator over the entity component tuples
that match the query.

You can only use the query inside a system.

```ts
function mySystem() {
    for (const [comp1, comp2] of query([Component1, Component2])) {
        // do something with comp1 and comp2
    }

    // use filters to further narrow down the results
    for (const [comp1] of query([Component1], query.and(Component2, Component3))) {
        // do something with comp
    }

    // you can also exclude components from the query
    for (const [comp1] of query([Component1], query.not(Component2))) {
        // do something with comp
    }

    // you can also use a combination of filters
    for (const [comp1] of query([Component1], query.and(Component2), query.not(Component3))) {
        // do something with comp1
    }

    // it you need the entity itself, you can use the `Entity` type
    for (const [entity, comp1] of query([Entity, Component1])) {
        // do something with entity and comp1
    }
}
```

### Commands

The commands are used to interact with the world from within a system.

-   `Commands.spawn` creates a new entity with the specified components
-   `Commands.despawn` removes an entity and all its children
-   `Commands.addComponents` adds components to an existing entity
-   `Commands.insertResource` inserts a resource into the world
-   `Commands.getEntityById` gets an entity by its ID (numeric or string)
-   `Commands.components` gets all components of an entity

## Basic Example

Live at: https://tsukinoko-kun.github.io/ecs.ts/

Full source at: https://github.com/tsukinoko-kun/ecs.ts/tree/main/apps/demo

```ts
// index.ts
import { App, DefaultPlugin, HtmlPlugin, RouterPlugin } from "@tsukinoko-kun/ecs.ts"
import { CounterPlugin } from "./counter"
import { MeepPlugin } from "./meep"

const app = new App()

app
    // the DefaultPlugin is for basic functionality like input handling
    .addPlugin(DefaultPlugin)
    // the HtmlPlugin is for rendering the UI to the DOM
    .addPlugin(HtmlPlugin("#app"))
    // the RouterPlugin is for working with the browser's location (URL)
    // use RouterPlugin for using it without a base path and RouterPlugin.withBasePath for using it with a base path
    .addPlugin(RouterPlugin.withBasePath("/ecs.ts/"))
    // user plugins
    .addPlugin(CounterPlugin)
    .addPlugin(MeepPlugin)

app.run()
```

```ts
// counter.ts
import {
    type App,
    Commands,
    Entity,
    inState,
    OnEnter,
    OnExit,
    query,
    res,
    UiAnchor,
    UiButton,
    UiInteraction,
    UiNode,
    UiStyle,
    UiText,
    Update,
} from "@tsukinoko-kun/ecs.ts"
import { Location } from "../../../lib/builtin/state"

// this resource is used to store the counter value
class Counter {
    public value = 0
}

// this component is used to mark the button for the counter
class CounterButtonMarker {}

class CounterPageMarker {}

// this system is used to spawn the UI elements initially
function spawnUi() {
    Commands.spawn(
        new CounterPageMarker(),
        new UiNode("div"),
        new UiStyle()
            .set("backgroundColor", "#f5f5f540")
            .set("border", "solid 1px #202020")
            .set("padding", "0.5rem 1rem")
            .set("maxWidth", "64rem")
            .set("margin", "4rem auto")
            .set("display", "flex")
            .set("flexDirection", "column")
            .set("alignItems", "center")
            .set("gap", "0.5rem"),
    ).withChildren((parent) => {
        parent.spawn(new UiNode("h1"), new UiText("Counter example"), new UiStyle().set("fontSize", "1.5rem"))
        parent.spawn(new UiNode("p"), new UiText("This is a simple counter example using the ECS.ts library."))
        parent.spawn(
            new UiAnchor("https://github.com/tsukinoko-kun/ecs.ts"),
            new UiText("ECS.ts on GitHub"),
            new UiStyle().set("display", "block"),
        )
        parent.spawn(new UiAnchor("./meep"), new UiText("Meep"))
        parent.spawn(
            new UiButton(),
            new UiText("Click me!"),
            new UiInteraction(),
            new UiStyle().set("maxWidth", "16rem").set("padding", "0.5rem 1rem").set("border", "solid 1px #202020"),
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
    Commands.insertResource(new Counter())

    app
        // this system should run when the location changes to "/"
        .addSystem(OnEnter(Location.fromPath("/")), spawnUi)
        // this systems should only run if the current location is "/"
        .addSystem(Update, incrementCounter.runIf(inState(Location.fromPath("/"))))
        .addSystem(Update, updateButtonText.runIf(inState(Location.fromPath("/"))))
        // this system should run when the location changes from "/" to something else
        .addSystem(OnExit(Location.fromPath("/")), despawnUi)
}
```

```ts
// meep.ts
import { type App, Commands, Entity, OnEnter, OnExit, query, UiNode, UiText } from "@tsukinoko-kun/ecs.ts"
import { Location } from "../../../lib/builtin/state"

class MeepPageMarker {}

// this system is used to spawn the UI elements initially
function spawnUi() {
    Commands.spawn(new MeepPageMarker(), new UiNode("h1"), new UiText("Meep?"))
}

function despawnUi() {
    for (const [entity] of query.root([Entity], query.and(MeepPageMarker))) {
        Commands.despawn(entity)
    }
}

export function MeepPlugin(app: App) {
    app
        // this system should run when the location changes to "/meep"
        .addSystem(OnEnter(Location.fromPath("/meep")), spawnUi)
        // this system should run when the location changes from "/" to something else
        .addSystem(OnExit(Location.fromPath("/meep")), despawnUi)
}
```
