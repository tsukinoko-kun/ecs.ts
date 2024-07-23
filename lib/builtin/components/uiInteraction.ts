export class UiInteraction {
    private _clicked = false

    public get clicked(): boolean {
        return this._clicked
    }

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

    public triggerClick() {
        this._clicked = true
    }

    public resetClick() {
        this._clicked = false
    }
}
