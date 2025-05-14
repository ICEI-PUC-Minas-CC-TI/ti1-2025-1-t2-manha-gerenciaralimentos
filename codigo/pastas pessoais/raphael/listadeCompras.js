// URL base do JSON Server
const apiUrl = "https://json-server-stockit.onrender.com";

// Elemento HTML onde as listas serão inseridas
const container = document.getElementById('listadeCompras');

// Função principal
async function carregarDados() {
    try {
        // Busca todas as listas de compra
        const listasResponse = await fetch(`${apiUrl}/listasDeCompra`);
        const listas = await listasResponse.json();

        // Busca todos os alimentos
        const alimentosResponse = await fetch(`${apiUrl}/alimentos`);
        const alimentos = await alimentosResponse.json();

        // Monta a seção no HTML
        listas.forEach(lista => {
            const listaSection = document.createElement('section');
            listaSection.classList.add('lista-compra');

            const titulo = document.createElement('h2');
            titulo.textContent = lista.nome;
            listaSection.appendChild(titulo);

            // Cria os elementos visuais
            lista.itens.forEach(item => {
                const alimento = alimentos.find(a => a.id === item.alimentoId);
                if (!alimento) return;

                const itemDiv = document.createElement('div');
                itemDiv.classList.add('item-lista');

                const img = document.createElement('img');
                img.src = alimento.images;
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

                itemDiv.appendChild(img);
                itemDiv.appendChild(infoDiv);
                itemDiv.appendChild(checkbox);

                listaSection.appendChild(itemDiv);
            });

            // Adiciona a seção da lista ao container principal
            container.appendChild(listaSection);
        });

    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        container.innerHTML = '<p>Erro ao carregar as listas de compras. Tente novamente mais tarde.</p>';
    }
}

// Inicia o carregamento dos dados ao carregar o script
carregarDados();