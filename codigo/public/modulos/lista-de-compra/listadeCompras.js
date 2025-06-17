const apiUrl = "https://json-server-stockit.onrender.com";
const container = document.getElementById('listadeCompras');

let listaSelecionada = null;
let itemSelecionado = null;

// ================= Funções de Modal =================
function abrirModal(id) {
    document.getElementById(id).classList.add('ativo');
}

function fecharModal(id) {
    document.getElementById(id).classList.remove('ativo');
}

// ================= Carregar Dados =================
async function carregarDados() {
    container.innerHTML = '';
    try {
        const listas = await (await fetch(`${apiUrl}/listasDeCompra`)).json();
        const alimentos = await (await fetch(`${apiUrl}/alimentos`)).json();

        listas.forEach(lista => {
            const listaSection = document.createElement('section');
            listaSection.classList.add('lista-compra');

            const titulo = document.createElement('h2');
            titulo.textContent = lista.nome;
            listaSection.appendChild(titulo);

            lista.itens.forEach(item => {
                const alimento = alimentos.find(a => a.id === item.alimentoId);
                if (!alimento) return;

                const itemDiv = document.createElement('div');
                itemDiv.classList.add('item-lista');

                const img = document.createElement('img');
                img.src = `../../assets/images/alimentos-images/${alimento.imagem}`;
                img.alt = alimento.nome;
                img.classList.add('item-imagem');

                const infoDiv = document.createElement('div');
                infoDiv.classList.add('item-info');

                const nome = document.createElement('h3');
                nome.textContent = `Produto: ${alimento.nome} ${alimento.tipo || ''}`;

                const quantidade = document.createElement('p');
                quantidade.textContent = `Quantidade: ${item.quantidade}`;

                infoDiv.appendChild(nome);
                infoDiv.appendChild(quantidade);

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.classList.add('item-checkbox');
                checkbox.checked = item.comprado || false;

                const botoes = document.createElement('div');
                botoes.classList.add('botoes-item');

                const btnEditar = document.createElement('button');
                btnEditar.textContent = 'Editar';
                btnEditar.className = 'botao botao-salvar';
                btnEditar.onclick = () => {
                    listaSelecionada = lista;
                    itemSelecionado = item;
                    document.getElementById('editar-quantidade').value = item.quantidade;
                    abrirModal('modal-editar');
                };

                const btnExcluir = document.createElement('button');
                btnExcluir.textContent = 'Excluir';
                btnExcluir.className = 'botao botao-excluir';
                btnExcluir.onclick = () => {
                    listaSelecionada = lista;
                    itemSelecionado = item;
                    document.getElementById('excluir-nome').textContent = alimento.nome;
                    abrirModal('modal-excluir');
                };

                botoes.appendChild(btnEditar);
                botoes.appendChild(btnExcluir);

                itemDiv.appendChild(img);
                itemDiv.appendChild(infoDiv);
                itemDiv.appendChild(checkbox);
                itemDiv.appendChild(botoes);

                listaSection.appendChild(itemDiv);
            });

            container.appendChild(listaSection);
        });

    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        container.innerHTML = '<p>Erro ao carregar listas.</p>';
    }
}

// ================= Carregar Listas no Select =================
async function carregarListasNoSelect() {
    const listas = await (await fetch(`${apiUrl}/listasDeCompra`)).json();
    const select = document.getElementById('cadastro-lista');
    select.innerHTML = '<option disabled selected>Selecione uma Lista</option>';
    listas.forEach(lista => {
        const option = document.createElement('option');
        option.value = lista.id;
        option.textContent = lista.nome;
        select.appendChild(option);
    });
}

// ================= Adicionar Item =================
async function adicionarItem() {
    const nome = document.getElementById('cadastro-nome').value.trim();
    const tipo = document.getElementById('cadastro-tipo').value.trim();
    const quantidade = parseInt(document.getElementById('cadastro-quantidade').value);
    const listaIdSelecionada = document.getElementById('cadastro-lista').value;
    const nomeNovaLista = document.getElementById('nova-lista').value.trim();
    const imagem = 'default.png';

    if (!nome || isNaN(quantidade)) {
        alert('Preencha todos os campos obrigatórios!');
        return;
    }

    const alimentos = await (await fetch(`${apiUrl}/alimentos`)).json();
    let alimento = alimentos.find(a => a.nome === nome && a.tipo === tipo);

    if (!alimento) {
        const resp = await fetch(`${apiUrl}/alimentos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, tipo, imagem })
        });
        alimento = await resp.json();
    }

    let listaId = parseInt(listaIdSelecionada);

    if (nomeNovaLista) {
        const novaLista = {
            nome: nomeNovaLista,
            itens: []
        };

        const response = await fetch(`${apiUrl}/listasDeCompra`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novaLista)
        });

        const listaCriada = await response.json();
        listaId = listaCriada.id;
    }

    if (!listaId) {
        alert('Selecione uma lista existente ou informe o nome da nova lista.');
        return;
    }

    const lista = await (await fetch(`${apiUrl}/listasDeCompra/${listaId}`)).json();
    lista.itens.push({ alimentoId: alimento.id, quantidade, comprado: false });

    await fetch(`${apiUrl}/listasDeCompra/${listaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itens: lista.itens })
    });

    carregarDados();
    carregarListasNoSelect();
    fecharModal('modal-cadastro');
    document.getElementById('nova-lista').value = '';
}

// ================= Salvar Edição =================
async function salvarEdicao() {
    const novaQuantidade = parseInt(document.getElementById('editar-quantidade').value);
    if (!novaQuantidade || novaQuantidade <= 0) {
        alert('Informe uma quantidade válida');
        return;
    }

    itemSelecionado.quantidade = novaQuantidade;

    await fetch(`${apiUrl}/listasDeCompra/${listaSelecionada.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itens: listaSelecionada.itens })
    });

    carregarDados();
    fecharModal('modal-editar');
}

// ================= Confirmar Exclusão =================
async function confirmarExclusao() {
    const index = listaSelecionada.itens.indexOf(itemSelecionado);
    if (index > -1) {
        listaSelecionada.itens.splice(index, 1);

        if (listaSelecionada.itens.length === 0) {
            // Deleta a lista se estiver vazia
            await fetch(`${apiUrl}/listasDeCompra/${listaSelecionada.id}`, {
                method: 'DELETE'
            });
        } else {
            await fetch(`${apiUrl}/listasDeCompra/${listaSelecionada.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itens: listaSelecionada.itens })
            });
        }

        carregarDados();
        fecharModal('modal-excluir');
    }
}

// ================= Inicialização =================
window.onload = () => {
    carregarDados();
    carregarListasNoSelect();
};