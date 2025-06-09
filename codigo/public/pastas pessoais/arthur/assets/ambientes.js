// URL base do JSON Server
const apiUrl = 'https://json-server-stockit.onrender.com';

//Vars globais
// Pega o ID do ambiente da URL 
const params = new URLSearchParams(window.location.search);
const ambienteId = parseInt(params.get('id'));
const campoBusca = document.getElementById('campo-busca');
let linhasTabela = [];

async function removerVencidos() {
  try {
    const response = await fetch(`${apiUrl}/ambientes/${ambienteId}`);
    const ambiente = await response.json();

    let algumRemovido = false;

    for (let i = ambiente.itens.length - 1; i >= 0; i--) {
      const item = ambiente.itens[i];
      if (!conferirValidade(formatarData(item.vencimento))) {
        await deletarAlimento(i, false); 
        algumRemovido = true;
      }
    }

    if (algumRemovido) {
      alert("Alimentos vencidos foram removidos com sucesso!");
      carregarAlimentos(); 
    } else {
      alert("Nenhum alimento vencido encontrado.");
    }

  } catch (error) {
    console.error("Erro ao remover vencidos:", error);
    alert("Erro ao remover vencidos.");
  }
}



//Função para pegar ícone conforme tipo do ambiente
async function obterIconeAmbiente(tipoID) {
    try {
        const response = await fetch(`${apiUrl}/tipoAmbiente`);
        const tipos = await response.json();
        const tipo = tipos.find(t => t.id === tipoID);
        return tipo ? tipo.icone : null;

    } catch (error) {
        console.error('Erro ao buscar tipoAmbiente:', error);
        return null;
    }
}

// Função para carregar o nome do ambiente
async function carregarAmbiente() {
    try {
        const response = await fetch(`${apiUrl}/ambientes/${ambienteId}`);
        const ambiente = await response.json();
        document.getElementById('nome-ambiente').textContent = ambiente.nome;
        document.title = `StockIT - ${ambiente.nome}`;

        const tipoAmbiente = ambiente.tipo;
        const iconeAmbiente = await obterIconeAmbiente(tipoAmbiente);
        document.getElementById('icone-ambiente').className = iconeAmbiente;
    } catch (error) {
        console.error('Erro ao carregar o ambiente:ou JSON SERVER Offline', error);
    }
}

// Função para carregar os alimentos do ambiente
async function carregarAlimentos() {
    try {
        const response = await fetch(`${apiUrl}/ambientes/${ambienteId}`);
        const ambiente = await response.json();
        const corpoTabela = document.getElementById('corpo-tabela-alimentos');
        corpoTabela.innerHTML = '';
        linhasTabela = [];

        ambiente.itens.forEach(async (item, index) => {
            const alimentoResponse = await fetch(`${apiUrl}/alimentos/${item.alimentoId}`);
            const alimento = await alimentoResponse.json();
            const validade = conferirValidade(formatarData(item.vencimento)) == true ? "" : "fa-solid fa-triangle-exclamation";
            const linha = document.createElement('tr');
            linha.innerHTML = `
                <td id="td-nome">${alimento.nome} ${alimento.tipo || ""} <i  id = icone-vencimento class ="${validade}"><\i> </td>
                <td>${formatarData(item.cadastro)}</td>
                <td>${formatarData(item.vencimento)}</td>
                <td>${item.quantidade} </td>
                <td>
                    <button class="botao-secundario" onclick="openModal('modal-editar','form-editar', ${index} , ${ambienteId})">Editar</button>
                    <button class="botao-perigo" onclick = "openModal('modal-excluir', '',${index}, ${ambienteId})">Excluir</button>
                </td>
            `;
            if (validade) {
                const nome = linha.querySelector('td');
                nome.classList.add("alimento-vencido");
            }
            corpoTabela.appendChild(linha);
            linhasTabela.push(linha);

        });

    } catch (error) {
        console.error('Erro ao carregar os alimentos: ou JSON SERVER Offline', error);
    }
}


//Função para conferir validade(false se vencido)
function conferirValidade(data) {
    const [dia, mes, ano] = data.split('/').map(Number);
    const dataValidade = new Date(ano, mes - 1, dia);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return dataValidade >= hoje;
}


// Formata Data para o Padrão Brasileiro
function formatarData(dataIso) {
    if (!dataIso) return '–';
    const [ano, mes, dia] = dataIso.split('-');
    return `${dia}/${mes}/${ano}`;
}

