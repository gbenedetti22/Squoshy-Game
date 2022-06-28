let table = document.getElementById("table")
let rows = []
const loggedUsername = localStorage.getItem("username")
const newAttemptButton = document.getElementById("new_attempt")

/*
    File JS per la visualizzazione dello scoreboard
    L oggetto contenente tutti i giocatori viene scaricato dal Server mediante richiesta AJAX

    Per scelta implementativa, si possono avere al più 10 giocatori
 */

// creo la tabella
for (let i = 0; i < 10; i++) {
    let row = table.insertRow(i);
    let rowNumber = row.insertCell(0);
    let usernameCell = row.insertCell(1);
    let scoreCell = row.insertCell(2);
    rows.push([rowNumber, usernameCell, scoreCell])
}
// scarico dal Server i giocatori
let ajax = new XMLHttpRequest();
ajax.open("GET", "../php/scores.php", false);
ajax.send();
let scores = JSON.parse(ajax.responseText)

// Setto i valori dentro la tabella
let index = 0
for (const [username, score] of Object.entries(scores)) {
    let tr = rows[index]

    tr[0].innerText = String(index + 1) + ". "

    let usernameCell = tr[1]
    usernameCell.innerText = String(username)

    let scoreCell = tr[2]
    scoreCell.innerText = String(score)

    usernameCell.className = "show"
    index++

    // il giocatore corrente viene evidenziato
    if (tr[1].innerText === loggedUsername) {
        tr[0].style.backgroundColor = "yellow"
        tr[1].style.backgroundColor = "yellow"
        tr[2].style.backgroundColor = "yellow"
    }
}

newAttemptButton.onclick = () => window.location.href = '../index.php'