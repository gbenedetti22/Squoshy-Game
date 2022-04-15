let table = document.getElementById("table")
let rows = []


for (let i = 0; i < 10; i++) {
    let row = table.insertRow(i);
    let rowNumber = row.insertCell(0);
    let usernameCell = row.insertCell(1);
    let scoreCell = row.insertCell(2);
    rows.push([rowNumber, usernameCell, scoreCell])
}

let ajax = new XMLHttpRequest();
ajax.open("GET", "../php/scores.php", false);
ajax.send();
let scores = JSON.parse(ajax.responseText)

let index = 0
for (const [username, score] of Object.entries(scores)) {
    let tr = rows[index]

    tr[0].innerText = String(index + 1)+". "

    let usernameCell = tr[1]
    usernameCell.innerText = String(username)

    let scoreCell = tr[2]
    scoreCell.innerText = String(score)

    usernameCell.className = "show"
}