export let canvas = document.createElement("canvas")
export let ctx = canvas.getContext("2d")
export const gravity = 0.8
export const debug_mode = false  // Impostare a true per attivare la "god mod" e provare il gioco senza morire mai

ctx.imageSmoothingEnabled = false
export const keysPressed = {
    right: false,
    left: false,
    dashRight: false,
    dashLeft: false
}

export function getOptions() {
    let ajax = new XMLHttpRequest()
    ajax.open("POST", "../php/getData.php", false)
    ajax.send()

    if(ajax.responseText === "not logged") {
        window.location.href = "../index.php"
        return undefined
    }

    return JSON.parse(ajax.responseText)
}

export function getImage(path) {
    const image = new Image()
    image.src = path
    return image
}