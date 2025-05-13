// URL base do JSON Server
const apiUrl = 'https://json-server-stockit.onrender.com';

// Pega o ID do ambiente da URL 
const params = new URLSearchParams(window.location.search);
const ambienteId = parseInt(params.get('id'));

// Função para carregar o nome do ambiente
async function carregarAmbiente() {
    try {
        const response = await fetch(`${apiUrl}/ambientes/${ambienteId}`);
        const ambiente = await response.json();
        document.getElementById('nome-ambiente').textContent = ambiente.nome;
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
        }
    } catch (error) {
        console.error('Erro ao carregar os alimentos: ou JSON SERVER Offline', error);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    carregarAmbiente();
    carregarAlimentos();
});
