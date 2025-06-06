const apiUrl = 'https://json-server-stockit.onrender.com/ambientes';

// Elementos do DOM
const nomeInput = document.getElementById('nomeAmbiente');
const tipoInput = document.getElementById('tipoAmbiente');
const imagemInput = document.getElementById('imagem-ambiente');
const btnConfirmar = document.getElementById('btnConfirmar');
const btnCancelar = document.getElementById('btnCancelar');
const btnAtualizar = document.getElementById('btnAtualizar');
const btnExcluir = document.getElementById('btnExcluir');
const btnSalvarAlteracoes = document.getElementById('btnSalvarAlteracoes');
const formAcao = document.getElementById('form-acao');
const tituloFormAcao = document.getElementById('form-acao-titulo');
const nomeBuscaInput = document.getElementById('nomeBusca');
const btnBuscarAmbiente = document.getElementById('btnBuscarAmbiente');
const inputImagem = document.getElementById("imagem-ambiente");
const textoImagem = document.getElementById("texto-imagem");


let modoAtual = ''; 

// Funções auxiliares
function limparFormulario() {
  nomeInput.value = '';
  tipoInput.selectedIndex = 0;
  imagemInput.value = '';
  textoImagem.innerHTML = "Adicionar imagem <br> +";
}

async function buscarAmbientePorNome(nome) {
  const response = await fetch(`${apiUrl}?nome=${encodeURIComponent(nome)}`);
  const data = await response.json();
  return data[0]; 
}

document.addEventListener("DOMContentLoaded", function () {

  inputImagem.addEventListener("change", () => {
    if (inputImagem.files.length > 0) {
      textoImagem.textContent = "Imagem adicionada";
    } else {
      textoImagem.innerHTML = "Adicionar imagem <br> +";
    }
  });
});


// CONFIRMAR - Novo Cadastro
const confirmarCadastro = async () => {
  const nome = nomeInput.value.trim();
  const tipo = tipoInput.value;
  const imagem = imagemInput.files[0]?.name || '';


  if (!nome || tipo === 'Tipo de Ambiente') {
    Swal.fire('Erro', 'Preencha todos os campos.', 'warning');
    return;
  }

  const novoAmbiente = { nome, tipo, imagem };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(novoAmbiente),
  });

  if (response.ok) {
    Swal.fire('Sucesso', 'Ambiente cadastrado com sucesso!', 'success');
    limparFormulario();
  } else {
    Swal.fire('Erro', 'Erro ao cadastrar ambiente.', 'error');
  }
};
btnConfirmar.onclick = confirmarCadastro;

// CANCELAR
btnCancelar.addEventListener('click', limparFormulario);

// Mostrar formulário de busca
function mostrarFormularioBusca(tipo) {
  modoAtual = tipo;
  formAcao.style.display = 'block';
  tituloFormAcao.textContent = tipo === 'atualizar' ? 'Atualizar Ambiente' : 'Excluir Ambiente';
  nomeBuscaInput.value = '';
}

// Ações dos botões Atualizar/Excluir
btnAtualizar.addEventListener('click', () => mostrarFormularioBusca('atualizar'));
btnExcluir.addEventListener('click', () => mostrarFormularioBusca('excluir'));

// Buscar ambiente e realizar ação
btnBuscarAmbiente.addEventListener('click', async () => {
  const nomeBuscado = nomeBuscaInput.value.trim();
  if (!nomeBuscado) {
    Swal.fire('Aviso', 'Digite o nome do ambiente.', 'info');
    return;
  }

  const ambiente = await buscarAmbientePorNome(nomeBuscado);

  if (!ambiente) {
    Swal.fire('Não encontrado', 'Ambiente não localizado.', 'error');
    return;
  }

  if (modoAtual === 'atualizar') {
    nomeInput.value = ambiente.nome;
    tipoInput.value = ambiente.tipo;
    Swal.fire('Pronto!', 'Edite os dados e clique em "Salvar Alterações".', 'info');

    btnSalvarAlteracoes.style.display = 'block';
    btnConfirmar.style.display = 'none';
    formAcao.style.display = 'none';

    btnSalvarAlteracoes.onclick = async () => {
      const nome = nomeInput.value.trim();
      const tipo = tipoInput.value;
      const imagem = imagemInput.files[0]?.name || ambiente.imagem;

      const atualizado = { ...ambiente, nome, tipo, imagem };

      const response = await fetch(`${apiUrl}/${ambiente.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(atualizado),
      });

      if (response.ok) {
        Swal.fire('Atualizado', 'Ambiente atualizado com sucesso!', 'success');
        limparFormulario();
        btnSalvarAlteracoes.style.display = 'none';
        btnConfirmar.style.display = 'block';
      } else {
        Swal.fire('Erro', 'Falha ao atualizar ambiente.', 'error');
      }
    };
  }

  if (modoAtual === 'excluir') {
    const confirmacao = await Swal.fire({
      title: 'Confirmar exclusão?',
      text: `Deseja mesmo excluir o ambiente "${ambiente.nome}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar',
    });

    if (confirmacao.isConfirmed) {
      const response = await fetch(`${apiUrl}/${ambiente.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        Swal.fire('Excluído', 'Ambiente removido com sucesso.', 'success');
        limparFormulario();
      } else {
        Swal.fire('Erro', 'Não foi possível excluir o ambiente.', 'error');
      }

      formAcao.style.display = 'none';
    }
  }
});