//Função que normaliza texto, sem acento, espaços extras e maiuculas
function normalizarTexto(texto) {
    return texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

//Função para Filtrar busca a apartir de 3 letras com texto normalizado
function filtroBusca() {
    const textoBusca = normalizarTexto(campoBusca.value);
    const aviso = document.getElementById('mensagem-nenhum');
    let algumVisivel = false;

    if (textoBusca.length < 2) {
        linhasTabela.forEach(linha => linha.style.display = '');
        if (aviso) aviso.remove();
        return;
    }

    linhasTabela.forEach(linha => {
        const colunas = linha.querySelectorAll('td');
        const nomeCompleto = colunas[0]?.textContent || '';
        const [nome, tipo = ''] = normalizarTexto(nomeCompleto).split(' ');

        const visivel =
            nome.includes(textoBusca) ||
            tipo.includes(textoBusca);

        linha.style.display = visivel ? '' : 'none';
        if (visivel) algumVisivel = true;
    });


    if (!algumVisivel) {
        if (!aviso) {
            const msg = document.createElement('tr');
            msg.id = 'mensagem-nenhum';
            msg.innerHTML = `<td colspan="4" style="text-align:center; color:#999">Nenhum alimento encontrado 😔</td>`;
            document.getElementById('corpo-tabela-alimentos').appendChild(msg);
        }
    } else {
        if (aviso) aviso.remove();
    }
}

//Funções para Ordenação por Nome
let ordemNomeAsc = true;

function ordenarPorNome() {
    const corpo = document.getElementById('corpo-tabela-alimentos');
    const seta = document.getElementById('seta-atributo-nome')

    linhasTabela.sort((a, b) => {
        const nomeA = normalizarTexto(a.cells[0].textContent.split(' ')[0]);
        const nomeB = normalizarTexto(b.cells[0].textContent.split(' ')[0]);
        return nomeA.localeCompare(nomeB) * (ordemNomeAsc ? 1 : -1);
    });

    corpo.innerHTML = '';
    linhasTabela.forEach(linha => corpo.appendChild(linha));

    // Atualiza a seta
    seta.className = ordemNomeAsc ? 'fa-solid fa-caret-up' : 'fa-solid fa-caret-down';

    ordemNomeAsc = !ordemNomeAsc;
}

//Listener para chamada de ordenar nome
document.getElementById('atributo-nome').addEventListener('click', ordenarPorNome);

//Listener para input de busca com atraso para melhor UX
let temporizador;
campoBusca.addEventListener('input', () => {
    clearTimeout(temporizador);
    temporizador = setTimeout(filtroBusca, 300);
});

//Listener para os modais
function openModal(id, form_nome, index) {
    const modalElement = document.getElementById(id);
    const modal = new bootstrap.Modal(modalElement);
    modal.show();

    // Limpar o form quando o modal é fechado
    modalElement.addEventListener('hidden.bs.modal', () => {
        const form = document.getElementById(form_nome);
        if (form) form.reset();
    }, { once: true }); // garante que o listener será adicionado uma única vez

    const ambienteId = parseInt(new URLSearchParams(window.location.search).get('id'));

    // Cadastrar
    const btnCadastrar = document.getElementById('btn-adicionar-alimento');
    btnCadastrar.onclick = () => cadastrarAlimento();

    // Editar
    const btnEditar = document.getElementById('btn-editar-salvar');
    btnEditar.onclick = () => editarAlimento(index);

    // Excluir
    const btnExcluir = document.getElementById('btn-confirmar-exclusao');
    btnExcluir.onclick = () => deletarAlimento(index,true);
}

async function carregarTiposModal() {
    const select = document.getElementById('select-cadastro');

    if (!select) {
        console.error("Erro: elemento <select> não encontrado.");
        return;
    }

    try {
        const response = await fetch(`${apiUrl}/categoriaAlimento`);
        const categorias = await response.json();

        select.innerHTML = '<option selected disabled>Escolha uma categoria</option>';

        categorias.forEach((categoria) => {
            const option = document.createElement('option');
            option.value = categoria.id;
            option.textContent = categoria.categoria;
            select.appendChild(option);
        });

    } catch (error) {
        console.error("Erro ao carregar categorias:", error);
    }
}

function obterDadosCadastro() {
    const nome = document.getElementById('cadastro-nome').value.trim();
    const tipo = document.getElementById('cadastro-tipo').value.trim();
    const vencimento = document.getElementById('cadastro-validade').value;
    const quantidade = parseInt(document.getElementById('cadastro-quantidade').value);
    const categoria = parseInt(document.getElementById('select-cadastro').value);
    const imagemInput = document.getElementById('cadastro-imagem');
    const imagem = imagemInput?.files?.[0]?.name || "default.png";
    const cadastro = new Date().toISOString().split('T')[0];

    if (!nome || !vencimento || !quantidade || isNaN(categoria)) {
        alert("Preencha todos os campos obrigatórios.");
        return null;
    }

    return {
        nome,
        tipo,
        categoria,
        imagem,
        quantidade,
        vencimento,
        cadastro
    };
}

async function verificarOuCriarAlimento({ nome, tipo, categoria, imagem }) {
    try {
        const response = await fetch(`${apiUrl}/alimentos`);
        const alimentos = await response.json();

        // Normaliza para comparação 
        const nomeNormalizado = nome.trim().toLowerCase();
        const tipoNormalizado = tipo.trim().toLowerCase();

        const alimentoExistente = alimentos.find(a => {
            const aNome = (a.nome || "").trim().toLowerCase();
            const aTipo = (a.tipo || "").trim().toLowerCase();
            return aNome === nomeNormalizado && aTipo === tipoNormalizado;
        });

        if (alimentoExistente) {
            console.log("Existe")
            return alimentoExistente.id; // Retorna o ID se já existir
        } else {
            return await criarAlimento(nome, tipo, imagem, categoria);
        }

    } catch (error) {
        console.error("Erro ao verificar alimento existente:", error);
        throw error;
    }
}

async function criarAlimento(nome, tipo, categoria, imagem) {
    try {
        const response = await fetch(`${apiUrl}/alimentos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, tipo, imagem, categoria })
        });

        const novoAlimento = await response.json();
        return novoAlimento.id;
    } catch (error) {
        console.error("Erro ao criar alimento")
    }
}

async function cadastrarAlimento() {
    const { nome, tipo, categoria, imagem, quantidade, vencimento, cadastro } = obterDadosCadastro();

    const id = await verificarOuCriarAlimento({ nome, tipo, categoria, imagem });
    const novoItem = { alimentoId: id, quantidade: quantidade, vencimento: vencimento, cadastro: cadastro }
    try {
        const response = await fetch(`${apiUrl}/ambientes/${ambienteId}`);
        const ambiente = await response.json();

        ambiente.itens.push(novoItem);
        const cadastrar = await fetch(`${apiUrl}/ambientes/${ambienteId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itens: ambiente.itens })
        })

        if (!cadastrar.ok) {
            throw new Error("Erro ao Cadastrar Alimento")
        }

        alert("Alimento Cadastrado com Sucesso");
        carregarAlimentos();

    } catch (error) {
        console.error("Erro ao cadastrar alimento")
    }
}


