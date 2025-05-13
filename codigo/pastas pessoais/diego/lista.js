let dados = {};
let listaTemporaria = [];

document.addEventListener("DOMContentLoaded", () => {
  fetch('stock.json') //  URL real do seu JSON futuramente
    .then(response => response.json())
    .then(json => {
      dados = json;
      configurarBotoes();
    })
    .catch(error => {
      console.error("Erro ao carregar os dados JSON:", error);
    });
});

function configurarBotoes() {
  const btnAdicionarAlimentos = document.getElementById("adicinar_alimentos");
  const btnCriarLista = document.getElementById("criar-lista");
  const btnExcluirLista = document.getElementById("excluir-lista");

  btnAdicionarAlimentos.addEventListener("click", abrirPopupAlimentos);
  btnCriarLista.addEventListener("click", criarLista);
  btnExcluirLista.addEventListener("click", () => {
    listaTemporaria = [];
    alert("Lista excluída temporariamente!");
  });
}

function abrirPopupAlimentos() {
  const popup = document.createElement("div");
  popup.style.position = "fixed";
  popup.style.top = "50%";
  popup.style.left = "50%";
  popup.style.transform = "translate(-50%, -50%)";
  popup.style.backgroundColor = "#fff";
  popup.style.padding = "20px";
  popup.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
  popup.style.zIndex = "1000";
  popup.style.maxHeight = "80vh";
  popup.style.overflowY = "auto";

  const titulo = document.createElement("h2");
  titulo.textContent = "Escolha os alimentos";
  popup.appendChild(titulo);

  dados.alimentos.forEach(alimento => {
    const container = document.createElement("div");
    container.style.marginBottom = "10px";

    const nome = document.createElement("span");
    nome.textContent = `${alimento.nome} (${alimento.tipo})`;

    const inputQtd = document.createElement("input");
    inputQtd.type = "number";
    inputQtd.min = 1;
    inputQtd.placeholder = "Quantidade";
    inputQtd.style.marginLeft = "10px";

    const botaoAdd = document.createElement("button");
    botaoAdd.textContent = "Adicionar";
    botaoAdd.style.marginLeft = "10px";

    botaoAdd.addEventListener("click", () => {
      const qtd = parseInt(inputQtd.value);
      if (isNaN(qtd) || qtd <= 0) {
        alert("Quantidade inválida");
        return;
      }
      listaTemporaria.push({ alimentoId: alimento.id, quantidade: qtd });
      alert(`Adicionado: ${alimento.nome} (${qtd})`);
    });

    container.appendChild(nome);
    container.appendChild(inputQtd);
    container.appendChild(botaoAdd);
    popup.appendChild(container);
  });

  const fechar = document.createElement("button");
  fechar.textContent = "Fechar";
  fechar.style.marginTop = "20px";
  fechar.addEventListener("click", () => {
    document.body.removeChild(popup);
  });
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
    id: dados.listasDeCompra.length + 1,
    nome: nomeLista,
    itens: listaTemporaria
  };

  dados.listasDeCompra.push(novaLista);
  console.log("Lista criada:", novaLista);

  alert("Lista criada com sucesso!");

  // Limpar
  nomeInput.value = "";
  listaTemporaria = [];
}
