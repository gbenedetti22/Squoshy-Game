import {isLastLevel, level1, level2, level3} from "./levels.js";
import {CheckPoint, Cloudy, Player, Turret} from "./entities.js";
import {canvas, ctx, debug_mode, getOptions, keysPressed} from "./data.js";

/*
    Premessa: prima di guardare questo file è consigliato leggere il file entities.js per capire
    a cosa corrispondono le diciture usate qua (velocity, position ecc)

    Introduzione
    Cuore del gioco. Qui avviene:
         - Gestione del canvas
         - Gestione delle collisioni
         - Creazione di tutte le entità
         - Eventuali aggiornamenti da notificare al Sever (es. aggiornamento dello score)
         - Gestione dell input da tastiera
 */

canvas.width = window.innerWidth
canvas.height = window.innerHeight
document.body.append(canvas)

let player = undefined
let entities, platforms, enemies, coins, checkpoints, winBlock, backgroundImage = undefined
let currentCheckpoint = undefined
const tutorial = new Cloudy()

const unlockedPowers = {
    doubleJump: false,
    dash: false,
}

let currentLevel = 0
let score = 0

/*
    Funzione di inizializzazione del gioco
    Questa funzione prende in input le informazioni per poter creare il livello e le entità.
    Queste informazioni sono del tipo:
    - il punto di spawn del giocatore (x e y)
    - quale livello

    Il livello viene scaricato dal Server
    Questa funzione viene chiamata SEMPRE ad ogni inizio di un livello

    Per quanto riguarda i checkpoints, viene controllato se il giocatore già ne aveva preso e nel caso riprendere da lì
 */
function init(options = {spawnPointX: 0, spawnPointY: 0, currentLevel: 1, currentScore: 0}) {
    player = new Player({x: options.spawnPointX, y: options.spawnPointY})
    currentCheckpoint = CheckPoint.defaultCheckpoint()
    currentLevel = options.currentLevel
    tutorial.hide = false
    score = options.currentScore

    // Le funzioni servono a scaricare il livello dal Server
    // Mano a mano che progredisco, vengono sbloccati i poteri
    let level = undefined
    switch (currentLevel) {
        case 1:
            level = level1()
            unlockedPowers.doubleJump = false
            unlockedPowers.dash = false
            break
        case 2:
            level = level2()
            unlockedPowers.doubleJump = true
            unlockedPowers.dash = false
            break
        case 3:
            level = level3()
            unlockedPowers.doubleJump = true
            unlockedPowers.dash = true
            break
        default:
            return false
    }

    if (!level) return false

    // Tutte queste varuabili fanno riferimento al livello corrente e NON a tutti i livelli (ovviamente)
    entities = level.entities // Array che contiene tutte le entità
    platforms = level.platforms // Array che contiene solo i blocchi dove il giocatore può stare
    enemies = level.enemies // Array che contiene tutti i nemici
    coins = level.coins // Array che contiene tutte le monete
    checkpoints = level.checkpoints // Map che contiene tutti i checkpoints come key e come value se è stato preso o no
    winBlock = level.winBlock // variabile per tenere traccia del blocco goal corrente
    backgroundImage = level.background // Immagine di background

    canvas.style.backgroundImage = `url(${backgroundImage.src})`

    /*
        Se prima avevo già dei checkpoints presi, aggiorno la Map checkpoints.
        Questo mi permette di non dover inviare richieste al Server in modo ripetuto se il giocatore passa più e più volte
        sopra un checkpoints (della serie, se è già stato preso non devo aggiornare il Server)
     */
    let previousCheckpoints = localStorage.getItem("checkpoints")
    if (previousCheckpoints) {
        previousCheckpoints = new Map(JSON.parse(previousCheckpoints))
        console.log("previousCheckpoints", previousCheckpoints)

        // checkpoints -> Map con tutti i checkpoint ricevuti dal Server
        // previousCheckpoints -> Map con i checkPoints presi
        for (let [currentCheckpoint] of checkpoints) {
            for (let [previousCheckpoint, taked2] of previousCheckpoints) {
                if (currentCheckpoint.position.x === previousCheckpoint.position.x && currentCheckpoint.position.y === previousCheckpoint.position.y) {
                    checkpoints.set(currentCheckpoint, taked2)
                }
            }
        }
    }

    let previousScore = localStorage.getItem("score")
    if (previousScore) {
        score = previousScore
    }

    console.log(score)

    return true
}