async function editarAlimento(index) {
    try {
        const response = await fetch(`${apiUrl}/ambientes/${ambienteId}`);
        const ambiente = await response.json();

        const novaQuantidade = parseInt(document.getElementById('editar-quantidade').value);
        let novaValidade = document.getElementById('editar-validade').value;

        //Se campo quantidade não for preenchido
        if (!novaQuantidade) {
            alert("Preencha o campo de quantidade!");
            return;
        }

        //Se não mudar a validade, manter a original
        if (!novaValidade) {
            novaValidade = ambiente.itens[index].vencimento;
        }

        ambiente.itens[index].quantidade = novaQuantidade;
        ambiente.itens[index].vencimento = novaValidade;

        // Envia o PATCH com o ambiente inteiro atualizado
        const atualizar = await fetch(`${apiUrl}/ambientes/${ambienteId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itens: ambiente.itens })
        });

        if (!atualizar.ok) {
            throw new Error("Erro ao atualizar ambiente");
        }

        carregarAlimentos();
        alert("Alimento atualizado com sucesso!");

    } catch (error) {
        console.error("Erro ao editar alimento:", error);
        alert("Erro ao editar alimento");
    }
}

async function deletarAlimento(index, carregar) {
  try {
    const response = await fetch(`${apiUrl}/ambientes/${ambienteId}`);
    const ambiente = await response.json();

    ambiente.itens.splice(index, 1);
    await fetch(`${apiUrl}/ambientes/${ambienteId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itens: ambiente.itens })
    });

    if (carregar) carregarAlimentos();

  } catch (error) {
    console.error("Erro ao deletar alimento:", error);
    alert("Erro ao deletar alimento");
  }
}

async function preencherSelectMover(){
    const response = await fetch(`${apiUrl}/ambientes`)
    const ambientes = await response.json();
    const selectMover = document.getElementById("select-mover-alimentos");
    let i=1;
    ambientes.forEach(ambiente => {
        selectMover.innerHTML += `
        <option value="${i++}">${ambiente.nome}</option>
        `

    });
}

async function preencherCheckMover(){
    const response = await fetch(`${apiUrl}/ambientes/${ambienteId}`)
    const ambienteAtual = await response.json();

    let alimentos = await fetch(`${apiUrl}/alimentos`)
    alimentos = await alimentos.json();

    const checkMover = document.getElementById("check-mover-alimentos");
    let i =0;
    ambienteAtual.itens.forEach((item,index) => {
        let alimento = alimentos.find(alimento => alimento.id ==item.alimentoId);
        checkMover.innerHTML += `
        <div class="form-check">
        <input class="form-check-input" id="mover-check${i}" type="checkbox"  value="${i}" >
        <label class="form-check-label" for=mover-check${i++}">${alimento.nome} ${alimento.tipo}</label>
        </div>
        `
    });
}

//Listener para Página Carregada
document.addEventListener('DOMContentLoaded', async () => {
    await carregarAmbiente();
    await carregarAlimentos();
    await ordenarPorNome();
    carregarTiposModal();
    preencherSelectMover()
    preencherCheckMover()
});
