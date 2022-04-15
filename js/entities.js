import {canvas, ctx, debug_mode, getImage, gravity} from "./data.js";

export class Entity {
    constructor({x = 0, y = 0, width = 100, height = 100, color = "black"}) {
        this.position = {
            x,
            y
        };

        this.size = {
            width,
            height
        };

        this.color = color
        this.image = undefined
        this.index = 0
        this.time = performance.now()
        this.animate = false
    }

    intersectX(entity) {
        return collisionX(this, entity)
    }

    intersectY(entity) {
        return collisionY(this, entity)
    }

    draw() {
        if (this.image) {
            if(this.animate) {
                let width = 48     //bat: 48
                let height = 64    //bat: 64
                let frames = 3     //bat: 3

                let t2 = performance.now()
                if (t2 - this.time >= 1000 / (Math.pow(frames, 2))) {
                    this.index += width
                    this.time = t2
                }

                ctx.drawImage(
                    this.image,
                    this.index,
                    0,
                    width,
                    height,
                    this.position.x,
                    this.position.y,
                    this.size.width,
                    this.size.height)

                if (this.index >= frames * width) {
                    this.index = 0
                }

                return
            }

            ctx.drawImage(
                this.image,
                this.position.x,
                this.position.y,
                this.size.width,
                this.size.height)

            return
        }

        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);
    }
}

export class Platform extends Entity {
    constructor({x, y, width, height, color = "green"}) {
        super({x, y, width, height, color});
        this.position = {
            x,
            y
        };

        this.size = {
            width,
            height
        };

        this.color = color
    }

    setDefaultColor() {
        this.color = "green"
    }
}

export class Enemy extends Entity {
    constructor({x = 0, y = 0, width = 75, height = 75, startPosX = x, endX = x}) {
        super({x, y, width, height, color: "blue"});
        this.speed = 3
        this.position = {
            x,
            y
        };

        this.spawnPosition = {
            x,
            y
        };
        this.startPosX = startPosX;
        this.endX = endX

        this.velocity = {
            x: Math.round(Math.random()) === 1 ? this.speed : -this.speed,
            y: 1
        };

        this.size = {
            width,
            height
        };

        this.color = "blue"
        this.score = 1
    }

    setDefaultColor() {
        this.color = "blue"
    }

    move() {
        this.draw()
        this.position.x += this.velocity.x;
        this.position.x = Math.max(0, this.position.x);

        this.position.y += this.velocity.y;

        if (this.startPosX > this.endX) {
            throw new Error("posizione di enemy iniziale maggiore dell arrivo")
        }

        if (this.position.x + this.size.width >= this.endX) {
            this.velocity.x = -this.speed;
        } else if (this.position.x <= this.startPosX) {
            this.velocity.x = this.speed;
        }

        if (this.position.y + this.size.height + this.velocity.y <= canvas.height) {
            this.velocity.y += gravity;
        } else {
            this.velocity.y = 0;
        }

    }
}

export class Bird extends Enemy {
    constructor({x = 0, y = 0, width = 90, height = 120, startPosX = x, endX}) {
        super({x, y, width, height, startPosX, endX});
        this.color = "violet"
        this.score = 2
        this.animate = true
    }

    setDefaultColor() {
        this.color = "violet"
    }

    move() {
        this.draw()
        this.position.x += this.velocity.x;
        this.position.x = Math.max(0, this.position.x);

        if (this.startPosX > this.endX) {
            throw new Error("posizione di bird iniziale maggiore dell arrivo")
        }

        if (this.position.x + this.size.width >= this.endX) {
            this.velocity.x = -this.speed;
        } else if (this.position.x <= this.startPosX) {
            this.velocity.x = this.speed;
        }
    }
}

export class Turret extends Enemy {
    constructor({x = 0, y = 0, width = 120, height = 160}) {
        super({x, y, width, height});
        this.color = "purple"
        this.bullet = new Entity({x,y,width:10,height:10,color:"black"})
        this.bulletSpeed = 30
    }

    move() {
        //essendo una torretta non si muove
    }

    shoot() {
        this.draw()
        ctx.save()
        ctx.fillStyle = "black";
        ctx.fillRect(this.bullet.position.x -= this.bulletSpeed, this.position.y, this.bullet.size.width, this.bullet.size.height);
        ctx.restore()

        if (this.bullet.position.x <= 0) {
            this.bullet.position.x = this.position.x
            this.bulletSpeed = 30
        }

        this.bulletSpeed -= 0.1
    }

    intersectX(entity) {
        return collisionX(this.bullet, entity)
    }
}

export class Coin extends Entity {
    constructor({x = 0, y = 0, width = 60, height = 60}) {
        super({x, y, width, height, color: "orange"});
    }

    setDefaultColor() {
        this.color = "orange"
    }
}

export class CheckPoint extends Entity {
    constructor({x = 0, y = 0, width = 30, height = 60}) {
        super({x, y, width, height, color: "grey"});
    }

    static defaultCheckpoint() {
        return new CheckPoint({x: 0, y: 0, width: 30, height: 60})
    }

    setDefaultColor() {
        this.color = "grey"
    }
}

export class Player extends Entity {
    constructor({x, y}) {
        super({x, y, width: 60, height: 60, color: "red"});
        this.position = {
            x,
            y
        };

        this.velocity = {
            x: 0,
            y: 1
        }

        this.speed = 15
        this.jumpForce = 17
        this.canJump = true
        this.canDash = true
        this.jumpCount = 0
        this.color = "red"
        this.image = getImage("../assets/player/player.png")
    }

    move() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.x = Math.max(0, this.position.x)

        this.position.y += this.velocity.y

        if (this.position.y + this.size.height + this.velocity.y <= canvas.height) {
            this.velocity.y += gravity
        } else {
            if(!debug_mode) {
                this.die = true
                return
            }

            this.velocity.y = 0
            this.jumpCount = 0
            this.canJump = true
        }
    }
}

// collision detection on x-axis
// sostituire la prima e la seconda riga dell if con:
// player.position.x + player.size.width + player.velocity.x >= platform.position.x
// player.position.x + player.velocity.x <= platform.position.x + platform.size.width
// per avere un pò di gap tra il player e la piattaforma
// (in pratica basta sommare velocity.x al player.position.x)
function collisionX(e1, e2) {
    return e1.position.x + e1.size.width >= e2.position.x &&
        e1.position.x <= e2.position.x + e2.size.width &&
        e1.position.y + e1.size.height >= e2.position.y &&
        e1.position.y <= e2.position.y + e2.size.height
}

function collisionY(e1, e2) {
    return e1.position.y + e1.size.height <= e2.position.y &&
        e1.position.y + e1.size.height + e1.velocity.y >= e2.position.y &&
        e1.position.x + e1.size.width >= e2.position.x &&
        e1.position.x <= e2.position.x + e2.size.width
}