/* =====================================================================
   PAINEL FTC COMPETITION - VISÃO PÚBLICA (EM TEMPO REAL)
   ===================================================================== */

const CHAVE_EQUIPES = "ftc-equipes";
const CHAVE_PARTIDAS = "ftc-partidas";

function carregarDados() {
    try {
        const equipesSalvas = localStorage.getItem(CHAVE_EQUIPES);
        const partidasSalvas = localStorage.getItem(CHAVE_PARTIDAS);

        const equipes = equipesSalvas ? JSON.parse(equipesSalvas) : [];
        const partidas = partidasSalvas ? JSON.parse(partidasSalvas) : [];

        return { equipes, partidas };
    } catch (erro) {
        console.error("Erro ao carregar dados do localStorage:", erro);
        return { equipes: [], partidas: [] };
    }
}

// Navegação entre seções
const gatilhos = document.querySelectorAll("[data-secao]");
const links = document.querySelectorAll(".menu-lista a");
const secoes = document.querySelectorAll(".secao");

function mostrarSecao(nome) {
    secoes.forEach(s => s.classList.remove("ativa"));
    links.forEach(l => l.classList.toggle("ativo", l.dataset.secao === nome));
    
    const alvo = document.getElementById(nome);
    if (alvo) alvo.classList.add("ativa");

    fecharMenu();
}

gatilhos.forEach(gatilho => {
    gatilho.addEventListener("click", event => {
        event.preventDefault();
        mostrarSecao(gatilho.dataset.secao);
    });
});

// Funções auxiliares de cálculo
function buscarEquipe(id, equipes) {
    return equipes.find(e => e.id === id);
}

function resultado(partida) {
    const v = partida.vermelha.placar;
    const a = partida.azul.placar;

    if (v === null || a === null) return null;
    if (v > a) return "vermelha";
    if (a > v) return "azul";

    return "empate";
}

function calcularWlt(equipes, partidas) {
    const tabela = {};
    equipes.forEach(e => { tabela[e.id] = { w: 0, l: 0, t: 0 }; });

    partidas.forEach(p => {
        const r = resultado(p);
        if (!r) return;

        ["vermelha", "azul"].forEach(cor => {
            p[cor].equipes.forEach(id => {
                if (tabela[id]) {
                    if (r === "empate") tabela[id].t++;
                    else if (r === cor) tabela[id].w++;
                    else tabela[id].l++;
                }
            });
        });
    });

    return tabela;
}

function calcularMediaPontos(equipes, partidas) {
    const acumulador = {};
    equipes.forEach(e => { acumulador[e.id] = { somaPontos: 0, partidasJogadas: 0 }; });

    partidas.forEach(p => {
        ["vermelha", "azul"].forEach(cor => {
            const pontosNormais = p[cor].pontosNormais ?? p[cor].placar;
            if (pontosNormais !== null && pontosNormais !== undefined) {
                p[cor].equipes.forEach(id => {
                    if (acumulador[id]) {
                        acumulador[id].somaPontos += pontosNormais;
                        acumulador[id].partidasJogadas++;
                    }
                });
            }
        });
    });

    const medias = {};
    Object.keys(acumulador).forEach(id => {
        const dados = acumulador[id];
        medias[id] = dados.partidasJogadas > 0 ? Number((dados.somaPontos / dados.partidasJogadas).toFixed(1)) : 0;
    });

    return medias;
}

function totalPartidas(wlt) {
    if (!wlt) return 0;
    return wlt.w + wlt.l + wlt.t;
}

function formatarWlt(wlt) {
    if (!wlt) return "0-0-0";
    return `${wlt.w}-${wlt.l}-${wlt.t}`;
}

