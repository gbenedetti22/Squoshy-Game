import {isLastLevel, level1, level2, level3} from "./levels.js";
import {CheckPoint, Platform, Player, Turret} from "./entities.js";
import {canvas, ctx, debug_mode, keysPressed, options} from "./data.js";

canvas.width = window.innerWidth
canvas.height = window.innerHeight
document.body.append(canvas)

let player = undefined
let entities, platforms, enemies, coins, checkpoints, winBlock, backgroundImage = undefined
let currentCheckpoint = undefined

const unlockedPowers = {
    doubleJump: false,
    dash: false,
}

let entitiesX = new Map()
let currentLevel = 0
let score = 0

function init(options = {spawnPointX: 0, spawnPointY: 0, currentLevel: 1}) {
    console.log("init", options)
    player = new Player({x: options.spawnPointX, y: options.spawnPointY})
    currentCheckpoint = CheckPoint.defaultCheckpoint()
    currentLevel = options.currentLevel

    let level = undefined
    switch (options.currentLevel) {
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
            return
    }

    entities = level.entities
    platforms = level.platforms
    enemies = level.enemies
    coins = level.coins
    checkpoints = level.checkpoints
    winBlock = level.winBlock
    backgroundImage = level.background

    canvas.style.backgroundImage = `url(${backgroundImage.src})`

    let previousCheckpoints = localStorage.getItem("checkpoints")

    if(previousCheckpoints) {
        previousCheckpoints = new Map(JSON.parse(previousCheckpoints))
        console.log("previousCheckpoints", previousCheckpoints)

        for(let [currentCheckpoint] of checkpoints) {
            for (let [previousCheckpoint, taked2] of previousCheckpoints) {
                if(currentCheckpoint.position.x === previousCheckpoint.position.x && currentCheckpoint.position.y === previousCheckpoint.position.y) {
                    checkpoints.set(currentCheckpoint, taked2)
                }
            }
        }
    }

    entitiesX.clear()
    entities.forEach(entity => {
        if (!entitiesX.has(entity.position.x)) {
            entitiesX.set(entity.position.x, [])
        }

        entitiesX.get(entity.position.x).push(entity)
    })
}

let t1 = 0

