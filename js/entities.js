import {canvas, ctx, debug_mode, getImage, gravity} from "./data.js";

/*
    File JS per la gestione delle entità
    Si definisce entità qualunque oggetto fisico che può essere disegnato sul Canvas.
    Un entità è caratterizzata nell avere:
        - una posizione xy
        - una grandezza (essendo il gioco in 2d, altezza e larghezza)
        - un colore o un immagine per rappresentarla sul Canvas
        - essendo fisica, dei modi per capire se l entità corrente sta "toccando" qualcosa (collision detection)

    ATTENZIONE: non tutte le entità sono soggette alla gravità!
 */

// Classe che rappresenta un entità
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
        this.index = 0  // determina lo spostamento all interno di una sprite
        this.time = performance.now()
        this.animate = false
    }

    intersectX(entity) {
        return collisionX(this, entity)
    }

    intersectY(entity) {
        return collisionY(this, entity)
    }

    // Funzione per disegnare l entità sul Canvas
    // Se l immagine è settata, verrà disegnata quella altrimenti viene usata una shape con un colore di default
    // Se animate è impostato a true, viene considerata l immagine impostata come una sprite
    draw() {
        if (this.image) {
            // Nel progetto, solo il pipistrello ha un animazione quindi i valori impostati vanno bene solo per quel
            // tipo di immagine. Tuttavia, se in futuro si vuole rendere il tutto più "dinamico"
            // è possibile cambiare le prime 3 variabili in accordo alla sprite che si vuole usare
            // (magari leggendo quei 3 valori dai metadati del file)
            if (this.animate) {
                /*
                    Il concetto è: disegno i frame della sprite passata ogni tot tempo
                    Se non è passato abbastanza tempo, ri-disegno la sprite corrente
                    F = frame

                    Sprite
                    ---------------------------------
                    |          |         |          |
                    |    F1    |   F2    |    F3    |
                    |________________________________
                    ^
                    index

                    Quando è passato abbastanza tempo, index si sposterà al frame F2:
                    Sprite
                    ---------------------------------
                    |          |         |          |
                    |    F1    |   F2    |    F3    |
                    |________________________________
                               ^
                               index
                 */

                let width = 48     //bat: 48
                let height = 64    //bat: 64
                let frames = 3     //bat: 3

                let t2 = performance.now()
                // Se è passato abbastanza tempo, vado al frame successivo
                // N.B: 1000/frames indica quanti frame renderizzare in un secondo.
                // Per rendere più smooth l animazione, viene preso il quadrato di questi
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

                // Se non ci sono più frames nella sprite, torno all inizio
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

    equals(entity) {
        if(!(entity instanceof Entity)) return false
        return this.position.x === entity.position.x && this.position.y === entity.position.y
    }
}

// Classe che rappresenta un blocco della piattaforma su cui il giocatore può stare
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
}

// Classe che rappresenta un nemico classico
// I nemici sono soggetti alla gravità e alle collisioni proprio come il giocatore
export class Enemy extends Entity {
    constructor({x = 0, y = 0, width = 75, height = 75, startPosX = x, endX = x}) {
        super({x, y, width, height, color: "blue"});
        this.speed = 3
        this.position = {
            x,
            y
        };
        this.startPosX = startPosX;
        this.endX = endX

        // variabile che stabilisce la velocità di caduta sull asse Y
        // o di avanzamento, sull asse X, verso destra o sinistra
        this.velocity = {
            x: Math.round(Math.random()) === 1 ? this.speed : -this.speed, // la direzione iniziale viene scelta a caso
            y: 1
        };

        this.size = {
            width,
            height
        };

        this.color = "blue"
        this.score = 1
    }

    // Funzione per muovere e disegnare il nemico sul canvas
    // Questa classe rappresenta un nemico che si muove avanti e indietro (come in super mario)
    // L andamento viene stabilito utilizzando:
    //      - 2 varibili (startPosX e endX) che rappresentano il punto iniziale e finale
    //      - la fisica: se un nemico se scontra contro un blocco di una piattaforma, torna indietro
    move() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.x = Math.max(0, this.position.x);

        this.position.y += this.velocity.y;

        if (this.startPosX > this.endX) {
            throw new Error("Posizione di enemy iniziale maggiore dell arrivo")
        }

        // Se il nemico ha raggiunto il limite, cambio la direzione
        if (this.position.x + this.size.width >= this.endX) {
            this.velocity.x = -this.speed;
        } else if (this.position.x <= this.startPosX) {
            this.velocity.x = this.speed;
        }

        // Caduta sull asse Y
        // Di fatto, il nemico cade finchè non ha raggiunto l altezza del canvas
        if (this.position.y + this.size.height + this.velocity.y <= canvas.height) {
            this.velocity.y += gravity;
        } else {
            this.velocity.y = 0;
        }

    }
}

// Classe che rappresenta un nemico volante. A differenza del padre, non è soggetto alla gravità bensì si muove in aria
export class Bird extends Enemy {
    constructor({x = 0, y = 0, width = 90, height = 120, startPosX = x, endX}) {
        super({x, y, width, height, startPosX, endX});
        this.color = "violet"
        this.score = 2
        this.animate = true
    }

