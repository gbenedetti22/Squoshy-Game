let form = document.getElementById("loginForm")
let errorLabel = document.getElementById("logLabel")

form.addEventListener("submit", function(event) {
    event.preventDefault();
    let data = new FormData(form)
    let ajax = new XMLHttpRequest()

    let valid = valide(data)
    if(!valid) {
        return
    }

    ajax.open('POST', '../php/login.php')
    ajax.onload = function() {
        if (ajax.status === 200) {
            document.open()
            document.write(ajax.responseText)
            document.close()
        } else if(ajax.status === 500){
            errorLabel.innerText = "Impossibile stabilire una connessione con il server"
        }else {
            errorLabel.innerText = "Username non esistente o password errata"
        }
    }

    ajax.send(data)
})

function valide(form) {
    let username = form.get("username")
    let password = form.get("password")

    if (username.length === 0 || password.length === 0) {
        errorLabel.innerText = "Username o password non settate"
        return false
    }

    if (username.trim().length === 0 || password.trim().length === 0) {
        errorLabel.innerText = "Username e password non possono contenere solo caratteri bianchi"
        return false
    }

    if (username.length > 10) {
        errorLabel.innerText = "Lo username non può essere più lungo di 10 caratteri"
        return false
    }
    if (password.length > 16) {
        errorLabel.innerText = "La password non può essere più lunga di 16 caratteri"
        return false
    }

    return true
}