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