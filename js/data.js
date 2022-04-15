export let canvas = document.createElement("canvas")
export let ctx = canvas.getContext("2d")
export const gravity = 0.8
export const debug_mode = true  // Impostare a true per attivare la "god mod" e provare il gioco senza morire mai

export const keysPressed = {
    right: false,
    left: false,
    dashRight: false,
    dashLeft: false
}

export let options = undefined
export function setOptions(newOptions) {
    options = newOptions
    console.log("setOptions: ", options)
}

export function getImage(path) {
    const image = new Image()
    image.src = path
    return image
}