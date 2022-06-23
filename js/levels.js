import {Bird, CheckPoint, Coin, Enemy, Platform, Turret} from "./entities.js"
import {getImage} from "./data.js"

export let blockSize = undefined
export let isLastLevel = false

function build(level1, images = {dirt: undefined, coin: undefined, enemy: undefined, turret: undefined, bird: undefined, checkPoint: undefined, grass: undefined}) {
    // let sizeOfOneBlock = Math.min(100, Math.round(innerHeight / level1.length))
    // sizeOfOneBlock = Math.max(sizeOfOneBlock, 70)

    blockSize = 100

    const entities = []
    const platforms = []
    const enemies = []
    const coins = []
    const checkpoints = new Map()
    let winBlock = undefined

    let posX = 0
    let posY = innerHeight - blockSize

    for (let i = level1.length - 1; i >= 0; i--) {
        let row = level1[i]

        for (let j = 0; j < row.length; j++) {
            switch (row.charAt(j)) {
                case '1' : {
                    let platform = new Platform({
                        x: posX,
                        y: posY,
                        width: 100,
                        height: 100
                    });

                    entities.push(platform)
                    platforms.push(platform)
                    platform.image = images.grass
                    break;
                }
                case '2' : {
                    let size = 60
                    let coin = new Coin({
                        x: posX,
                        y: posY + (blockSize - size),
                        width: size,
                        height: size,
                    });

                    entities.push(coin)
                    coins.push(coin)
                    coin.image = images.coin
                    break;
                }
                case '3' : {
                    let enemy = new Enemy({
                        x: posX,
                        y: posY,
                        startPosX: posX - 200,
                        endX: posX + 200
                    });

                    entities.push(enemy)
                    enemies.push(enemy)
                    enemy.image = images.enemy
                    break;
                }

                case '4' : {
                    let turret = new Turret({
                        x: posX,
                        y: posY,
                    })

                    turret.position.y = posY + (blockSize - turret.size.height)

                    entities.push(turret)
                    enemies.push(turret)
                    turret.image = images.turret
                    break;
                }
                case '5' : {
                    let bird = new Bird({
                        x: posX,
                        y: posY,
                        startPosX: posX - 200,
                        endX: posX + 200
                    });

                    bird.image = images.bird
                    entities.push(bird)
                    enemies.push(bird)
                    break;
                }
                case '6' : {
                    let platform = new Platform({
                        /*
                            Quando misi il castello:
                            x: posX - (500 - blockSize),
                            y: posY - (700 - blockSize),
                         */
                        x: posX,
                        y: posY,
                        color: 'brown',
                        width: blockSize + 50,
                        height: blockSize + 100
                    });

                    platform.position.x = platform.position.x - (platform.size.width - blockSize)
                    platform.position.y = platform.position.y - (platform.size.height - blockSize)

                    entities.push(platform)
                    winBlock = platform
                    winBlock.image = images.winBlock
                    break;
                }
                case '7' : {
                    let checkpoint = new CheckPoint({
                        x: posX,
                        y: posY,
                        color: 'grey',
                        width: blockSize,
                        height: blockSize
                    });

                    entities.push(checkpoint)
                    checkpoints.set(checkpoint, false)
                    checkpoint.image = images.checkpoint
                    break;
                }
                case '0' :
                    break;
            }

            posX += blockSize
        }

        for (let block of platforms) {
            //check if there is a block up the current block
            for (let block2 of platforms) {
                if(block === block2) continue;

                if (block2.position.y === block.position.y-blockSize && block2.position.x === block.position.x) {
                    block.image = images.dirt
                }
            }
        }

        posX = 0
        posY -= blockSize
    }

    return {entities, platforms, enemies, coins, checkpoints ,winBlock};
}

export function level1() {
    const level = nextLevel()

    const images = {}
    images.dirt = getImage("./assets/ground/dirt.png")
    images.grass = getImage("./assets/ground/grass.png")
    images.winBlock = getImage("./assets/win/door.png")
    images.turret = getImage("./assets/turret/turret.png")
    images.bird = getImage("./assets/bat/bat.png")
    images.checkpoint = getImage("./assets/checkpoint/checkpoint.png")
    images.enemy = getImage("./assets/classicEnemy/enemy.png")
    images.coin = getImage("./assets/coin/coin.png")

    let buildedLevel = build(level, images)
    buildedLevel.background = getImage('./assets/bg/background0.png')

    return buildedLevel
}

export function level2() {
    const level = nextLevel()

    const images = {}
    images.dirt = getImage("./assets/ground/dirt.png")
    images.grass = getImage("./assets/ground/grass.png")
    images.winBlock = getImage("./assets/win/door.png")
    images.turret = getImage("./assets/turret/turret.png")
    images.bird = getImage("./assets/bat/bat.png")
    images.checkpoint = getImage("./assets/checkpoint/checkpoint.png")
    images.enemy = getImage("./assets/classicEnemy/enemy.png")
    images.coin = getImage("./assets/coin/coin.png")

    let buildedLevel = build(level, images)
    buildedLevel.background = getImage('./assets/bg/background1.png')

    return buildedLevel
}

export function level3() {
    const level = nextLevel()

    const images = {}
    images.dirt = getImage("./assets/ground/dirt.png")
    images.grass = getImage("./assets/ground/grass.png")
    images.winBlock = getImage("./assets/win/door.png")
    images.turret = getImage("./assets/turret/turret.png")
    images.bird = getImage("./assets/bat/bat.png")
    images.checkpoint = getImage("./assets/checkpoint/checkpoint.png")
    images.enemy = getImage("./assets/classicEnemy/enemy.png")
    images.coin = getImage("./assets/coin/coin.png")

    let buildedLevel = build(level, images)
    buildedLevel.background = getImage('./assets/bg/background2.jpg')

    return buildedLevel
}

function nextLevel() {
    const ajax = new XMLHttpRequest()
    ajax.open('GET', './php/levels.php', false)
    ajax.send()
    console.log(ajax.responseText)
    let data = JSON.parse(ajax.responseText)
    let level = data.level
    isLastLevel = data.lastLevel

    return level
}