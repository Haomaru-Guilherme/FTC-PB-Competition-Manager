console.log("script carregou");
const form = document.getElementById("login-form");
console.log(form)
form.addEventListener("submit", function (event) {
    event.preventDefault();
    const usuario = document.getElementById("username").value;
    const senha = document.getElementById("password").value;

    if (usuario === "juiz" && senha === "ftc2026") {
        window.location.href = "pag-home.html";
    } else{
        alert("Usuário ou senha incorretos");
    }
});