const apiUrl = 'https://json-server-stockit.onrender.com/ambientes';

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
const btnCancelarBusca = document.getElementById('btnCancelarBusca');
const textoImagem = document.getElementById("texto-imagem");

let modoAtual = '';

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
  imagemInput.addEventListener("change", () => {
    textoImagem.textContent = imagemInput.files.length > 0
      ? "Imagem adicionada"
      : "Adicionar imagem \n +";
  });
});

btnConfirmar.onclick = async () => {
  const nome = nomeInput.value.trim();
  const tipo = tipoInput.value;
  const imagem = imagemInput.files[0]?.name || '';

  if (!nome || tipo === 'Tipo de Ambiente') {
    Swal.fire({
      title: 'Erro',
      text: 'Preencha todos os campos.',
      icon: 'error',
      confirmButtonColor: '#dc3545'
    });
    return;
  }

  let itens = "itens[]";
  const novoAmbiente = { nome, tipo, imagem,itens };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(novoAmbiente),
  });

  if (response.ok) {
    Swal.fire({
      title: 'Sucesso',
      text: 'Ambiente cadastrado com sucesso!',
      icon: 'success',
      confirmButtonColor: '#28a745'
    });
    limparFormulario();
  } else {
    Swal.fire({
      title: 'Erro',
      text: 'Erro ao cadastrar ambiente.',
      icon: 'error',
      confirmButtonColor: '#dc3545'
    });
  }
};

btnCancelar.addEventListener('click', limparFormulario);
btnCancelarBusca.addEventListener('click', () => {
  formAcao.style.display = 'none';
  limparFormulario();
});

function mostrarFormularioBusca(tipo) {
  modoAtual = tipo;
  formAcao.style.display = 'block';
  tituloFormAcao.textContent = tipo === 'atualizar' ? 'Atualizar Ambiente' : 'Excluir Ambiente';
  nomeBuscaInput.value = '';
}

btnAtualizar.addEventListener('click', () => mostrarFormularioBusca('atualizar'));
btnExcluir.addEventListener('click', () => mostrarFormularioBusca('excluir'));

btnBuscarAmbiente.addEventListener('click', async () => {
  const nomeBuscado = nomeBuscaInput.value.trim();
  if (!nomeBuscado) {
    Swal.fire({
      title: 'Aviso',
      text: 'Digite o nome do ambiente.',
      icon: 'info',
      confirmButtonColor: '#dc3545'
    });
    return;
  }

  const ambiente = await buscarAmbientePorNome(nomeBuscado);

  if (!ambiente) {
    Swal.fire({
      title: 'Não encontrado',
      text: 'Ambiente não localizado.',
      icon: 'error',
      confirmButtonColor: '#dc3545'
    });
    
    return;
  }

  if (modoAtual === 'atualizar') {
    nomeInput.value = ambiente.nome;
    tipoInput.value = ambiente.tipo;

    Swal.fire({
      title: 'Pronto!',
      text: 'Edite os dados e clique em "Salvar Alterações".',
      icon: 'success',
      confirmButtonColor: '#28a745'
    });

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
        Swal.fire({
          title: 'Atualizado',
          text: 'Ambiente atualizado com sucesso!',
          icon: 'success',
          confirmButtonColor: '#28a745'
        });
        limparFormulario();
        btnSalvarAlteracoes.style.display = 'none';
        btnConfirmar.style.display = 'block';
      } else {
        Swal.fire({
          title: 'Erro',
          text: 'Falha ao atualizar ambiente.',
          icon: 'error',
          confirmButtonColor: '#dc3545'
        });
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
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#dc3545'
    });

    if (confirmacao.isConfirmed) {
      const response = await fetch(`${apiUrl}/${ambiente.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        Swal.fire({
          title: 'Excluído',
          text: 'Ambiente removido com sucesso.',
          icon: 'success',
          confirmButtonColor: '#28a745'
        });
        limparFormulario();
      } else {
        Swal.fire({
          title: 'Erro',
          text: 'Não foi possível excluir o ambiente.',
          icon: 'error',
          confirmButtonColor: '#dc3545'
        });
      }

      formAcao.style.display = 'none';
    }
  }
});
