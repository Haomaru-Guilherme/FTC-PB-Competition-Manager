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

/* ---------- DADOS ---------- */

const equipes = [
    { id: 101, nome: "Criadores", nopr: 100, logo: "../imagens/first.png" },
    { id: 102, nome: "Criadores do amanhã", nopr: 100, logo: "../imagens/first.png" },
    { id: 103, nome: "Robotech", nopr: 100, logo: "../imagens/robotech.webp" },
    { id: 104, nome: "Robossauros", nopr: 100, logo: "../imagens/first.png" },
    { id: 105, nome: "Legonautas", nopr: 100, logo: "../imagens/first.png" },
    { id: 106, nome: "Destemidos", nopr: 100, logo: "../imagens/first.png" },
    { id: 107, nome: "Battech", nopr: 100, logo: "../imagens/first.png" },
    { id: 108, nome: "FT Camb", nopr: 100, logo: "../imagens/first.png" },
];

const partidas = [
    {
        numero: 1,
        vermelha: { equipes: [101, 102], placar: 120 },
        azul:     { equipes: [103, 104], placar: 95 },
    },
    {
        numero: 2,
        vermelha: { equipes: [105, 106], placar: 80 },
        azul:     { equipes: [107, 108], placar: 80 },
    },
    {
        numero: 3,
        vermelha: { equipes: [101, 103], placar: null },
        azul:     { equipes: [102, 104], placar: null },
    },
];

/* ---------- FUNÇÕES AUXILIARES ---------- */

function buscarEquipe(id) {
    return equipes.find(function (e) { return e.id === id; });
}

function resultado(partida) {
    const v = partida.vermelha.placar;
    const a = partida.azul.placar;

    if (v === null || a === null) return null;
    if (v > a) return "vermelha";
    if (a > v) return "azul";
    return "empate";
}

function calcularWlt() {
    const tabela = {};

    equipes.forEach(function (e) {
        tabela[e.id] = { w: 0, l: 0, t: 0 };
    });

    partidas.forEach(function (p) {
        const r = resultado(p);
        if (!r) return;

        ["vermelha", "azul"].forEach(function (cor) {
            p[cor].equipes.forEach(function (id) {
                if (r === "empate") tabela[id].t++;
                else if (r === cor) tabela[id].w++;
                else tabela[id].l++;
            });
        });
    });

    return tabela;
}

function totalPartidas(wlt) {
    return wlt.w + wlt.l + wlt.t;
}

function formatarWlt(wlt) {
    return `${wlt.w}-${wlt.l}-${wlt.t}`;
}

/* ---------- RANKING ---------- */

const corpo = document.getElementById("ranking-corpo");

function montarRanking() {
    const wltPorEquipe = calcularWlt();

    const ordenadas = equipes
        .map(function (equipe) {
            return { ...equipe, wlt: wltPorEquipe[equipe.id] };
        })
        .sort(function (a, b) {
            return b.wlt.w - a.wlt.w
                || b.wlt.t - a.wlt.t
                || a.wlt.l - b.wlt.l
                || b.nopr - a.nopr;
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
            <td>${formatarWlt(equipe.wlt)}</td>
            <td>${totalPartidas(equipe.wlt)}</td>
            <td>${equipe.nopr}</td>
        `;

        corpo.appendChild(linha);
    });

    const lider = ordenadas[0];

    if (lider) {
        const logo = document.getElementById("lider-logo");
        logo.src = lider.logo;
        logo.alt = "Logo " + lider.nome;

        document.getElementById("lider-nome").textContent = lider.nome;
        document.getElementById("lider-pontos").textContent = formatarWlt(lider.wlt);
    }

    document.getElementById("total-equipes").textContent = equipes.length + " equipes";
}

/* ---------- PARTIDAS ---------- */

const listaPartidas = document.getElementById("lista-partidas");

function montarPartidas() {
    listaPartidas.innerHTML = "";

    partidas.forEach(function (p) {
        const r = resultado(p);

        const nomes = function (cor) {
            return p[cor].equipes.map(function (id) {
                return `<span>${buscarEquipe(id).nome}</span>`;
            }).join("");
        };

        const card = document.createElement("div");
        card.className = "partida";
        card.innerHTML = `
            <div class="alianca vermelha ${r === "vermelha" ? "vencedora" : ""}">
                <div class="alianca-equipes">${nomes("vermelha")}</div>
                <strong class="alianca-placar">${p.vermelha.placar ?? "-"}</strong>
            </div>
            <div class="partida-numero">Q${p.numero}</div>
            <div class="alianca azul ${r === "azul" ? "vencedora" : ""}">
                <strong class="alianca-placar">${p.azul.placar ?? "-"}</strong>
                <div class="alianca-equipes">${nomes("azul")}</div>
            </div>
        `;

        listaPartidas.appendChild(card);
    });
}

/* ---------- MENU MOBILE ---------- */

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

/* ---------- INICIALIZAÇÃO ---------- */

montarRanking();
montarPartidas();