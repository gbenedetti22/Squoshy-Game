export let canvas = document.createElement("canvas")
export let ctx = canvas.getContext("2d")
export const gravity = 0.8  // stabilisce quanto veloce le entità devono cadere (sull asse Y)
export const debug_mode = false  // Impostare a true per attivare la "god mod" e provare il gioco senza morire mai

/*
    File JS di supporto
    Qua vengono memorizzati e gestiti i dati più importanti e significativi del gioco (es. il Canvas stesso)
 */

ctx.imageSmoothingEnabled = false
export const keysPressed = {
    right: false,
    left: false,
    dashRight: false,
    dashLeft: false
}

// Metodo per reperire dal Server, usando AJAX,
// i dati utente di configurazione del gioco (es. punto di spawn, livello corrente ecc)
// Se l utente non è loggato, viene reindirizzato alla pagina principale di login
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

// funzione di utility per reperire una foto dal disco fisso
export function getImage(path) {
    const image = new Image()
    image.src = path
    return image
}