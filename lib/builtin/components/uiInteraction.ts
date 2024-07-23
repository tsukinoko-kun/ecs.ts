export class UiInteraction {
    private _pressed = false

    public get pressed(): boolean {
        return this._pressed
    }

    public triggerDown() {
        this._pressed = true
    }

    public triggerUp() {
        this._pressed = false
    }
}
