export interface GamepadState {
  leftStick: { x: number; y: number }
  rightStick: { x: number; y: number }
  buttons: {
    shoot: boolean
    knife: boolean
    reload: boolean
    interact: boolean
    weaponNext: boolean
    weaponPrev: boolean
    pause: boolean
  }
  connected: boolean
}

export class GamepadManager {
  private gamepadIndex: number | null = null
  private state: GamepadState = {
    leftStick: { x: 0, y: 0 },
    rightStick: { x: 0, y: 0 },
    buttons: {
      shoot: false,
      knife: false,
      reload: false,
      interact: false,
      weaponNext: false,
      weaponPrev: false,
      pause: false,
    },
    connected: false,
  }

  private prevButtons: boolean[] = []
  private deadzone = 0.15

  constructor() {
    window.addEventListener("gamepadconnected", this.onConnect)
    window.addEventListener("gamepaddisconnected", this.onDisconnect)
  }

  private onConnect = (e: GamepadEvent) => {
    this.gamepadIndex = e.gamepad.index
    this.state.connected = true
    console.log(`Gamepad connected: ${e.gamepad.id}`)
  }

  private onDisconnect = (e: GamepadEvent) => {
    if (this.gamepadIndex === e.gamepad.index) {
      this.gamepadIndex = null
      this.state.connected = false
    }
  }

  private applyDeadzone(value: number): number {
    if (Math.abs(value) < this.deadzone) return 0
    const sign = value > 0 ? 1 : -1
    return sign * ((Math.abs(value) - this.deadzone) / (1 - this.deadzone))
  }

  update(): GamepadState {
    if (this.gamepadIndex === null) return this.state

    const gamepads = navigator.getGamepads()
    const gamepad = gamepads[this.gamepadIndex]

    if (!gamepad) return this.state

    // Left stick for movement
    this.state.leftStick.x = this.applyDeadzone(gamepad.axes[0])
    this.state.leftStick.y = this.applyDeadzone(gamepad.axes[1])

    // Right stick for aiming
    this.state.rightStick.x = this.applyDeadzone(gamepad.axes[2])
    this.state.rightStick.y = this.applyDeadzone(gamepad.axes[3])

    // Buttons (Xbox/Standard mapping)
    // RT (index 7) = Shoot
    // LT (index 6) or B (index 1) = Knife
    // X (index 2) = Reload
    // A (index 0) = Interact
    // RB (index 5) = Next weapon
    // LB (index 4) = Previous weapon
    // Start (index 9) = Pause

    const isPressed = (index: number) => gamepad.buttons[index]?.pressed ?? false
    const justPressed = (index: number) => {
      const current = isPressed(index)
      const prev = this.prevButtons[index] ?? false
      return current && !prev
    }

    this.state.buttons.shoot = isPressed(7) || gamepad.buttons[7]?.value > 0.5
    this.state.buttons.knife = justPressed(6) || justPressed(1)
    this.state.buttons.reload = justPressed(2)
    this.state.buttons.interact = justPressed(0)
    this.state.buttons.weaponNext = justPressed(5)
    this.state.buttons.weaponPrev = justPressed(4)
    this.state.buttons.pause = justPressed(9)

    // Store previous button states
    this.prevButtons = gamepad.buttons.map((b) => b.pressed)

    return this.state
  }

  getState(): GamepadState {
    return this.state
  }

  getAimAngle(): number | null {
    const { x, y } = this.state.rightStick
    if (Math.abs(x) < 0.1 && Math.abs(y) < 0.1) return null
    return Math.atan2(y, x)
  }

  isConnected(): boolean {
    return this.state.connected
  }

  destroy() {
    window.removeEventListener("gamepadconnected", this.onConnect)
    window.removeEventListener("gamepaddisconnected", this.onDisconnect)
  }
}