// Renderizar Ranking
function montarRanking() {
    const corpo = document.getElementById("ranking-corpo");
    if (!corpo) return;

    const { equipes, partidas } = carregarDados();
    const wltPorEquipe = calcularWlt(equipes, partidas);
    const mediaPorEquipe = calcularMediaPontos(equipes, partidas);

    const ordenadas = equipes.map(equipe => ({
        ...equipe,
        wlt: wltPorEquipe[equipe.id] || { w: 0, l: 0, t: 0 },
        nopr: mediaPorEquipe[equipe.id] || 0
    })).sort((a, b) => 
        b.wlt.w - a.wlt.w || b.wlt.t - a.wlt.t || a.wlt.l - b.wlt.l || b.nopr - a.nopr
    );

    corpo.innerHTML = "";
    ordenadas.forEach((equipe, indice) => {
        const linha = document.createElement("tr");
        linha.innerHTML = `
            <td>${indice + 1}</td>
            <td>
                <div class="equipe-celula">
                    <img src="${equipe.logo || '../imagens/first.png'}" alt="Logo ${equipe.nome}" class="equipe-logo" onerror="this.src='../imagens/first.png'">
                    <span>${equipe.nome}</span>
                </div>
            </td>
            <td>${formatarWlt(equipe.wlt)}</td>
            <td>${totalPartidas(equipe.wlt)}</td>
            <td>${equipe.nopr}</td>
        `;
        corpo.appendChild(linha);
    });

    // High Score
    let maiorPontuacao = 0;
    let equipesMaiorPontuacao = [];
    let nomeEquipesTexto = "-";

    partidas.forEach(p => {
        ["vermelha", "azul"].forEach(cor => {
            const placar = p[cor].placar;
            if (placar !== null && placar !== undefined) {
                if (placar > maiorPontuacao) {
                    maiorPontuacao = placar;
                    equipesMaiorPontuacao = p[cor].equipes.map(id => buscarEquipe(id, equipes)).filter(Boolean);
                } else if (placar === maiorPontuacao && placar > 0) {
                    p[cor].equipes.forEach(id => {
                        const eq = buscarEquipe(id, equipes);
                        if (eq && !equipesMaiorPontuacao.some(item => item.id === eq.id)) {
                            equipesMaiorPontuacao.push(eq);
                        }
                    });
                }
            }
        });
    });

    if (equipesMaiorPontuacao.length > 0) {
        nomeEquipesTexto = equipesMaiorPontuacao.map(e => e.nome).join(" & ");
    } else {
        maiorPontuacao = "-";
        nomeEquipesTexto = "-";
    }

    const containerLogos = document.getElementById("lider-logos-container");
    if (containerLogos) {
        containerLogos.innerHTML = "";
        equipesMaiorPontuacao.forEach(eq => {
            const img = document.createElement("img");
            img.src = eq.logo || "../imagens/first.png";
            img.alt = "Logo " + eq.nome;
            img.className = "destaque-logo";
            containerLogos.appendChild(img);
        });
    }

    document.getElementById("lider-nome").textContent = nomeEquipesTexto;
    document.getElementById("lider-pontos").textContent = maiorPontuacao;
    document.getElementById("total-equipes").textContent = equipes.length + " equipes";
}

// Renderizar Equipes (somente cards)
function montarEquipesPublico() {
    const container = document.getElementById("lista-equipes");
    if (!container) return;

    const { equipes } = carregarDados();
    container.innerHTML = "";

    equipes.forEach(equipe => {
        const card = document.createElement("div");
        card.className = "card-equipe";
        const logoSrc = equipe.logo && equipe.logo.trim() !== "" ? equipe.logo : "../imagens/first.png";

        card.innerHTML = `
            <img src="${logoSrc}" alt="Logo ${equipe.nome}" class="card-equipe-logo" onerror="this.src='../imagens/first.png'">
            <div class="card-equipe-info">
                <span class="card-equipe-id">Equipe #${equipe.id}</span>
                <span class="card-equipe-nome" title="${equipe.nome}">${equipe.nome}</span>
            </div>
        `;
        container.appendChild(card);
    });
}

// Renderizar Partidas (somente listagem)
function montarPartidasPublico() {
    const listaPartidas = document.getElementById("lista-partidas");
    if (!listaPartidas) return;

    const { equipes, partidas } = carregarDados();
    listaPartidas.innerHTML = "";

    partidas.forEach(p => {
        const r = resultado(p);
        const nomes = cor => p[cor].equipes.map(id => {
            const equipe = buscarEquipe(id, equipes);
            return `<span>${equipe ? equipe.nome : "Equipe não encontrada"}</span>`;
        }).join("");

        const card = document.createElement("div");
        card.className = "partida";
        card.innerHTML = `
            <div class="alianca v ${r === "vermelha" ? "vencedora-v vermelha" : ""}">
                <div class="alianca-equipes">${nomes("vermelha")}</div>
                <strong class="alianca-placar">${p.vermelha.placar ?? "-"}</strong>
            </div>
            <div class="partida-numero">Q${p.numero}</div>
            <div class="alianca a ${r === "azul" ? "vencedora-a azul" : ""}">
                <strong class="alianca-placar">${p.azul.placar ?? "-"}</strong>
                <div class="alianca-equipes">${nomes("azul")}</div>
            </div>
        `;
        listaPartidas.appendChild(card);
    });
}

// Menu mobile
const menu = document.querySelector(".menu");
const overlay = document.getElementById("overlay");
const btnMenu = document.getElementById("btn-menu");

function abrirMenu() {
    if (menu) menu.classList.add("aberto");
    if (overlay) overlay.classList.add("visivel");
}

function fecharMenu() {
    if (menu) menu.classList.remove("aberto");
    if (overlay) overlay.classList.remove("visivel");
}

if (btnMenu) btnMenu.addEventListener("click", abrirMenu);
if (overlay) overlay.addEventListener("click", fecharMenu);

// Sincronização automática em tempo real com as alterações do Juiz
window.addEventListener("storage", (event) => {
    if (event.key === CHAVE_EQUIPES || event.key === CHAVE_PARTIDAS) {
        montarRanking();
        montarEquipesPublico();
        montarPartidasPublico();
    }
});

// Inicialização
montarRanking();
montarEquipesPublico();
montarPartidasPublico();