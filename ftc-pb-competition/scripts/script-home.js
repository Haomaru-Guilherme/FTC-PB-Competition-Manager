const gatilhos = document.querySelectorAll("[data-secao]");
const links = document.querySelectorAll(".menu-lista a");
const secoes = document.querySelectorAll(".secao");

function mostrarSecao(nome) {
    secoes.forEach(function (s) {
        s.classList.remove("ativa");
    });

    links.forEach(function (l) {
        l.classList.toggle("ativo", l.dataset.secao === nome);
    });

    document.getElementById(nome).classList.add("ativa");
    
    fecharMenu();
}

gatilhos.forEach(function (gatilho) {
    gatilho.addEventListener("click", function (event) {
        event.preventDefault();
        mostrarSecao(gatilho.dataset.secao);
    });

});

const equipes = [
    { nome: "Criadores", pontos: 18, partidas: 4, logo: "../imagens/first.png"},
    { nome: "Criadores do amanhã", pontos: 17, partidas: 4, logo: "../imagens/first.png"},
    { nome: "Robotech", pontos: 15, partidas: 4, logo: "../imagens/robotech.webp"},
    { nome: "Robossauros", pontos: 14, partidas: 4, logo: "../imagens/first.png"},
    { nome: "Legonautas", pontos: 14, partidas: 4, logo: "../imagens/first.png"},
    { nome: "Destemidos", pontos: 14, partidas: 4, logo: "../imagens/first.png"},
    { nome: "Battech", pontos: 14, partidas: 4, logo: "../imagens/first.png"},
    { nome: "FT Camb", pontos: 14, partidas: 4, logo: "../imagens/first.png"},
];

const corpo = document.getElementById("ranking-corpo");

function montarRanking() {
    const ordenadas = [...equipes].sort(function (a, b) {
        return b.pontos - a.pontos || a.partidas - b.partidas;
    });

    corpo.innerHTML = "";

    ordenadas.forEach(function (equipe, indice) {
        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${indice + 1}</td>
            <td>
                <div class="equipe-celula">
                    <img src="${equipe.logo}" alt="Logo ${equipe.nome}" class="equipe-logo">
                    <span>${equipe.nome}</span>
                </div>
            </td>
            <td>${equipe.pontos}</td>
            <td>${equipe.partidas}</td>
        `;

        corpo.appendChild(linha);
    });
    const lider = ordenadas[0];

    if (lider) {
        const logo = document.getElementById("lider-logo");
        logo.src = lider.logo;
        logo.alt = "Logo " + lider.nome;

        document.getElementById("lider-nome").textContent = lider.nome;
        document.getElementById("lider-pontos").textContent = lider.pontos + " pontos";
    }

}

montarRanking();

const menu = document.querySelector(".menu");
const overlay = document.getElementById("overlay");
const btnMenu = document.getElementById("btn-menu");

function abrirMenu() {
    menu.classList.add("aberto");
    overlay.classList.add("visivel");
}

function fecharMenu() {
    menu.classList.remove("aberto");
    overlay.classList.remove("visivel");
}

btnMenu.addEventListener("click", abrirMenu);
overlay.addEventListener("click", fecharMenu);