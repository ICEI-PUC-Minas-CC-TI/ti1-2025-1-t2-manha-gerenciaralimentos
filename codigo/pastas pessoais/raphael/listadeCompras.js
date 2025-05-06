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

const container = document.getElementById('listadeCompras');

dados.listasDeCompra.forEach(lista => {

    const listaSection = document.createElement('section');
    listaSection.classList.add('lista-compra');

    const titulo = document.createElement('h2');
    titulo.textContent = lista.nome;
    listaSection.appendChild(titulo);

    lista.itens.forEach(item => {
        const alimento = dados.alimentos.find(a => a.id === item.alimentoId);

        const itemDiv = document.createElement('div');
        itemDiv.classList.add('item-lista');

        const img = document.createElement('img');
        img.src = alimento.imagem;
        img.alt = alimento.nome;
        img.classList.add('item-imagem');

        const infoDiv = document.createElement('div');
        infoDiv.classList.add('item-info');

        const nome = document.createElement('h3');
        nome.textContent = `Produto: ${alimento.nome} ${alimento.tipo}`;

        const quantidade = document.createElement('p');
        quantidade.textContent = `Quantidade: ${item.quantidade}`;

        infoDiv.appendChild(nome);
        infoDiv.appendChild(quantidade);

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('item-checkbox');

        itemDiv.appendChild(img);
        itemDiv.appendChild(infoDiv);
        itemDiv.appendChild(checkbox);

        listaSection.appendChild(itemDiv);
    });

    container.appendChild(listaSection);
})