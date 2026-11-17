/* =====================================================================
   PAINEL FTC COMPETITION - REGIONAL PARAÍBA
   Organização do arquivo:
     1. Navegação entre seções
     2. Dados (equipes e partidas)
     3. Funções auxiliares (cálculos)
     4. Ranking
     5. Partidas (lista)
     6. Formulário para adicionar partidas
     7. Menu mobile
     8. Inicialização
   ===================================================================== */


/* =====================================================================
   1. NAVEGAÇÃO ENTRE SEÇÕES
   ===================================================================== */

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


/* =====================================================================
   2. DADOS
   ===================================================================== */

// Lista de equipes (nota: o valor inicial de nOPR será calculado dinamicamente)
const equipes = [
    { id: 101, nome: "Criadores", logo: "../imagens/first.png" },
    { id: 102, nome: "Criadores do amanhã", logo: "../imagens/first.png" },
    { id: 103, nome: "Robotech", logo: "../imagens/robotech.webp" },
    { id: 104, nome: "Robossauros", logo: "../imagens/first.png" },
    { id: 105, nome: "Legonautas", logo: "../imagens/first.png" },
    { id: 106, nome: "Destemidos", logo: "../imagens/first.png" },
    { id: 107, nome: "Battech", logo: "../imagens/first.png" },
    { id: 108, nome: "FT Camb", logo: "../imagens/first.png" },
];

// Chave de armazenamento
const CHAVE_PARTIDAS = "ftc-partidas";

// Partidas iniciais
const PARTIDAS_INICIAIS = [
    {
        numero: 1,
        vermelha: { equipes: [101, 102], placar: 120 },
        azul: { equipes: [103, 104], placar: 95 },
    },
    {
        numero: 2,
        vermelha: { equipes: [105, 106], placar: 80 },
        azul: { equipes: [107, 108], placar: 80 },
    },
    {
        numero: 3,
        vermelha: { equipes: [101, 103], placar: null },
        azul: { equipes: [102, 104], placar: null },
    },
];

// Carregar partidas salvas
function carregarPartidas() {
    try {
        const salvo = localStorage.getItem(CHAVE_PARTIDAS);

        if (salvo) {
            return JSON.parse(salvo);
        }

    } catch (erro) {
        console.error("Não foi possível ler as partidas salvas:", erro);
    }

    return PARTIDAS_INICIAIS.map(function (p) {
        return {
            ...p,
            vermelha: { ...p.vermelha, equipes: [...p.vermelha.equipes] },
            azul: { ...p.azul, equipes: [...p.azul.equipes] }
        };
    });
}

// Salvar partidas
function salvarPartidas() {
    try {
        localStorage.setItem(CHAVE_PARTIDAS, JSON.stringify(partidas));

    } catch (erro) {
        console.error("Não foi possível salvar as partidas:", erro);
    }
}

// Lista de partidas em uso
const partidas = carregarPartidas();


/* =====================================================================
   3. FUNÇÕES AUXILIARES
   ===================================================================== */

// Buscar equipe pelo ID
function buscarEquipe(id) {
    return equipes.find(function (e) {
        return e.id === id;
    });
}

// Identificar resultado da partida
function resultado(partida) {
    const v = partida.vermelha.placar;
    const a = partida.azul.placar;

    if (v === null || a === null) return null;
    if (v > a) return "vermelha";
    if (a > v) return "azul";

    return "empate";
}

// Calcular vitórias, derrotas e empates
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

                if (r === "empate") {
                    tabela[id].t++;

                } else if (r === cor) {
                    tabela[id].w++;

                } else {
                    tabela[id].l++;
                }

            });
        });
    });

    return tabela;
}

// Calcular média de pontos (nOPR) e total de partidas para cada equipe
function calcularMediaPontos() {
    const acumulador = {};

    equipes.forEach(function (e) {
        acumulador[e.id] = { somaPontos: 0, partidasJogadas: 0 };
    });

    partidas.forEach(function (p) {
        ["vermelha", "azul"].forEach(function (cor) {
            const placar = p[cor].placar;
            // Considera apenas partidas que já possuem placar lançado
            if (placar !== null && placar !== undefined) {
                p[cor].equipes.forEach(function (id) {
                    if (acumulador[id]) {
                        acumulador[id].somaPontos += placar;
                        acumulador[id].partidasJogadas++;
                    }
                });
            }
        });
    });

    const medias = {};
    Object.keys(acumulador).forEach(function (id) {
        const dados = acumulador[id];
        if (dados.partidasJogadas > 0) {
            // Calcula a média e arredonda para 1 casa decimal (ex: 95.5)
            medias[id] = Number((dados.somaPontos / dados.partidasJogadas).toFixed(1));
        } else {
            medias[id] = 0;
        }
    });

    return medias;
}

