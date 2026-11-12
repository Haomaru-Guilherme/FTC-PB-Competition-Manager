const links = document.querySelectorAll(".menu-lista a");
const secoes = document.querySelectorAll(".secao");

links.forEach(function (link) {
    link.addEventListener("click", function (event) {
        event.preventDefault();

        const alvo = link.dataset.secao;

        links.forEach(function (l) {
            l.classList.remove("ativo");
        });
        secoes.forEach(function (s) {
            s.classList.remove("ativa");
        });

        link.classList.add("ativo");
        document.getElementById(alvo).classList.add("ativa");
    });
});

const equipes = [
    { nome: "Team Alpha", pontos: 0, partidas: 0 },
    { nome: "Team Beta", pontos: 0, partidas: 0 },
    { nome: "Team Gamma", pontos: 0, partidas: 0 },
];

const corpo = document.getElementById("ranking-corpo");

equipes.forEach(function (equipe, indice) {
    const linha = document.createElement("tr");

    linha.innerHTML = `
        <td>${indice + 1}</td>
        <td>${equipe.nome}</td>
        <td>${equipe.pontos}</td>
        <td>${equipe.partidas}</td>
    `;

    corpo.appendChild(linha);
});

equipes.sort(function (a, b) {
    return b.pontos - a.pontos;
});