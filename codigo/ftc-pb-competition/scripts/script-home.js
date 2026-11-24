/* =====================================================================
   PAINEL FTC COMPETITION - REGIONAL PARAÍBA
   Organização do arquivo:
   1. Navegação entre seções
   2. Dados (Equipes, Partidas, Notificações e Perfil com localStorage)
   3. Funções auxiliares (cálculos)
   4. Ranking & Detecção de High Score
   5. Partidas (lista e formulário)
   6. Equipes (cadastro e listagem)
   7. Notificações (histórico, leitura e indicador visual)
   8. Perfil do Usuário
   9. Menu mobile e Exclusão de Partidas
   10. Inicialização
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

    const alvo = document.getElementById(nome);
    if (alvo) {
        alvo.classList.add("ativa");
    }

    // Se o usuário entrou na aba de notificações, marca todas como lidas
    if (nome === "notificacoes") {
        marcarNotificacoesComoLidas();
    }

    fecharMenu();
}

gatilhos.forEach(function (gatilho) {
    gatilho.addEventListener("click", function (event) {
        event.preventDefault();
        mostrarSecao(gatilho.dataset.secao);
    });
});


/* =====================================================================
   2. DADOS (EQUIPES, PARTIDAS, NOTIFICAÇÕES E PERFIL)
   ===================================================================== */

const CHAVE_EQUIPES = "ftc-equipes";
const CHAVE_PARTIDAS = "ftc-partidas";
const CHAVE_NOTIFICACOES = "ftc-notificacoes";
const CHAVE_PERFIL = "ftc-perfil-usuario";

// --- Equipes ---
function carregarEquipes() {
    try {
        const salvo = localStorage.getItem(CHAVE_EQUIPES);
        if (salvo) return JSON.parse(salvo);
    } catch (erro) {
        console.error("Erro ao carregar equipes:", erro);
    }

    return [
        { id: 21078, nome: "Criadores", logo: "../imagens/first.png" },
        { id: 24529, nome: "Criadores do amanhã", logo: "../imagens/first.png" },
        { id: 26914, nome: "Robotech", logo: "../imagens/robotech.webp" },
        { id: 16043, nome: "Robossauros", logo: "../imagens/first.png" },
        { id: 17731, nome: "Legonautas", logo: "../imagens/first.png" },
        { id: 19191, nome: "Destemidos", logo: "../imagens/first.png" },
        { id: 17742, nome: "Battech", logo: "../imagens/first.png" },
        { id: 16049, nome: "FT Camb", logo: "../imagens/first.png" },
    ];
}

function salvarEquipes() {
    try {
        localStorage.setItem(CHAVE_EQUIPES, JSON.stringify(equipes));
    } catch (erro) {
        console.error("Erro ao salvar equipes:", erro);
    }
}

let equipes = carregarEquipes();

// --- Partidas ---
function carregarPartidas() {
    try {
        const salvo = localStorage.getItem(CHAVE_PARTIDAS);
        if (salvo) return JSON.parse(salvo);
    } catch (erro) {
        console.error("Erro ao ler partidas salvas:", erro);
    }
    return [];
}

function salvarPartidas() {
    try {
        localStorage.setItem(CHAVE_PARTIDAS, JSON.stringify(partidas));
    } catch (erro) {
        console.error("Erro ao salvar partidas:", erro);
    }
}

const partidas = carregarPartidas();

// --- Notificações ---
function carregarNotificacoes() {
    try {
        const salvo = localStorage.getItem(CHAVE_NOTIFICACOES);
        if (salvo) return JSON.parse(salvo);
    } catch (erro) {
        console.error("Erro ao carregar notificações:", erro);
    }
    return [];
}

function salvarNotificacoes() {
    try {
        localStorage.setItem(CHAVE_NOTIFICACOES, JSON.stringify(notificacoes));
    } catch (erro) {
        console.error("Erro ao salvar notificações:", erro);
    }
}

let notificacoes = carregarNotificacoes();

// --- Perfil ---
function carregarPerfil() {
    try {
        const salvo = localStorage.getItem(CHAVE_PERFIL);
        if (salvo) return JSON.parse(salvo);
    } catch (erro) {
        console.error("Erro ao carregar perfil:", erro);
    }
    return {
        nome: "João Silva",
        email: "joao.silva@ftcpb.com",
        cargo: "Juiz / Administrador FTC"
    };
}

function salvarPerfil(dados) {
    try {
        localStorage.setItem(CHAVE_PERFIL, JSON.stringify(dados));
    } catch (erro) {
        console.error("Erro ao salvar perfil:", erro);
    }
}