function update() {
    let id = requestAnimationFrame(update)

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()

    let limitX = Math.round(innerWidth / 2)

    if (player.position.x >= limitX) {
        ctx.translate(-(player.position.x - limitX), 0)
    }


    //movimento sull asse y
    let limitY = Math.round(innerHeight * 30 / 100)
    if (player.position.y <= limitY) {
        ctx.translate(0, -(player.position.y - limitY))
    }

    if (keysPressed.right) {
        player.velocity.x = player.speed
    } else if (keysPressed.left) {
        player.velocity.x = -player.speed
    } else {
        player.velocity.x = 0
    }

    if (keysPressed.dashRight) {
        player.velocity.x = 50

        let t2 = performance.now()

        if (t2 - t1 >= 100) {
            keysPressed.dashRight = false
            player.velocity.x = 0
        }
    } else if (keysPressed.dashLeft) {
        player.velocity.x = -50

        let t2 = performance.now()

        if (t2 - t1 >= 100) {
            keysPressed.dashLeft = false
        }
    }

    player.move()

    //Se il giocatore vince
    if (player.intersectX(winBlock) || player.intersectY(winBlock)) {
        score += 5
        updateServer(id)
        //Se il giocatore ha raggiunto la fine del gioco..
        if (isLastLevel) {
            cancelAnimationFrame(id)
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            window.location.href = "/ProgettoPWeb/html/scoreboard.html"
            localStorage.clear()
            return
        }

        localStorage.clear()
        init({currentLevel: currentLevel + 1, spawnPointX: 0, spawnPointY: 0})
    }
    else {
        //collision detection
        for (let platform of platforms) {
            platform.draw()

            if (player.intersectY(platform)) {
                player.velocity.y = 0
                player.jumpCount = 0
                player.canJump = true
            }

            if (player.intersectX(platform)) {
                if (player.position.x <= platform.position.x && (keysPressed.right || keysPressed.dashRight)) {
                    player.position.x = platform.position.x - player.size.width - 1
                } else if (player.position.x >= platform.position.x && (keysPressed.left || keysPressed.dashLeft)) {
                    player.position.x = platform.position.x + platform.size.width + 1
                }
            }
        }

        for (let enemy of enemies) {
            enemy.move()

            if (enemy instanceof Turret) {
                enemy.shoot()
                if (player.intersectX(enemy.bullet)) {
                    if(!debug_mode) {
                        player.die = true
                    }

                    console.log("mi hai sparato")
                }
            }

            if (player.intersectX(enemy)) {
                if(!debug_mode) {
                    player.die = true
                }
                console.log("colpito e affondato")
            }

            if (player.intersectY(enemy)) {
                if (!(enemy instanceof Turret)) {
                    enemies.splice(enemies.indexOf(enemy), 1)

                    let entities = entitiesX.get(enemy.spawnPosition.x)
                    if (entities !== undefined)
                        entities.splice(entities.indexOf(enemy), 1)

                    player.velocity.y -= player.jumpForce * 2
                    score += enemy.score
                    console.log("ucciso enemy, point: ", enemy.score)
                }
            }


            // collision detection per i nemici sull asse X e Y
            for (let e of entities) {
                if (e instanceof Platform) {
                    let platform = e
                    if (enemy instanceof Turret) {
                        let turret = enemy

                        if (turret.bullet.intersectX(platform)) {
                            turret.bullet.position.x = turret.position.x
                            turret.bullet.position.y = turret.position.y
                            turret.bulletSpeed = 30
                        }
                        continue
                    }

                    if (enemy.intersectX(platform)) {
                        if (enemy.position.x <= platform.position.x) {
                            enemy.velocity.x -= 1
                        } else if (enemy.position.x >= platform.position.x) {
                            enemy.velocity.x += 1
                        }
                    }

                    if (enemy.intersectY(platform)) {
                        enemy.velocity.y = 0
                    }
                }
            }
        }

        for (let coin of coins) {
            coin.draw()

            if (player.intersectX(coin)) {

                //remove element from array coins
                coins = coins.filter(c => c !== coin)
                score += 2
                console.log("hai preso un coin")
            }
        }

        for (const [checkpoint, taked] of checkpoints) {
            checkpoint.draw()

            //Se il giocatore prende il checkpoint e questo non era ancora stato preso...
            if(player.intersectX(checkpoint)) {
                if(!taked)
                    saveState(checkpoint, id);

                if(checkpoint.position.x >= currentCheckpoint.position.x) {
                    currentCheckpoint = checkpoint
                }
            }
        }
    }

    winBlock.draw()

    if(player.die) {
        player.position.x = currentCheckpoint.position.x
        player.position.y = currentCheckpoint.position.y
        player.velocity.x = 0
        player.velocity.y = 0

        player.die = false
        score -= 1
    }

    ctx.restore()
}

addEventListener('keydown', (event) => {
    switch (event.code) {
        case "Space":
            if (player.canJump) {
                player.velocity.y -= player.jumpForce
                if (player.jumpCount === 1) { //se è il secondo salto, metto un limite all altezza che il giocatore può raggiungere
                    player.velocity.y = -player.jumpForce + 3.5
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
            if(!unlockedPowers.dash) return

            if (keysPressed.right)
                dashRight()
            else if (keysPressed.left)
                dashLeft()
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
            if(!unlockedPowers.doubleJump) return

            player.jumpCount++
            if (player.jumpCount < 2) {
                player.canJump = true
            }
            break
    }
})

function dashRight() {
    if (player.canDash) {
        t1 = performance.now()
        player.canDash = false
        keysPressed.dashRight = true
    }
}

function dashLeft() {
    if (player.canDash) {
        t1 = performance.now()
        player.canDash = false
        keysPressed.dashLeft = true
    }
}

function updateServer(id) {
    let request = JSON.stringify({
        "score": score,
    })

    let conn = new XMLHttpRequest()
    conn.open("POST", "../php/updateScore.php", false)
    conn.setRequestHeader("Content-type", "application/json")
    conn.onload = () => {
        console.log(conn.responseText)
        if(conn.status !== 200) {
            console.log("Errore: ", conn.status)
        }

        let response = JSON.parse(conn.responseText)

        if (response.updated) {
            console.log("update ok")
        } else {
            cancelAnimationFrame(id)
            alert("C'è stato un errore nell'aggiornamento del punteggio")
            window.location.href = "/ProgettoPWeb/index.php"
        }
    }

    conn.send(request)
}

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
            localStorage.setItem("checkpoints", JSON.stringify(Array.from(checkpoints.entries())))
            console.log("checkpoint salvato")
        } else {
            cancelAnimationFrame(id)
            alert("C'è stato un errore nel salvataggio del checkpoint")
            window.location.href = "/ProgettoPWeb/index.php"
        }
    }
}


window.onload = function () {
    init(options)
    update()
}