// URL base do JSON Server
const apiUrl = 'https://json-server-stockit.onrender.com';

//Vars globais
// Pega o ID do ambiente da URL 
const params = new URLSearchParams(window.location.search);
const ambienteId = parseInt(params.get('id'));
const campoBusca = document.getElementById('campo-busca');
let linhasTabela = [];

//Função para pegar ícone conforme tipo do ambiente
async function obterIconeAmbiente(tipoID){
    try{
        const response = await fetch(`${apiUrl}/tipoAmbiente`);
        const tipos = await response.json();
        const tipo = tipos.find(t => t.id === tipoID);
        return tipo ? tipo.icone: null;  

    }catch(error){
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
        document.getElementById('icone-ambiente').className =iconeAmbiente;
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

        for (const item of ambiente.itens) {
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
                    <button class="botao-secundario">Editar</button>
                    <button class="botao-perigo">Excluir</button>
                </td>
            `;
            if(validade){
                const nome = linha.querySelector('td');
                nome.classList.add("alimento-vencido");
            }
            corpoTabela.appendChild(linha);
            linhasTabela.push(linha);
         
        }
        
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
function filtroBusca(){
    const textoBusca = normalizarTexto(campoBusca.value);
    const aviso = document.getElementById('mensagem-nenhum');
    let algumVisivel = false;

    if(textoBusca.length < 2){
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

//Listener para Página Carregada
document.addEventListener('DOMContentLoaded', async() => {
    await carregarAmbiente();
    await carregarAlimentos();
    ordenarPorNome();
});