    move() {
        // vedi classe padre
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

// Classe che rappresenta una torre. A differenza del padre, la torre rimane ferma e spara proiettili davanti a lei
export class Turret extends Enemy {
    constructor({x = 0, y = 0, width = 120, height = 160}) {
        super({x, y, width, height});
        this.color = "purple"
        this.bullet = new Entity({x, y, width: 10, height: 10, color: "black"})
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

// Classe che rappresenta una moneta raccoglibile
export class Coin extends Entity {
    constructor({x = 0, y = 0, width = 60, height = 60}) {
        super({x, y, width, height, color: "orange"});
    }
}

export class CheckPoint extends Entity {
    constructor({x = 0, y = 0, width = 30, height = 60}) {
        super({x, y, width, height, color: "grey"});
    }

    static defaultCheckpoint() {
        return new CheckPoint({x: 0, y: 0, width: 30, height: 60})
    }
}

// Classe che rappresenta un giocatore
export class Player extends Entity {
    constructor({x, y}) {
        super({x, y, width: 60, height: 60, color: "red"});
        this.position = {
            x,
            y
        };

        // Indica la velocità con cui il giocatore si muove o cade
        // la velocità sull asse x è determinata dalla pressione dei pulsanti sulla tastiera (vedi file game.js)
        this.velocity = {
            x: 0,
            y: 1
        }

        this.speed = 15 // indica la velocità standard del giocatore
        this.jumpForce = 17 // indica la forza del salta. Incrementando questo valore, l altezza del salto aumenta
        this.canJump = true // variabile che stabilisce se il giocatore può saltare. Evita i salti continui
        this.canDash = true // variabile che stabilisce se il giocatore può eseguire il dash
        this.jumpCount = 0  // indica il numero di salti fatti dal giocatore. Serve per il doppio salto
        this.image = getImage("../assets/player/player.png")
    }

    move() {
        this.draw()
        // Spostamento sull asse x del giocatore (se non premo nessun tasto, this.velocity.x = o)
        this.position.x += this.velocity.x
        this.position.x = Math.max(0, this.position.x) // evito che il giocatore possa andare fuori dallo schermo

        // Spostamento sull asse Y del giocatore. Simulo la caduto
        this.position.y += this.velocity.y

        // Se la posizione del giocatore non ha superato l altezza del canvas, allora può cadere ancora.
        // La velocity viene smussata tramite la variabile gravity per appunto "simulare" un accelerazione
        // (debug_mode ? 0 : 365) -> per non respawnare il giocatore raggiunta la fine del canvas,
        // intruduco un offset (365 in questo), in modo che il giocatore debba attendere quei 5/6 ms prima di poter
        // giocare ancora. Se si è in debug_mode, il giocatore non può morire ergo non introduco l offset
        if (this.position.y + this.size.height + this.velocity.y <= canvas.height + (debug_mode ? 0 : 365)) {
            this.velocity.y += gravity
        } else {
            if (!debug_mode) {
                this.die = true
                return
            }

            this.velocity.y = 0
            this.jumpCount = 0
            this.canJump = true
        }
    }
}

// Classe che rappresenta la nuvolina del tutorial quando si sblocca un potere nuovo
export class Cloudy extends Entity {
    constructor() {
        super({x: 0, y: 0, width: 60, height: 60, color: "white"})
        this.follow = undefined
        this.hide = false
    }

    showMessage(level) {
        if (this.hide) return

        switch (level) {
            case 1:
                break
            case 2:
                this.text = "   Doppio salto\nPremi 2 volte\nla barra spaziatrice"
                this.draw()
                break
            case 3:
                this.text = "  Dash\nPremi shift\nper andare veloce!"
                this.draw()
                break
        }
    }

    draw() {
        let x = this.follow.position.x
        let y = this.follow.position.y - 60
        let prevFont = ctx.font
        ctx.font = "17px Arial"

        //nuvolina
        ctx.beginPath()
        ctx.arc(x, y, 30, Math.PI * 0.5, Math.PI * 1.5)
        ctx.arc(x + 35, y - 30, 35, Math.PI * 1.1, Math.PI * 1.85)
        ctx.arc(x + 70, y, 50, Math.PI * 1.37, Math.PI * 1.91)
        ctx.arc(x + 100, y + 10, 50, Math.PI * 1.5, Math.PI * 0.12)
        ctx.moveTo(x + 150, y + 30)
        ctx.lineTo(x, y + 30)
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 10
        ctx.stroke()
        ctx.fillStyle = '#ffffff'
        ctx.fill()

        ctx.fillStyle = "black";
        let lines = this.text.split("\n")
        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], x, y - 22 + i * 20)
        }
        ctx.font = prevFont
    }
}

/*
    Per capire meglio, guardare il file collision_explained.pdf nella cartella del progetto

    collision detection sull asse delle x
    Se il giocatore tenta di oltrepassare un blocco, questo "tentativo" viene rilevato e la funzione ritorna true

    Il controllo sull asse X viene fatto per controllare che il giocatore non penetri dentro un blocco
    Il controllo sull asse Y viene fatto per controllare che il giocatore possa avanzare sopra un blocco
 */
function collisionX(e1, e2) {
    return e1.position.x + e1.size.width >= e2.position.x &&
        e1.position.x <= e2.position.x + e2.size.width &&
        e1.position.y + e1.size.height >= e2.position.y &&
        e1.position.y <= e2.position.y + e2.size.height
}

/*
    collision detection sull asse delle y
    Se il giocatore cade sopra una piattoforma, la funzione ritorna true in quanto viene rilevato "l attraversamento"


    Il controllo sull asse Y serve per fare in modo che il giocatore possa soprastare sopra una piattaforma
    Il controllo sull asse X serve per far cadere il giocatore quando esce da una piattaforma
 */
function collisionY(e1, e2) {
    return e1.position.y + e1.size.height <= e2.position.y &&
        e1.position.y + e1.size.height + e1.velocity.y >= e2.position.y &&
        e1.position.x + e1.size.width >= e2.position.x + e1.velocity.x &&
        e1.position.x <= e2.position.x + e2.size.width + e1.velocity.x
}