let dashT1 = 0
let nFrames, now, then, elapsed

// funzione stub per far partire il gioco ad un determinato framerate
function startGame(fps = 60) {
    nFrames = 1000 / fps // stabilisco, in un secondo, al massimo quanti frames renderizzare
    now = performance.now()
    update()
}

function update() {
    let id = requestAnimationFrame(update)

    then = performance.now()
    elapsed = then - now

    // Se non posso renderizzare un frame perchè non ho raggiunto il tempo, esco
    if (elapsed <= nFrames) return

    // aggiorno il contatore e aggiusto per il numero di frame settati
    now = then - (elapsed % nFrames)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()

    // valore che stabilisce da che punto la schermata deve muoversi orizzontalmente
    let limitX = Math.round(innerWidth / 2)

    // Se il giocatore ha superato quel punto, muovo la schermata in orizzontale
    if (player.position.x >= limitX) {
        ctx.translate(-(player.position.x - limitX), 0)
    }

    // valore che stabilisce da che punto la schermata deve muoversi verticalmente
    let limitY = Math.round(innerHeight * 30 / 100)
    if (player.position.y <= limitY) {
        ctx.translate(0, -(player.position.y - limitY))
    }

    // Se il giocatore preme un tasto per muoversi, aggiorno la sua velocity
    if (keysPressed.right) {
        player.velocity.x = player.speed
    } else if (keysPressed.left) {
        player.velocity.x = -player.speed
    } else {
        player.velocity.x = 0
    }

    // controllo sul dash
    // Il concetto è questo: premendo il tasto di dash, il giocatore andrà avanti ripetutamente ad alta velocità
    // per un tot di tempo. Viene usata questa tecnica per evitare che il giocatore abbia il controllo sulla distanza
    // che può percorrere
    let dashT2 = performance.now()
    if (keysPressed.dashRight) {
        player.velocity.x = 50 // incremento la velocità

        // Se è passato abbastanza tempo, fermo il giocatore
        // il tempo dashT1 viene preso quando il giocatore preme il tasto shift (vedi funzione di cattura dei tasti)
        if (dashT2 - dashT1 >= 100) {
            keysPressed.dashRight = false
        }
    } else if (keysPressed.dashLeft) {
        player.velocity.x = -50

        if (dashT2 - dashT1 >= 100) {
            keysPressed.dashLeft = false
        }
    }

    // disegno sul canvas il giocatore e imposto la nuvolina del tutorial in modo che possa seguirlo
    player.move()
    tutorial.follow = player
    tutorial.showMessage(currentLevel)

    //Se il giocatore vince
    if (player.intersectX(winBlock) || player.intersectY(winBlock)) {
        updateServer(id)    // aggiorno lo score (vedi firma funzione)

        //Se il giocatore ha raggiunto la fine del gioco..
        if (isLastLevel) {
            cancelAnimationFrame(id)
            clearStorage()
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            window.location.href = "/ProgettoPWeb/html/scoreboard.html"
            return
        }

        //..altrimenti inizializzo il livello successivo
        clearStorage()
        if (!init({currentLevel: currentLevel + 1, spawnPointX: 0, spawnPointY: 0})) {
            cancelAnimationFrame(id)
            clearStorage()
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            window.location.href = "/ProgettoPWeb/index.php"
            return
        }
    } else {
        // collision detection di tutto il gioco

        // controllo se il giocatore si trova sopra una piattaforma/blocco o se ci sta andando contro
        for (let platform of platforms) {
            platform.draw()

            // giocatore sopra un blocco
            if (player.intersectY(platform)) {
                player.velocity.y = 0
                player.jumpCount = 0
                player.canJump = true
            }

            // giocatore si sta scontrando contro un blocco
            // in tal caso, se si trova alla sinistra del blocco, la sua posizione prende il lato sinistro del blocco
            // altrimenti il lato destro
            /*
               Caso in cui il giocatore si trova a sinistra del blocco (P = player e B = blocco piattaforma)
                                                             ________________
                                                            |               |
                                                       ____ |      B        |
                                                      | P | |               |
                                        ---------------------------------------------------
                                player.position.x ---^    ^ ^               ^
                 player.position.x + player.size.width ___| |               |
                                      platform.position.x ---               |
                                                                            |
                                platform.position.x + platform.size.width ---
             */
            if (player.intersectX(platform)) {
                // Se il giocatore sta a sinistra del blocco e sta premendo il tasto per andare avanti..
                // (N.B: blocco il giocatore sul posto SOLO se tenta di andare avanti! altrimenti non potrebbe più
                // muoversi una volta raggiunta una piattaforma
                if (player.position.x <= platform.position.x && (keysPressed.right || keysPressed.dashRight)) {
                    //platform.position.x - player.size.width è il punto di fermo, quello che sta davanti la piattaforma
                    player.position.x = platform.position.x - player.size.width - 1
                } else if (player.position.x >= platform.position.x && (keysPressed.left || keysPressed.dashLeft)) {
                    player.position.x = platform.position.x + platform.size.width + 1
                }
            }
        }

        for (let enemy of enemies) {
            enemy.move() // disegno sul canvas il nemico

            if (enemy instanceof Turret) {
                enemy.shoot()
                if (player.intersectX(enemy.bullet)) {
                    if (!debug_mode) {
                        player.die = true
                    }

                    console.log("Mi hai sparato")
                }
            }

            if (player.intersectX(enemy)) {
                if (!debug_mode) {
                    player.die = true
                }
                console.log("Colpito e affondato")
            }

            // Se il giocatore salta sopra un nemico lo uccide (come in super mario)
            if (player.intersectY(enemy)) {
                if (!(enemy instanceof Turret)) {   // questa cosa non vale per le torri -> quelle sono indistruttibili!
                    enemies.splice(enemies.indexOf(enemy), 1)

                    player.velocity.y -= player.jumpForce + 3.5 // eseguo un saltino
                    score += enemy.score
                    console.log("ucciso enemy, point: ", enemy.score)
                }
            }


            // collision detection per i nemici sull asse X e Y
            for (let platform of platforms) {
                if (enemy instanceof Turret) {
                    let turret = enemy

                    // controllo se il proiettile della torretta colpisce un blocco
                    // in tal caso lo resetto alla posizioe originale
                    if (turret.bullet.intersectX(platform)) {
                        turret.bullet.position.x = turret.position.x
                        turret.bullet.position.y = turret.position.y
                        turret.bulletSpeed = 30
                    }
                    continue
                }

                // collision detection per i nemici:
                // i nemici sono soggetti alla gravità proprio come il giocatore
                // i nemici tornano indietro se colpiscono un blocco
                if (enemy.intersectX(platform)) {
                    if (enemy.position.x <= platform.position.x) {
                        enemy.velocity.x -= 1
                    } else if (enemy.position.x >= platform.position.x) {
                        enemy.velocity.x += 1
                    }
                }

                // Se un nemico cade e colpisce un blocco, si ferma
                if (enemy.intersectY(platform)) {
                    enemy.velocity.y = 0
                }

            }
        }

        for (let coin of coins) {
            coin.draw()

            if (player.intersectX(coin)) {
                coins = coins.filter(c => c !== coin)
                score += 2
                console.log("hai preso un coin")
            }
        }

        for (const [checkpoint, taked] of checkpoints) {
            checkpoint.draw()

            //Se il giocatore prende il checkpoint e questo non era ancora stato preso...
            if (player.intersectX(checkpoint)) {
                // l aggiornamento sul server avviene SOLO per i checkpoints non presi
                if (!taked)
                    saveState(checkpoint, id);

                // se il checkpoint preso è "più avanti" rispetto a quello precedente, aggiorno.
                // di fatto, se un giocatore riprende un vecchio checkpoint questo viene ignorato
                if (checkpoint.position.x >= currentCheckpoint.position.x) {
                    currentCheckpoint = checkpoint
                }
            }
        }
    }

    winBlock.draw()

    if (player.die) {
        player.position.x = currentCheckpoint.position.x
        player.position.y = currentCheckpoint.position.y
        player.velocity.x = 0
        player.velocity.y = 0

        player.die = false
        score -= 1
    }

    ctx.restore()
}

