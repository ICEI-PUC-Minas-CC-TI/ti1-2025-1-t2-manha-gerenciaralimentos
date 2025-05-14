// URL base do JSON Server
const apiUrl = 'https://json-server-stockit.onrender.com';

//Vars globais
// Pega o ID do ambiente da URL 
const params = new URLSearchParams(window.location.search);
const ambienteId = parseInt(params.get('id'));
const campoBusca = document.getElementById('campo-busca');
let linhasTabela = [];

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

            const linha = document.createElement('tr');
            linha.innerHTML = `
                <td>${alimento.nome} ${alimento.tipo || ""}</td>
                <td>${item.cadastro}</td>
                <td>${item.vencimento}</td>
                <td>
                    <button class="botao-secundario">Editar</button>
                    <button class="botao-perigo">Excluir</button>
                </td>
            `;
            corpoTabela.appendChild(linha);
            linhasTabela.push(linha);
        }
    } catch (error) {
        console.error('Erro ao carregar os alimentos: ou JSON SERVER Offline', error);
    }
}

function normalizarTexto(texto) {
    return texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}


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

//Listener para input de busca com atraso para melhor UX
let temporizador;
campoBusca.addEventListener('input', () => {
    clearTimeout(temporizador);
    temporizador = setTimeout(filtroBusca, 300);
});   

document.addEventListener('DOMContentLoaded', () => {
    carregarAmbiente();
    carregarAlimentos();
});
