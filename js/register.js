let form = document.getElementById("registerForm")
let errorLabel = document.getElementById("logLabel")

form.addEventListener("submit", function(e) {
    e.preventDefault();
    let data = new FormData(form)
    let ajax = new XMLHttpRequest()

    let valid = valide(data)
    if(!valid) {
        return
    }

    ajax.open('POST', '../php/register.php')
    ajax.onload = function() {
        if (ajax.status === 200) {
            document.open()
            document.write(ajax.responseText)
            document.close()
        }else {
            switch (ajax.status) {
                case 400:
                    errorLabel.innerText = "Le 2 password non corrispondono"
                    break
                case 404:
                    errorLabel.innerText = "Username già utilizzato"
                    break
                case 300:
                    errorLabel.innerText = "Username o password non settate"
                    break
                case 301:
                    errorLabel.innerText = "Lo username non può essere più lungo di 10 caratteri"
                    break
                case 302:
                    errorLabel.innerText = "La password non può essere più lunga di 16 caratteri"
                    break
                case 303:
                    errorLabel.innerText = "Username e password non possono essere solo caratteri bianchi"
                    break
                default:
                    errorLabel.innerText = "Errore sconosciuto"
                    break
            }
        }
    }

    ajax.send(data)
})

function valide(form) {
    let username = form.get("username")
    let password = form.get("password")
    let repeat_password = form.get("repeat_password")

    if (username.length === 0 || password.length === 0 || repeat_password.length === 0) {
        errorLabel.innerText = "Username o password non settate"
        return false
    }

    if (username.trim().length === 0 || password.trim().length === 0 || repeat_password.trim().length === 0) {
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

    if(password !== repeat_password) {
        errorLabel.innerText = "Le 2 password non corrispondono"
        return false
    }

    return true
}