let perfilUsuario = carregarPerfil();


/* =====================================================================
   3. FUNÇÕES AUXILIARES
   ===================================================================== */

function buscarEquipe(id) {
    return equipes.find(function (e) {
        return e.id === id;
    });
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
                if (tabela[id]) {
                    if (r === "empate") {
                        tabela[id].t++;
                    } else if (r === cor) {
                        tabela[id].w++;
                    } else {
                        tabela[id].l++;
                    }
                }
            });
        });
    });

    return tabela;
}

function calcularMediaPontos() {
    const acumulador = {};

    equipes.forEach(function (e) {
        acumulador[e.id] = { somaPontos: 0, partidasJogadas: 0 };
    });

    partidas.forEach(function (p) {
        ["vermelha", "azul"].forEach(function (cor) {
            const pontosNormais = p[cor].pontosNormais ?? p[cor].placar;

            if (pontosNormais !== null && pontosNormais !== undefined) {
                p[cor].equipes.forEach(function (id) {
                    if (acumulador[id]) {
                        acumulador[id].somaPontos += pontosNormais;
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
            medias[id] = Number((dados.somaPontos / dados.partidasJogadas).toFixed(1));
        } else {
            medias[id] = 0;
        }
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

function obterHighScoreAtual() {
    let max = 0;
    partidas.forEach(function (p) {
        ["vermelha", "azul"].forEach(function (cor) {
            const placar = p[cor].placar;
            if (placar !== null && placar !== undefined && placar > max) {
                max = placar;
            }
        });
    });
    return max;
}


/* =====================================================================
   4. RANKING
   ===================================================================== */

const corpo = document.getElementById("ranking-corpo");

function montarRanking() {
    if (!corpo) return;

    const wltPorEquipe = calcularWlt();
    const mediaPorEquipe = calcularMediaPontos();

    const ordenadas = equipes
        .map(function (equipe) {
            return {
                ...equipe,
                wlt: wltPorEquipe[equipe.id] || { w: 0, l: 0, t: 0 },
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
                        src="${equipe.logo || '../imagens/first.png'}"
                        alt="Logo ${equipe.nome}"
                        class="equipe-logo"
                        onerror="this.src='../imagens/first.png'"
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

    // --- High Score ---
    let maiorPontuacao = 0;
    let equipesMaiorPontuacao = [];
    let nomeEquipesTexto = "-";

    partidas.forEach(function (p) {
        ["vermelha", "azul"].forEach(function (cor) {
            const placar = p[cor].placar;
            if (placar !== null && placar !== undefined) {
                if (placar > maiorPontuacao) {
                    maiorPontuacao = placar;
                    equipesMaiorPontuacao = p[cor].equipes.map(id => buscarEquipe(id)).filter(Boolean);
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

    if (equipesMaiorPontuacao.length === 0) {
        maiorPontuacao = "-";
        nomeEquipesTexto = "-";
    } else {
        nomeEquipesTexto = equipesMaiorPontuacao.map(e => e.nome).join(" & ");
    }

    const containerLogos = document.getElementById("lider-logos-container");
    if (containerLogos) {
        containerLogos.innerHTML = "";
        if (equipesMaiorPontuacao.length > 0) {
            equipesMaiorPontuacao.forEach(function (eq) {
                const img = document.createElement("img");
                img.src = eq.logo || "../imagens/first.png";
                img.alt = "Logo " + eq.nome;
                img.className = "destaque-logo";
                containerLogos.appendChild(img);
            });
        }
    }

    const liderNome = document.getElementById("lider-nome");
    const liderPontos = document.getElementById("lider-pontos");
    const totalEquipesEl = document.getElementById("total-equipes");

    if (liderNome) liderNome.textContent = nomeEquipesTexto;
    if (liderPontos) liderPontos.textContent = maiorPontuacao;
    if (totalEquipesEl) totalEquipesEl.textContent = equipes.length + " equipes";
}


/* =====================================================================
   5. PARTIDAS (LISTA E FORMULÁRIO)
   ===================================================================== */

const listaPartidas = document.getElementById("lista-partidas");

function montarPartidas() {
    if (!listaPartidas) return;

    listaPartidas.innerHTML = "";

    partidas.forEach(function (p, indice) {
        const r = resultado(p);

        const nomes = function (cor) {
            return p[cor].equipes.map(function (id) {
                const equipe = buscarEquipe(id);
                return `<span>${equipe ? equipe.nome : "Equipe não encontrada"}</span>`;
            }).join("");
        };

        const card = document.createElement("div");
        card.className = "partida";

        card.innerHTML = `
            <div class="alianca v ${r === "vermelha" ? "vencedora-v vermelha" : ""}">
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

            <div class="alianca a ${r === "azul" ? "vencedora-a azul" : ""}">
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

const formPartida = document.getElementById("form-partida");
const formErro = document.getElementById("form-erro");
const IDS_SELECTS = ["v1", "v2", "a1", "a2"];

function preencherSelects() {
    IDS_SELECTS.forEach(function (id) {
        const select = document.getElementById(id);
        if (!select) return;

        select.innerHTML =
            `<option value="">Selecione a equipe</option>` +
            equipes.map(function (e) {
                return `
                    <option value="${e.id}">
                        ${e.id} - ${e.nome}
                    </option>
                `;
            }).join("");
    });
}

function proximoNumero() {
    if (partidas.length === 0) return 1;
    return Math.max(...partidas.map(p => p.numero)) + 1;
}

if (formPartida) {
    formPartida.addEventListener("submit", function (event) {
        event.preventDefault();
        formErro.textContent = "";

        const ids = IDS_SELECTS.map(function (id) {
            const el = document.getElementById(id);
            return el ? Number(el.value) : 0;
        });

        const placarVermelha = document.getElementById("vnp").value.trim();
        const placarAzul = document.getElementById("anp").value.trim();
        const penaltyVermelha = document.getElementById("vpp").value.trim();
        const penaltyAzul = document.getElementById("app").value.trim();

        if (ids.includes(0) || ids.some(isNaN)) {
            formErro.textContent = "Selecione as quatro equipes.";
            return;
        }

        if (new Set(ids).size !== 4) {
            formErro.textContent = "Cada equipe só pode aparecer uma vez na partida.";
            return;
        }

        const temPlacarV = placarVermelha !== "";
        const temPlacarA = placarAzul !== "";

        if (temPlacarV !== temPlacarA) {
            formErro.textContent = "Preencha os dois placares ou deixe os dois vazios.";
            return;
        }

        const recordeAnterior = obterHighScoreAtual();

        const pV = temPlacarV ? Number(placarVermelha) : null;
        const pA = temPlacarA ? Number(placarAzul) : null;
        const penV = penaltyVermelha !== "" ? Number(penaltyVermelha) : 0;
        const penA = penaltyAzul !== "" ? Number(penaltyAzul) : 0;

        const totalV = pV !== null ? pV + penV : null;
        const totalA = pA !== null ? pA + penA : null;
        const numeroPartida = proximoNumero();

        partidas.push({
            numero: numeroPartida,
            vermelha: {
                equipes: [ids[0], ids[1]],
                placar: totalV,
                pontosNormais: pV
            },
            azul: {
                equipes: [ids[2], ids[3]],
                placar: totalA,
                pontosNormais: pA
            }
        });

        salvarPartidas();
        montarPartidas();
        montarRanking();
        montarPerfil(); // Atualiza estatísticas do perfil

        if (totalV !== null && totalA !== null) {
            const eqV1 = buscarEquipe(ids[0])?.nome || ids[0];
            const eqV2 = buscarEquipe(ids[1])?.nome || ids[1];
            const eqA1 = buscarEquipe(ids[2])?.nome || ids[2];
            const eqA2 = buscarEquipe(ids[3])?.nome || ids[3];

            registrarNotificacao(
                "partida",
                `Resultado da Partida Q${numeroPartida}`,
                `Vermelha (${eqV1} & ${eqV2}) ${totalV} x ${totalA} Azul (${eqA1} & ${eqA2}).`
            );

            const novoRecorde = Math.max(totalV, totalA);
            if (novoRecorde > recordeAnterior) {
                const aliancaRecorde = totalV >= totalA
                    ? `${eqV1} & ${eqV2}`
                    : `${eqA1} & ${eqA2}`;

                registrarNotificacao(
                    "highscore",
                    "Novo High Score da Competição!",
                    `A aliança ${aliancaRecorde} alcançou ${novoRecorde} pontos na partida Q${numeroPartida}.`
                );
            }
        }

        formPartida.reset();
    });
}


/* =====================================================================
   6. EQUIPES (CADASTRO E LISTAGEM)
   ===================================================================== */

const listaEquipesContainer = document.getElementById("lista-equipes");
const formEquipe = document.getElementById("form-equipe");
const formErroEquipe = document.getElementById("form-erro-equipe");

function montarEquipes() {
    if (!listaEquipesContainer) return;

    listaEquipesContainer.innerHTML = "";

    equipes.forEach(function (equipe, indice) {
        const card = document.createElement("div");
        card.className = "card-equipe";

        const logoSrc = equipe.logo && equipe.logo.trim() !== "" ? equipe.logo : "../imagens/first.png";

        card.innerHTML = `
            <img src="${logoSrc}" alt="Logo ${equipe.nome}" class="card-equipe-logo" onerror="this.src='../imagens/first.png'">
            <div class="card-equipe-info">
                <span class="card-equipe-id">Equipe #${equipe.id}</span>
                <span class="card-equipe-nome" title="${equipe.nome}">${equipe.nome}</span>
            </div>
            <button type="button" class="btn-excluir-equipe" data-indice="${indice}" title="Excluir equipe" aria-label="Excluir equipe ${equipe.nome}">✕</button>
        `;

        listaEquipesContainer.appendChild(card);
    });
}

if (formEquipe) {
    formEquipe.addEventListener("submit", function (event) {
        event.preventDefault();
        formErroEquipe.textContent = "";

        const idInput = Number(document.getElementById("equipe-id").value);
        const nomeInput = document.getElementById("equipe-nome").value.trim();
        const logoInput = document.getElementById("equipe-logo").value.trim();

        if (equipes.some(e => e.id === idInput)) {
            formErroEquipe.textContent = "Já existe uma equipe cadastrada com este número.";
            return;
        }

        equipes.push({
            id: idInput,
            nome: nomeInput,
            logo: logoInput !== "" ? logoInput : "../imagens/first.png"
        });

        salvarEquipes();
        montarEquipes();
        preencherSelects();
        montarRanking();
        montarPerfil(); // Atualiza estatísticas do perfil

        registrarNotificacao(
            "equipe",
            "Nova equipe cadastrada",
            `A equipe ${nomeInput} (#${idInput}) foi adicionada ao torneio.`
        );

        formEquipe.reset();
    });
}

if (listaEquipesContainer) {
    listaEquipesContainer.addEventListener("click", function (event) {
        const botao = event.target.closest(".btn-excluir-equipe");
        if (!botao) return;

        const indice = Number(botao.dataset.indice);
        const equipeRemovida = equipes[indice];

        const emUso = partidas.some(p =>
            p.vermelha.equipes.includes(equipeRemovida.id) ||
            p.azul.equipes.includes(equipeRemovida.id)
        );

        if (emUso) {
            alert("Esta equipe está participando de uma ou mais partidas e não pode ser excluída.");
            return;
        }

        if (!confirm(`Tem certeza que deseja excluir a equipe ${equipeRemovida.nome}?`)) return;

        equipes.splice(indice, 1);
        salvarEquipes();
        montarEquipes();
        preencherSelects();
        montarRanking();
        montarPerfil();
    });
}


/* =====================================================================
   7. NOTIFICAÇÕES (HISTÓRICO, LEITURA E INDICADOR VISUAL)
   ===================================================================== */

const listaNotificacoesContainer = document.getElementById("lista-notificacoes");
const btnLimparNotificacoes = document.getElementById("btn-limpar-notificacoes");

function registrarNotificacao(tipo, titulo, texto) {
    const secaoNotificacoes = document.getElementById("notificacoes");
    const jaEstaVisualizando = secaoNotificacoes && secaoNotificacoes.classList.contains("ativa");

    const nova = {
        id: Date.now() + Math.random(),
        tipo: tipo,
        titulo: titulo,
        texto: texto,
        lida: jaEstaVisualizando,
        data: new Date().toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        })
    };

    notificacoes.unshift(nova);
    salvarNotificacoes();
    montarNotificacoes();
    atualizarIndicadorNotificacoes();
}

function marcarNotificacoesComoLidas() {
    let houveMudanca = false;

    notificacoes.forEach(function (n) {
        if (!n.lida) {
            n.lida = true;
            houveMudanca = true;
        }
    });

    if (houveMudanca) {
        salvarNotificacoes();
    }

    atualizarIndicadorNotificacoes();
}

function montarNotificacoes() {
    if (!listaNotificacoesContainer) return;

    listaNotificacoesContainer.innerHTML = "";

    if (notificacoes.length === 0) {
        listaNotificacoesContainer.innerHTML = `
            <div class="sem-notificacoes">
                Nenhuma notificação recente no momento.
            </div>
        `;
        atualizarIndicadorNotificacoes();
        return;
    }

    notificacoes.forEach(function (n) {
        const card = document.createElement("div");
        card.className = `card-notificacao ${n.tipo}`;

        let icone = "📢";
        if (n.tipo === "partida") icone = "🏆";
        if (n.tipo === "highscore") icone = "⭐";
        if (n.tipo === "equipe") icone = "➕";

        card.innerHTML = `
            <div class="notificacao-organizacao">
                <div class="notificacao-icone">${icone}</div>
                <div class="notificacao-conteudo">
                    <span class="notificacao-titulo">${n.titulo}</span>
                    <span class="notificacao-texto">${n.texto}</span>
                    <span class="notificacao-tempo">${n.data}</span>
                </div>
            </div>    
        `;

        listaNotificacoesContainer.appendChild(card);
    });

    atualizarIndicadorNotificacoes();
}

function atualizarIndicadorNotificacoes() {
    const pontoIndicador = document.querySelector(".ponto");
    if (!pontoIndicador) return;

    const temNaoLidas = notificacoes.some(function (n) {
        return !n.lida;
    });

    pontoIndicador.style.display = temNaoLidas ? "block" : "none";
}

if (btnLimparNotificacoes) {
    btnLimparNotificacoes.addEventListener("click", function () {
        if (!confirm("Deseja limpar todas as notificações?")) return;
        notificacoes = [];
        salvarNotificacoes();
        montarNotificacoes();
    });
}


/* =====================================================================
   8. PERFIL DO USUÁRIO
   ===================================================================== */

const formPerfil = document.getElementById("form-perfil");
const formErroPerfil = document.getElementById("form-erro-perfil");

function montarPerfil() {
    const inputNome = document.getElementById("input-nome-usuario");
    const inputEmail = document.getElementById("input-email-usuario");
    const selectCargo = document.getElementById("input-cargo-usuario");

    const nomeExibicao = document.getElementById("perfil-nome-exibicao");
    const cargoExibicao = document.getElementById("perfil-cargo-exibicao");
    const avatarInicial = document.getElementById("perfil-avatar-inicial");
    const avatarTopo = document.querySelector(".perfil .avatar");

    const statPartidas = document.getElementById("stat-partidas-registradas");
    const statEquipes = document.getElementById("stat-equipes-cadastradas");

    if (inputNome) inputNome.value = perfilUsuario.nome;
    if (inputEmail) inputEmail.value = perfilUsuario.email;
    if (selectCargo) selectCargo.value = perfilUsuario.cargo; // Atribui o cargo salvo ao select

    if (nomeExibicao) nomeExibicao.textContent = perfilUsuario.nome;
    if (cargoExibicao) cargoExibicao.textContent = perfilUsuario.cargo;

    const primeiraLetra = perfilUsuario.nome ? perfilUsuario.nome.charAt(0).toUpperCase() : "J";
    if (avatarInicial) avatarInicial.textContent = primeiraLetra;
    if (avatarTopo) avatarTopo.textContent = primeiraLetra;

    if (statPartidas) statPartidas.textContent = partidas.length;
    if (statEquipes) statEquipes.textContent = equipes.length;
}

if (formPerfil) {
    formPerfil.addEventListener("submit", function (event) {
        event.preventDefault();
        if (formErroPerfil) formErroPerfil.textContent = "";

        const novoNome = document.getElementById("input-nome-usuario").value.trim();
        const novoEmail = document.getElementById("input-email-usuario").value.trim();
        const novoCargo = document.getElementById("input-cargo-usuario").value;

        if (novoNome === "" || novoEmail === "" || novoCargo === "") {
            if (formErroPerfil) formErroPerfil.textContent = "Preencha todos os campos obrigatórios.";
            return;
        }

        perfilUsuario = {
            nome: novoNome,
            email: novoEmail,
            cargo: novoCargo
        };

        salvarPerfil(perfilUsuario);
        montarPerfil();

        alert("Informações de perfil atualizadas com sucesso!");
    });
}


/* =====================================================================
   9. MENU MOBILE E EXCLUSÃO DE PARTIDAS
   ===================================================================== */

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

if (listaPartidas) {
    listaPartidas.addEventListener("click", function (event) {
        const botao = event.target.closest(".btn-excluir-partida");
        if (!botao) return;

        const indice = Number(botao.dataset.indice);

        if (!confirm("Tem certeza que deseja excluir esta partida?")) return;

        partidas.splice(indice, 1);
        salvarPartidas();
        montarPartidas();
        montarRanking();
        montarPerfil();
    });
}


/* =====================================================================
   10. INICIALIZAÇÃO
   ===================================================================== */

preencherSelects();
montarEquipes();
montarRanking();
montarPartidas();
montarNotificacoes();
montarPerfil();