// listeners per il controllo dei pulsanti premuti
// l aggiornamento della UI avviene solo nel metodo update, qua si modificano i valori
addEventListener('keydown', (event) => {
    switch (event.code) {
        case "Space":
            if (player.canJump) {
                player.velocity.y = -player.jumpForce // eseguo il salto
                if (player.jumpCount === 1) { //se è il secondo salto, metto un limite all altezza che il giocatore può raggiungere
                    player.velocity.y = -player.jumpForce + 3.5
                    tutorial.hide = true
                }
                player.canJump = false
            }
            break
        case "ArrowLeft":
            if (keysPressed.right)
                keysPressed.right = false

            keysPressed.left = true
            break
        case "ArrowRight":
            if (keysPressed.left)
                keysPressed.left = false

            keysPressed.right = true
            break
        case "ShiftLeft":
            if (!unlockedPowers.dash) return

            if (keysPressed.right)
                dashRight()
            else if (keysPressed.left)
                dashLeft()
            tutorial.hide = true
            break
    }
})

addEventListener('keyup', (event) => {
    switch (event.code) {
        case "ArrowLeft":
            keysPressed.left = false
            break
        case "ArrowRight":
            keysPressed.right = false
            break
        case "ShiftLeft":
            keysPressed.dashRight = false
            keysPressed.dashLeft = false
            player.canDash = true
            break
        case "Space":
            if (!unlockedPowers.doubleJump) return

            player.jumpCount++
            if (player.jumpCount < 2) {
                player.canJump = true
            }
            break
    }
})

