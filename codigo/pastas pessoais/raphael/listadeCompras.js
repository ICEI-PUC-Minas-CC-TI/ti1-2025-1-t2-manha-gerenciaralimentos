const dados = {
    alimentos: [
      {
        "id": 1,
        "nome": "banana",
        "tipo": "prata",
        "imagem": "assets/images/Banana_prata.png",
        "categoria": 1
      },
      {
        "id": 2,
        "nome": "batata",
        "tipo": "inglesa",
        "imagem": "assets/images/batata_inglesa.jpg",
        "categoria": 2
      },
      {
        "id": 3,
        "nome": "alface",
        "tipo": "americana",
        "imagem": "assets/images/Alface-Americana.png",
        "categoria": 3
      }
    ],

    "listasDeCompra": [
      {
        "id": 1,
        "nome": "Lista Casa",
        "itens": [
          { "alimentoId": 1, "quantidade": 5 },
          { "alimentoId": 2, "quantidade": 2 }
        ]
      },
      {
        "id": 2,
        "nome": "Lista Restaurante",
        "itens": [
          { "alimentoId": 3, "quantidade": 4 }
        ]
      },
      {
        "id": 3,
        "nome": "Lista Churrasco",
        "itens": [
          { "alimentoId": 1, "quantidade": 1 },
          { "alimentoId": 3, "quantidade": 2 }
        ]
      }
    ],
}

// URL base do JSON Server
const apiUrl = 'https://json-server-stockit.onrender.com';

const params = new URLSearchParams(window.location.search);
const listaId = parseInt(params.get('id'));

// Interliga com o HTML
const container = document.getElementById('listadeCompras');

// Função para carregar os dados
async function carregarDados() {
    try {
        // Carrega a lista específica
        const listaResponse = await fetch(`${apiUrl}/listasDeCompra/${listaId}`);
        const lista = await listaResponse.json();
        
        // Carrega todos os alimentos
        const alimentosResponse = await fetch(`${apiUrl}/alimentos`);
        const alimentos = await alimentosResponse.json();

        // Cria a seção da lista de compras
        const listaSection = document.createElement('section');
        listaSection.classList.add('lista-compra');

        const titulo = document.createElement('h2');
        titulo.textContent = lista.nome;
        listaSection.appendChild(titulo);

        // Processa cada item da lista
        lista.itens.forEach(item => {
            const alimento = alimentos.find(a => a.id === item.alimentoId);

            const itemDiv = document.createElement('div');
            itemDiv.classList.add('item-lista');

            const img = document.createElement('img');
            img.src = alimento.imagem;
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
            
            // Se não houver propriedade 'comprado' no item, consideramos como false
            checkbox.checked = item.comprado || false;

            itemDiv.appendChild(img);
            itemDiv.appendChild(infoDiv);
            itemDiv.appendChild(checkbox);

            listaSection.appendChild(itemDiv);
        });

        container.appendChild(listaSection);
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        container.innerHTML = '<p>Erro ao carregar a lista de compras. Por favor, tente novamente mais tarde.</p>';
    }
}

// Inicia o carregamento dos dados
carregarDados();