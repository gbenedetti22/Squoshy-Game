const form = document.getElementById("loginForm")
const errorLabel = document.getElementById("logLabel")
const username = document.getElementById("username")
const passwordField = document.getElementById("password")
const showPasswwordButton = document.getElementById("showPassword")

async function doLogin(event) {
    await fetch(event.target.action, {
        method: "POST",
        body: new URLSearchParams(new FormData(event.target)),
    }).then(response => {
        if (response.status === 200) {
            localStorage.setItem("username", username.value)
            window.location.href = response.url
        } else {
            response.text().then(text => {
                errorLabel.innerText = text
            })
        }
    })
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!valide(form.username.value, form.password.value)) {
        return
    }

    await doLogin(e);
})

let canShow = true
showPasswwordButton.addEventListener('click', () => {
    canShow = !canShow
    showPasswwordButton.className = canShow ? "far fa-eye" : "far fa-eye-slash"
    passwordField.type = canShow ? "password" : "text"
})

function valide(username, password) {
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
localStorage.clear() // in caso rimanga lo username del vecchio login