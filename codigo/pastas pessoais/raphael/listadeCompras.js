const dados = {
    alimentos: [
      {
        "id": 1,
        "nome": "banana",
        "tipo": "prata",
        "imagem": "banana-prata.png",
        "categoria": 1
      },
      {
        "id": 2,
        "nome": "batata",
        "tipo": "inglesa",
        "imagem": "batata-inglesa.png",
        "categoria": 2
      },
      {
        "id": 3,
        "nome": "alface",
        "tipo": "americana",
        "imagem": "alface-americana.png",
        "categoria": 3
      }
    ],

    "ambientes": [
      {
        "id": 1,
        "nome": "Geladeira",
        "tipo": 1,
        "imagem": "geladeira.png",
        "itens": [
          {
            "alimentoId": 1,
            "quantidade": 5,
            "vencimento": "2025-02-12",
            "cadastro": "2025-02-05"
          },
          {
            "alimentoId": 3,
            "quantidade": 2,
            "vencimento": "2025-02-15",
            "cadastro": "2025-02-10"
          }
        ]
      },
      {
        "id": 2,
        "nome": "Despensa",
        "tipo": 2,
        "imagem": "despensa.png",
        "itens": [
          {
            "alimentoId": 2,
            "quantidade": 10,
            "vencimento": "2025-03-10",
            "cadastro": "2025-02-01"
          }
        ]
      },
      {
        "id": 3,
        "nome": "Freezer",
        "tipo": 1,
        "imagem": "freezer.png",
        "itens": [
          {
            "alimentoId": 2,
            "quantidade": 4,
            "vencimento": "2025-06-01",
            "cadastro": "2025-01-15"
          }
        ]
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

    "categoriaAlimento": [
        { "id": 0, "categoria": "Outros" },
        { "id": 1, "categoria": "Fruta" },
        { "id": 2, "categoria": "Legume" },
        { "id": 3, "categoria": "Vegetal" },
        { "id": 4, "categoria": "Carne Bovina" },
        { "id": 5, "categoria": "Carne Suína" },
        { "id": 6, "categoria": "Aves" },
        { "id": 7, "categoria": "Peixes e Frutos do Mar" },
        { "id": 8, "categoria": "Soja e Derivados" },
        { "id": 9, "categoria": "Laticínio" },
        { "id": 10, "categoria": "Grãos e Cereais" }
      ],

    "tipoAmbiente": [
        { "id": 0, "tipo": "Outros" },
        { "id": 1, "tipo": "Refrigeração" },
        { "id": 2, "tipo": "Seco" },
        { "id": 3, "tipo": "Congelado" }
    ]
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
});