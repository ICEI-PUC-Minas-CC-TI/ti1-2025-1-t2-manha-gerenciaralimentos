const apiUrl = 'https://json-server-stockit.onrender.com'
let dados;
let listaTemporaria = [];
let alimentosDisponiveis = {};

document.addEventListener("DOMContentLoaded", () => {
  carregarAlimentos();
});


async function carregarDados() {

  try {
    const res = await fetch(`${apiUrl}/alimentos`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    dados = await res.json();
    console.log("Dados carregados:", dados);
  } catch (error) {
    console.error("Erro ao carregar JSON:", error);
    return;
  }
  configurarBotoes(dados);
}


function carregarAlimentos() {
  fetch(`${apiUrl}/alimentos`)
    .then(response => response.json())
    .then(data => {
      alimentosDisponiveis = {};
      data.forEach(alimento => {
        const nomeNormalizado = `${alimento.nome} ${alimento.tipo}`.toLowerCase().trim();
        alimentosDisponiveis[nomeNormalizado] = alimento.id;
      });
      console.log("Lista de alimentos carregada:", alimentosDisponiveis);
    })
    .catch(error => console.error("Erro ao carregar alimentos:", error));
}

function limparModalAtualizar() {
  const nomeListaInput = document.getElementById("nome-lista-atualizar");
  const alimentosContainer = document.getElementById("alimentos-container");

  if (!nomeListaInput || !alimentosContainer) {
    console.error("Erro: elementos do modal não encontrados!");
    return;
  }

  nomeListaInput.value = "";

  alimentosContainer.querySelectorAll("div").forEach(div => div.remove());
}

function configurarBotoes() {
  const btnAdicionarAlimentos = document.getElementById("adicinar_alimentos"); //Adicionar alimentos na lista
  const btnCriarLista = document.getElementById("criar-lista"); //criar a lista
  const btnLimparLista = document.getElementById("limpar-lista"); //limpar a lista
  const btnExcluirLista = document.getElementById("excluir-lista"); //excluir a lista
  const btnAtualizarLista = document.getElementById("atualizar-lista"); //atualizar a lista
  const modalAtualizar = document.getElementById("modal-atualizar"); //abrir pop up para atualizar os alimentos
  const btnFecharModal = document.querySelector(".fechar-modal"); //fecha o modal a partir de tempo 
  const btnAdicionarAlimento = document.getElementById("adicionar-alimento"); //adicionar alimento ao atualizar a lista
  const btnSalvarAlteracoes = document.getElementById("salvar-alteracoes"); //salvar a atualização 
  const nomeListaInput = document.getElementById("nome-lista-atualizar"); //nome para a lista atualizada
  const alimentosContainer = document.getElementById("alimentos-container"); //div com os botões do pop up de atualizar

  //botão para atualizar lista
  btnAtualizarLista.addEventListener("click", () => {
    modalAtualizar.style.display = "block"; // Primeiro exibe o modal
    setTimeout(() => {
      limparModalAtualizar(); // Agora limpa corretamente sem erro
    }, 50);
  });

  btnFecharModal.addEventListener("click", () => {
    modalAtualizar.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === modalAtualizar) {
      modalAtualizar.style.display = "none";
    }
  });
  //adicionar alimentos na atualização
  btnAdicionarAlimento.addEventListener("click", () => {
    const alimentoDiv = document.createElement("div");

    const nomeAlimentoInput = document.createElement("input");
    nomeAlimentoInput.type = "text";
    nomeAlimentoInput.placeholder = "Nome do Alimento";

    const quantidadeInput = document.createElement("input");
    quantidadeInput.type = "number";
    quantidadeInput.placeholder = "Quantidade";

    alimentoDiv.appendChild(nomeAlimentoInput);
    alimentoDiv.appendChild(quantidadeInput);

    alimentosContainer.appendChild(alimentoDiv);
  });

  //botão para salvar a atualização 
  btnSalvarAlteracoes.addEventListener("click", () => {
    const nomeLista = nomeListaInput.value.trim();

    if (!nomeLista) {
      return Swal.fire({
        icon: 'warning',
        title: 'Digite o nome da lista!',
        text: 'Você precisa informar um nome antes de continuar.'
      });
    }

    fetch(`${apiUrl}/listasDeCompra`)
      .then(response => response.json())
      .then(listas => {
        const listaEncontrada = listas.find(lista => lista.nome.toLowerCase() === nomeLista.toLowerCase());

        if (!listaEncontrada) {
          return Swal.fire({
            icon: 'error',
            title: 'Lista não encontrada!',
            text: 'Não existe nenhuma lista com esse nome.'
          });
        }

        const novosItens = [];
        alimentosContainer.querySelectorAll("div").forEach(div => {
          const [inpNome, inpQtd] = div.querySelectorAll("input");
          const nomeAlimento = inpNome.value.trim().toLowerCase();
          const alimentoId = alimentosDisponiveis[nomeAlimento];

          if (!alimentoId) {
            throw { notFound: true, nome: nomeAlimento };
          }
          novosItens.push({ alimentoId, quantidade: Number(inpQtd.value) });
        });

        const listaAtualizada = { ...listaEncontrada, itens: novosItens };

        return fetch(
        `${apiUrl}/listasDeCompra/${listaEncontrada.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...listaEncontrada, itens: novosItens })
        }
      );
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      // fecha o modal só depois do sucesso
      modalAtualizar.style.display = "none";
      return Swal.fire({
        icon: 'success',
        title: 'Pronto!',
        text: 'Lista atualizada com sucesso.'
      });
    })
    .catch(err => {
      // esse catch agora pega erros do fetch, throws internos etc.
      if (err.notFound) {
        return Swal.fire({
          icon: 'warning',
          title: 'Alimento não encontrado',
          text: `"${err.nome}" não existe. Digite o nome completo.`
        });
      }
      console.error(err);
      return Swal.fire({
        icon: 'error',
        title: 'Oops…',
        text: 'Erro ao atualizar lista. Tente novamente mais tarde.'
      });
    });
});


btnAdicionarAlimentos.addEventListener("click", abrirPopupAlimentos); //botão adicionar alimentos
btnCriarLista.addEventListener("click", criarLista); //botão para criar lista
//botão para limpar lista
btnLimparLista.addEventListener("click", () => {
  listaTemporaria = [];
  Swal.fire({
    icon: 'info',
    title: 'Limpo!',
    text: 'Sua lista foi limpada.'
  });
});

//botão excluir uma lista
btnExcluirLista.addEventListener("click", () => {
  Swal.fire({
    title: 'Excluir lista',
    text: 'Digite o nome da lista que deseja excluir:',
    input: 'text',
    inputPlaceholder: 'Nome da lista',
    showCancelButton: true
  }).then(result => {
    if (result.isConfirmed && result.value.trim()) {
      deletarListaPorNome(result.value.trim());
    }
  });
});

};


function abrirPopupAlimentos() {
  const popup = document.createElement("div");
  popup.classList.add("popup");

  const titulo = document.createElement("h2");
  titulo.textContent = "Escolha os alimentos";
  popup.appendChild(titulo);

  const inputs = [];

  dados.forEach(alimento => {
    const container = document.createElement("div");
    container.classList.add("alimento-container");

    const nome = document.createElement("span");
    nome.textContent = `${alimento.nome} (${alimento.tipo})`;

    const inputQtd = document.createElement("input");
    inputQtd.type = "number";
    inputQtd.min = 1;
    inputQtd.placeholder = "Quantidade";
    inputQtd.dataset.id = alimento.id;

    inputs.push(inputQtd);

    container.appendChild(nome);
    container.appendChild(inputQtd);
    popup.appendChild(container);
  });


  const botaoAdicionar = document.createElement("button");
  botaoAdicionar.textContent = "Adicionar Todos";
  botaoAdicionar.classList.add("btn-adicionar");

  botaoAdicionar.addEventListener("click", () => {
    inputs.forEach(input => {
      const qtd = parseInt(input.value);
      const alimentoId = input.dataset.id;

      if (!isNaN(qtd) && qtd > 0) {

        const itemExistente = listaTemporaria.find(item => item.alimentoId === alimentoId);

        if (itemExistente) {

          itemExistente.quantidade += qtd;
        } else {

          listaTemporaria.push({ alimentoId, quantidade: qtd });
        }
      }
    });

    Swal.fire({
      icon: 'success',
      title: 'Adicionado!',
      text: 'Alimentos adicionados com sucesso.'
    });


    document.body.removeChild(popup);

  });


  popup.appendChild(botaoAdicionar);

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

  if (!nomeLista) {
    return Swal.fire({ icon: 'warning', title: 'Digite o nome da lista' });
  }

  if (listaTemporaria.length === 0) {
    return Swal.fire({ icon: 'warning', title: 'Adicione pelo menos um alimento' });
  }

listaTemporaria = listaTemporaria.map(item => ({
  alimentoId: Number(item.alimentoId),
  quantidade: item.quantidade
}));

const novaLista = {

  nome: nomeLista,
  itens: listaTemporaria
};

console.log("Estrutura antes do envio:", JSON.stringify(novaLista));

//Parte do código para adicionar a lista diretamente ao json 

fetch(`${apiUrl}/listasDeCompra`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(novaLista)
})
  .then(response => {
    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }
    return response.json();
  })
  .then(data => {
    Swal.fire({ icon:'success', title:'Lista criada!', text:'Tudo certo.' });
  })
  .catch(error => console.error("Erro ao salvar lista:", error));


nomeInput.value = "";
listaTemporaria = [];

}


document.addEventListener('DOMContentLoaded', async () => {
  await carregarDados();
})

//atualizar lista
function atualizarListaPorNome(nomeLista, novosItens) {
  fetch(`${apiUrl}/listasDeCompra`)
    .then(response => response.json())
    .then(listas => {

      const listaEncontrada = listas.find(lista => lista.nome.toLowerCase() === nomeLista.toLowerCase());

      if (!listaEncontrada) {
        return Swal.fire ({ icon: 'error', title: 'Erro!', text: 'Lista não encontrada'});
      }


      const listaAtualizada = { ...listaEncontrada, itens: novosItens };


      return fetch(`${apiUrl}/listasDeCompra/${listaEncontrada.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(listaAtualizada)
      });
    })
    .then(response => {
      if (response && !response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      Swal.fire({icon: 'success', title: 'Sucesso!', text: 'Lista atualizada com sucesso!'});
    })
    .catch(error => console.error("Erro ao atualizar lista:", error));
}



//deletar lista
function deletarListaPorNome(nomeLista) {
  fetch(`${apiUrl}/listasDeCompra`)
    .then(response => response.json())
    .then(listas => {

      const listaEncontrada = listas.find(lista => lista.nome.toLowerCase() === nomeLista.toLowerCase());

      if (!listaEncontrada) {
        return Swal.fire ({ icon: 'error', title: 'Erro!', text: 'Lista não encontrada'});
      }


      return fetch(`${apiUrl}/listasDeCompra/${listaEncontrada.id}`, {
        method: "DELETE"
      });
    })
    .then(response => {
      if (response && !response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      Swal.fire({icon: 'success', title: 'Sucesso!', text: 'Lista excluída com sucesso!'});
      console.log(`Lista "${nomeLista}" foi excluída`);
    })
    .catch(error => console.error("Erro ao excluir lista:", error));
}