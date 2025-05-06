// Dados dos alimentos e ambientes
const dados = {
  "alimentos": [
    {
      "id": 1,
      "nome": "Banana",
      "tipo": "Prata",
      "imagem": "banana-prata.png",
      "categoria": 1
    },
    {
      "id": 2,
      "nome": "Batata",
      "tipo": "Inglesa",
      "imagem": "batata-inglesa.png",
      "categoria": 2
    },
    {
      "id": 3,
      "nome": "Alface",
      "tipo": "Americana",
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




//Pegue o Id que foi aberto da URL 
const params = new URLSearchParams(window.location.search);
const ambienteId = parseInt(params.get('id'));
  

// Função para carregar o nome do ambiente
function carregarAmbiente() {
    const ambiente = dados.ambientes.find(amb => amb.id === ambienteId);
    document.getElementById('nome-ambiente').textContent = ambiente.nome;
}

// Função para carregar os alimentos do ambiente
function carregarAlimentos() {
    const ambiente = dados.ambientes.find(amb => amb.id === ambienteId);
    const corpoTabela = document.getElementById('corpo-tabela-alimentos');
    corpoTabela.innerHTML = '';

    ambiente.itens.forEach(item => {
        const alimento = dados.alimentos.find(a => a.id === item.alimentoId);
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
    });
}

// Carregar dados quando a página for carregada
document.addEventListener('DOMContentLoaded', () => {
    carregarAmbiente();
    carregarAlimentos();
});