const apiUrl = 'https://json-server-stockit.onrender.com/ambientes';

// Elementos do DOM
const nomeInput = document.getElementById('nomeAmbiente');
const tipoInput = document.getElementById('tipoAmbiente');
const imagemInput = document.getElementById('imagem-ambiente');

const btnConfirmar = document.getElementById('btnConfirmar');
const btnCancelar = document.getElementById('btnCancelar');
const btnAtualizar = document.getElementById('btnAtualizar');
const btnExcluir = document.getElementById('btnExcluir');

// Função para limpar os campos
function limparFormulario() {
  nomeInput.value = '';
  tipoInput.selectedIndex = 0;
  imagemInput.value = '';
}

// Buscar ambiente pelo nome
async function buscarAmbientePorNome(nome) {
  const response = await fetch(`${apiUrl}?nome=${encodeURIComponent(nome)}`);
  const data = await response.json();
  return data[0]; // Retorna o primeiro encontrado
}

// CONFIRMAR - Criar novo ambiente
btnConfirmar.addEventListener('click', async () => {
  const nome = nomeInput.value.trim();
  const tipo = tipoInput.value;
  const imagem = imagemInput.files[0]?.name || ''; // Nome do arquivo de imagem

  if (!nome || tipo === 'Tipo de Ambiente') {
    alert('Preencha todos os campos.');
    return;
  }

  const novoAmbiente = { nome, tipo, imagem };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novoAmbiente),
    });

    if (response.ok) {
      alert('Ambiente cadastrado com sucesso!');
      limparFormulario();
    } else {
      alert('Erro ao cadastrar ambiente.');
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
  }
});

// CANCELAR - Limpar o formulário
btnCancelar.addEventListener('click', limparFormulario);

// ATUALIZAR - Editar ambiente pelo nome
btnAtualizar.addEventListener('click', async () => {
  const nome = nomeInput.value.trim();
  const tipo = tipoInput.value;
  const imagem = imagemInput.files[0]?.name || '';

  if (!nome || tipo === 'Tipo de Ambiente') {
    alert('Preencha os campos corretamente para atualizar.');
    return;
  }

  const ambienteExistente = await buscarAmbientePorNome(nome);

  if (!ambienteExistente) {
    alert('Ambiente não encontrado.');
    return;
  }

  const ambienteAtualizado = {
    ...ambienteExistente,
    tipo,
    imagem,
  };

  try {
    const response = await fetch(`${apiUrl}/${ambienteExistente.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ambienteAtualizado),
    });

    if (response.ok) {
      alert('Ambiente atualizado com sucesso!');
      limparFormulario();
    } else {
      alert('Erro ao atualizar ambiente.');
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
  }
});

// EXCLUIR - Apagar ambiente pelo nome
btnExcluir.addEventListener('click', async () => {
  const nome = nomeInput.value.trim();

  if (!nome) {
    alert('Digite o nome do ambiente para excluir.');
    return;
  }

  const ambienteExistente = await buscarAmbientePorNome(nome);

  if (!ambienteExistente) {
    alert('Ambiente não encontrado.');
    return;
  }

  if (!confirm(`Tem certeza que deseja excluir o ambiente "${nome}"?`)) return;

  try {
    const response = await fetch(`${apiUrl}/${ambienteExistente.id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      alert('Ambiente excluído com sucesso!');
      limparFormulario();
    } else {
      alert('Erro ao excluir ambiente.');
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
  }
});
