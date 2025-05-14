const apiUrl = 'https://json-server-stockit.onrender.com'
let dados;
let listaTemporaria = [];
let contador = 1; 

async function carregarDados() {
    try{
      await fetch(`${apiUrl}/alimentos`).then(response => response.json()).then(data => dados = data);
      //dados = await response.json();
      console.log(dados);
      configurarBotoes(dados);

    }catch(error){
      console.log("Erro ao carregar json");
    }
}

function configurarBotoes() {
  const btnAdicionarAlimentos = document.getElementById("adicinar_alimentos");
  const btnCriarLista = document.getElementById("criar-lista");
  const btnExcluirLista = document.getElementById("excluir-lista");

  btnAdicionarAlimentos.addEventListener("click", abrirPopupAlimentos);
  btnCriarLista.addEventListener("click", criarLista);
  btnExcluirLista.addEventListener("click", () => {
    listaTemporaria = [];
    alert("Lista excluída!");
  });
}

function abrirPopupAlimentos() {
  const popup = document.createElement("div");
  popup.classList.add("popup"); // Adicionando classe para estilizar via CSS

  const titulo = document.createElement("h2");
  titulo.textContent = "Escolha os alimentos";
  popup.appendChild(titulo);

  const inputs = []; // Armazena os inputs para acesso posterior

  dados.forEach(alimento => {
    const container = document.createElement("div");
    container.classList.add("alimento-container"); 

    const nome = document.createElement("span");
    nome.textContent = `${alimento.nome} (${alimento.tipo})`;

    const inputQtd = document.createElement("input");
    inputQtd.type = "number";
    inputQtd.min = 1;
    inputQtd.placeholder = "Quantidade";
    inputQtd.dataset.id = alimento.id; // Guarda o ID do alimento

    inputs.push(inputQtd);

    container.appendChild(nome);
    container.appendChild(inputQtd);
    popup.appendChild(container);
  });

  // Botão único para adicionar alimentos
  const botaoAdicionar = document.createElement("button");
  botaoAdicionar.textContent = "Adicionar Todos";
  botaoAdicionar.classList.add("btn-adicionar");

  botaoAdicionar.addEventListener("click", () => {
  inputs.forEach(input => {
    const qtd = parseInt(input.value);
    const alimentoId = input.dataset.id;

    if (!isNaN(qtd) && qtd > 0) {
      // Verifica se o alimento já está na lista
      const itemExistente = listaTemporaria.find(item => item.alimentoId === alimentoId);
      
      if (itemExistente) {
        // Se já existe, apenas soma a quantidade
        itemExistente.quantidade += qtd;
      } else {
        // Se não existe, adiciona como novo item
        listaTemporaria.push({ alimentoId, quantidade: qtd });
      }
    }
  });

  alert("Alimentos adicionados com sucesso!");

  document.body.removeChild(popup);

});


  popup.appendChild(botaoAdicionar);

  // Botão de fechar
  const fechar = document.createElement("button");
  fechar.textContent = "Fechar";
  fechar.classList.add("btn-fechar");
  fechar.addEventListener("click", () => document.body.removeChild(popup));
  popup.appendChild(fechar);

  document.body.appendChild(popup);
}


function criarLista() {
  const nomeInput = document.getElementById("nome_lista");
  const nomeLista = nomeInput.value.trim();

  if (nomeLista === "") {
    alert("Digite o nome da lista");
    return;
  }

  if (listaTemporaria.length === 0) {
    alert("Adicione pelo menos um alimento à lista");
    return;
  }

  const novaLista = {
    id: contador++,
    nome: nomeLista,
    itens: listaTemporaria
  };

  if (!dados.listasDeCompra) {
  dados.listasDeCompra = []; // Inicializa caso não exista
}

dados.listasDeCompra.push(novaLista);


  dados.listasDeCompra.push(novaLista);
  console.log("Lista criada:", novaLista);

  alert("Lista criada com sucesso!");

  // Limpar
  nomeInput.value = "";
  listaTemporaria = [];
}

document.addEventListener('DOMContentLoaded',async () => {
  await carregarDados();
})
