let form = document.getElementById("registerForm")
let errorLabel = document.getElementById("logLabel")
const showPasswwordButton = document.getElementById("showPassword")
const passwordField = document.getElementById("password")
const repeatPassword = document.getElementById("repeat_password")

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if(!valide(form.username.value, form.password.value, form.repeat_password.value)) {
        return
    }

    await doRegister(e)
})

async function doRegister(event) {
    await fetch(event.target.action, {
        method: "POST",
        body: new URLSearchParams(new FormData(event.target)),
    }).then(response => {
        console.log(response)
        if (response.status === 200) {
            window.location.href = response.url
        } else {
            response.text().then(text => {
                errorLabel.innerText = text
            })
        }
    })
}

let canShow = true
showPasswwordButton.addEventListener('click', () => {
    canShow = !canShow
    showPasswwordButton.className = canShow ? "far fa-eye" : "far fa-eye-slash"
    passwordField.type = canShow ? "password" : "text"
    repeatPassword.type = canShow ? "password" : "text"
})

function valide(username, password1, password2) {

    if (username.length === 0 || password1.length === 0 || password2.length === 0) {
        errorLabel.innerText = "Username o password non settate"
        return false
    }

    if (username.trim().length === 0 || password1.trim().length === 0 || password2.trim().length === 0) {
        errorLabel.innerText = "Username e password non possono contenere solo caratteri bianchi"
        return false
    }

    if (username.length > 10) {
        errorLabel.innerText = "Lo username non può essere più lungo di 10 caratteri"
        return false
    }
    if (password1.length > 16) {
        errorLabel.innerText = "La password non può essere più lunga di 16 caratteri"
        return false
    }

    if(password1 !== password2) {
        errorLabel.innerText = "Le 2 password non corrispondono"
        return false
    }

    return true
}