function dashRight() {
    if (player.canDash) {
        dashT1 = performance.now()
        player.canDash = false
        keysPressed.dashRight = true
    }
}

function dashLeft() {
    if (player.canDash) {
        dashT1 = performance.now()
        player.canDash = false
        keysPressed.dashLeft = true
    }
}

// funzione che esegue una richiesta AJAX per l aggiornamento dello score al cambio livello.
// Una volta che il giocatore ha raggiunto la fine del livello, viene aggiornato lo score corrente ottenuto
function updateServer(id) {
    let request = JSON.stringify({
        "score": score,
    })

    let conn = new XMLHttpRequest()
    conn.open("POST", "../php/updateScore.php", false)
    conn.setRequestHeader("Content-type", "application/json")
    conn.onload = () => {
        if (conn.status !== 200) {
            console.log("Errore: ", conn.responseText)
            exit(id, "C'è stato un errore nell'aggiornamento del punteggio")
            return
        }

        let response = JSON.parse(conn.responseText)

        if (response.updated) {
            console.log("update dello score ok")
        }
    }

    conn.send(request)
}

// funzione che esegue una richiesta AJAX per l aggiornamento dei checkpoint preso
// di fatto, viene chiamata ogni qual volta il giocatore prende un nuovo checkpoint
function saveState(checkpoint, id) {
    let ajax = new XMLHttpRequest()
    ajax.open("POST", "../php/checkpoint.php")
    ajax.setRequestHeader("Content-Type", "application/json")
    ajax.send(JSON.stringify({
        x: checkpoint.position.x,
        y: checkpoint.position.y,
        score: Math.max(score, 0)
    }))
    ajax.onload = function () {
        let response = JSON.parse(ajax.responseText)
        if (response.success) {
            checkpoints.set(checkpoint, true)
            currentCheckpoint = checkpoint

            localStorage.setItem("score", score)
            localStorage.setItem("checkpoints", JSON.stringify(Array.from(checkpoints.entries())))

            console.log("checkpoint salvato")
        } else {
            exit(id, "C'è stato un errore nel salvataggio del checkpoint")
        }
    }
}

window.onload = function () {
    const options = getOptions()
    if (!options) return

    if (!init(options)) {
        window.location.href = "/ProgettoPWeb/index.php"
        return
    }

    startGame()
}

function clearStorage() {
    const username = localStorage.getItem("username")
    localStorage.clear()
    localStorage.setItem("username", username)
}

// funzione di utiliti per poter terminare (mostrando un alert) il gioco in caso di errore
// id corrisponde all id del prossimo animationFrame
function exit(id, message="") {
    cancelAnimationFrame(id)
    alert(message)
    window.location.href = "/ProgettoPWeb/index.php"
}