// Total de partidas jogadas
function totalPartidas(wlt) {
    return wlt.w + wlt.l + wlt.t;
}

// Formatar W-L-T
function formatarWlt(wlt) {
    return `${wlt.w}-${wlt.l}-${wlt.t}`;
}


/* =====================================================================
   4. RANKING
   ===================================================================== */

const corpo = document.getElementById("ranking-corpo");

function montarRanking() {

    const wltPorEquipe = calcularWlt();
    const mediaPorEquipe = calcularMediaPontos();

    const ordenadas = equipes
        .map(function (equipe) {
            return {
                ...equipe,
                wlt: wltPorEquipe[equipe.id],
                nopr: mediaPorEquipe[equipe.id] || 0
            };
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
                    <img
                        src="${equipe.logo}"
                        alt="Logo ${equipe.nome}"
                        class="equipe-logo"
                    >

                    <span>${equipe.nome}</span>
                </div>
            </td>

            <td>${formatarWlt(equipe.wlt)}</td>
            <td>${totalPartidas(equipe.wlt)}</td>
            <td>${equipe.nopr}</td>
        `;

        corpo.appendChild(linha);
    });

    // --- Lógica do High Score (Maior Pontuação) ---
    let maiorPontuacao = 0;
    let equipesMaiorPontuacao = [];
    let nomeEquipesTexto = "-";

    partidas.forEach(function (p) {
        ["vermelha", "azul"].forEach(function (cor) {
            const placar = p[cor].placar;
            if (placar !== null && placar !== undefined) {
                if (placar > maiorPontuacao) {
                    maiorPontuacao = placar;
                    const objsEquipes = p[cor].equipes.map(id => buscarEquipe(id)).filter(Boolean);
                    equipesMaiorPontuacao = objsEquipes;
                } else if (placar === maiorPontuacao && placar > 0) {
                    p[cor].equipes.forEach(id => {
                        const eq = buscarEquipe(id);
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
    containerLogos.innerHTML = "";

    if (equipesMaiorPontuacao.length > 0) {
        equipesMaiorPontuacao.forEach(function(eq) {
            const img = document.createElement("img");
            img.src = eq.logo;
            img.alt = "Logo " + eq.nome;
            img.className = "destaque-logo";
            containerLogos.appendChild(img);
        });
    } else {
        const img = document.createElement("img");
        img.className = "destaque-logo";
        containerLogos.appendChild(img);
    }

    document.getElementById("lider-nome").textContent = nomeEquipesTexto;
    document.getElementById("lider-pontos").textContent = maiorPontuacao;

    document.getElementById("total-equipes").textContent =
        equipes.length + " equipes";
}


/* =====================================================================
   5. PARTIDAS (LISTA)
   ===================================================================== */

const listaPartidas = document.getElementById("lista-partidas");

function montarPartidas() {

    listaPartidas.innerHTML = "";

    // IMPORTANTE: indice identifica cada partida na lista
    partidas.forEach(function (p, indice) {

        const r = resultado(p);

        // Gerar nomes das equipes
        const nomes = function (cor) {

            return p[cor].equipes.map(function (id) {

                const equipe = buscarEquipe(id);

                return `<span>${equipe ? equipe.nome : "Equipe não encontrada"}</span>`;

            }).join("");
        };

        // Criar card da partida
        const card = document.createElement("div");

        card.className = "partida";

        card.innerHTML = `
            <div class="alianca vermelha ${r === "vermelha" ? "vencedora" : ""}">

                <div class="alianca-equipes">
                    ${nomes("vermelha")}
                </div>

                <strong class="alianca-placar">
                    ${p.vermelha.placar ?? "-"}
                </strong>

            </div>

            <div class="partida-numero">
                Q${p.numero}
            </div>

            <div class="alianca azul ${r === "azul" ? "vencedora" : ""}">

                <strong class="alianca-placar">
                    ${p.azul.placar ?? "-"}
                </strong>

                <div class="alianca-equipes">
                    ${nomes("azul")}
                </div>

            </div>

            <button
                type="button"
                class="btn-excluir-partida"
                data-indice="${indice}"
                aria-label="Excluir partida Q${p.numero}"
                title="Excluir partida"
            >
                Excluir
            </button>
        `;

        listaPartidas.appendChild(card);
    });
}


/* =====================================================================
   6. FORMULÁRIO PARA ADICIONAR PARTIDAS
   ===================================================================== */

const formPartida = document.getElementById("form-partida");
const formErro = document.getElementById("form-erro");

const IDS_SELECTS = ["v1", "v2", "a1", "a2"];

// Preencher seletores
function preencherSelects() {

    IDS_SELECTS.forEach(function (id) {

        const select = document.getElementById(id);

        select.innerHTML =
            `<option value="">Selecione a equipe</option>`

            + equipes.map(function (e) {

                return `
                    <option value="${e.id}">
                        ${e.id} - ${e.nome}
                    </option>
                `;

            }).join("");
    });
}

// Calcular número da próxima partida
function proximoNumero() {

    if (partidas.length === 0) return 1;

    return Math.max(
        ...partidas.map(function (p) {
            return p.numero;
        })
    ) + 1;
}

// Adicionar partida
formPartida.addEventListener("submit", function (event) {

    event.preventDefault();

    formErro.textContent = "";

    // Capturar equipes selecionadas
    const ids = IDS_SELECTS.map(function (id) {
        return Number(document.getElementById(id).value);
    });

    // Capturar placares
    const placarVermelha = document.getElementById("vp").value;
    const placarAzul = document.getElementById("ap").value;

    // Validar equipes
    if (ids.includes(0)) {

        formErro.textContent = "Selecione as quatro equipes.";

        return;
    }

    // Identificar repetição de equipes
    if (new Set(ids).size !== 4) {

        formErro.textContent =
            "Cada equipe só pode aparecer uma vez na partida.";

        return;
    }

    // Validar placares
    if ((placarVermelha === "") !== (placarAzul === "")) {

        formErro.textContent =
            "Preencha os dois placares ou deixe os dois vazios.";

        return;
    }

    // Adicionar nova partida
    partidas.push({

        numero: proximoNumero(),

        vermelha: {
            equipes: [ids[0], ids[1]],
            placar: placarVermelha === ""
                ? null
                : Number(placarVermelha)
        },

        azul: {
            equipes: [ids[2], ids[3]],
            placar: placarAzul === ""
                ? null
                : Number(placarAzul)
        }

    });

    // Salvar e atualizar informações
    salvarPartidas();

    montarPartidas();

    montarRanking();

    // Limpar formulário
    formPartida.reset();
});


/* =====================================================================
   7. MENU MOBILE
   ===================================================================== */

const menu = document.querySelector(".menu");
const overlay = document.getElementById("overlay");
const btnMenu = document.getElementById("btn-menu");

// Abrir menu
function abrirMenu() {

    menu.classList.add("aberto");

    overlay.classList.add("visivel");
}

// Fechar menu
function fecharMenu() {

    menu.classList.remove("aberto");

    overlay.classList.remove("visivel");
}

// Eventos do menu
btnMenu.addEventListener("click", abrirMenu);

overlay.addEventListener("click", fecharMenu);


/* =====================================================================
   8. EXCLUIR PARTIDA
   ===================================================================== */

// Detectar clique no botão de excluir
listaPartidas.addEventListener("click", function (event) {

    const botao = event.target.closest(".btn-excluir-partida");

    // Verificar se clicou no botão
    if (!botao) return;

    // Identificar partida
    const indice = Number(botao.dataset.indice);

    // Confirmar exclusão
    const confirmar = confirm(
        "Tem certeza que deseja excluir esta partida?"
    );

    if (!confirmar) return;

    // Remover partida da lista
    partidas.splice(indice, 1);

    // Salvar alterações
    salvarPartidas();

    // Atualizar partidas
    montarPartidas();

    // Atualizar ranking
    montarRanking();
});


/* =====================================================================
   9. INICIALIZAÇÃO
   ===================================================================== */

preencherSelects();

montarRanking();

montarPartidas();