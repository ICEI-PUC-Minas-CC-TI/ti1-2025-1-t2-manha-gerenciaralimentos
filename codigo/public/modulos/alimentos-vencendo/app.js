let ambientes = [];
let alimentos = [];

function mostrarCarregando() {
  const container = document.getElementById('cartoes-container');
  container.innerHTML = `
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Carregando dados, aguarde...</p>
    </div>
  `;
}

function mostrarErro(mensagem) {
  const container = document.getElementById('cartoes-container');
  container.innerHTML = `
    <div class="error-container">
      <div class="error-icon">⚠️</div>
      <h3 class="error-title">Erro ao carregar dados</h3>
      <p class="error-subtitle">${mensagem}</p>
    </div>
  `;
}

function mostrarEstadoVazio() {
  const container = document.getElementById('cartoes-container');
  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">✅</div>
      <h3 class="empty-title">Tudo em ordem!</h3>
      <p class="empty-subtitle">Nenhum alimento está vencido ou prestes a vencer.</p>
    </div>
  `;
}

async function carregarDados() {
  try {
    mostrarCarregando();

    const [resAmbientes, resAlimentos] = await Promise.all([
      fetch('https://json-server-stockit.onrender.com/ambientes'),
      fetch('https://json-server-stockit.onrender.com/alimentos')
    ]);

    if (!resAmbientes.ok || !resAlimentos.ok) {
      throw new Error('Erro ao buscar dados do servidor');
    }

    ambientes = await resAmbientes.json();
    alimentos = await resAlimentos.json();

    mostrarAlimentosVencendo();
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    mostrarErro('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
  }
}

async function deletarAlimentoCompletamente(alimentoId) {
  const confirmacao = confirm("Tem certeza que deseja remover esse alimento de todos os ambientes?");
  if (!confirmacao) return;

  try {
    // Mostra loading no botão
    const botao = event.target.closest('.delete-button');
    const textoOriginal = botao.innerHTML;
    botao.innerHTML = '<div style="width: 16px; height: 16px; border: 2px solid #ffffff; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div> Removendo...';
    botao.disabled = true;

    // 1. Deleta o alimento da lista de alimentos
    await fetch(`https://json-server-stockit.onrender.com/alimentos/${alimentoId}`, {
      method: 'DELETE'
    });

    // 2. Atualiza os ambientes, removendo itens que contenham esse alimento
    const atualizacoes = ambientes.map(async ambiente => {
      const novosItens = ambiente.itens.filter(item => item.alimentoId != alimentoId);

      // Apenas atualiza se houve mudança
      if (novosItens.length !== ambiente.itens.length) {
        return fetch(`https://json-server-stockit.onrender.com/ambientes/${ambiente.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itens: novosItens })
        });
      }
    });

    await Promise.all(atualizacoes);

    // Recarrega os dados após deletar
    await carregarDados();
  } catch (error) {
    console.error("Erro ao deletar alimento:", error);
    alert("Erro ao deletar alimento. Tente novamente.");
    
    // Restaura o botão em caso de erro
    const botao = event.target.closest('.delete-button');
    if (botao) {
      botao.innerHTML = textoOriginal;
      botao.disabled = false;
    }
  }
}

function verificarStatusVencimento(dataVencimentoStr) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const partes = dataVencimentoStr.split('-');
  const ano = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10) - 1;
  const dia = parseInt(partes[2], 10);
  const vencimento = new Date(ano, mes, dia);
  vencimento.setHours(0, 0, 0, 0);

  const diffTime = vencimento.getTime() - hoje.getTime();
  const diffDias = diffTime / (1000 * 60 * 60 * 24);

  if (diffDias < 0) return "vencido";
  if (diffDias <= 7) return "quase";
  return "ok";
}

function formatarData(dataStr) {
  const partes = dataStr.split('-');
  const ano = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10) - 1;
  const dia = parseInt(partes[2], 10);
  const data = new Date(ano, mes, dia);

  const diaFormat = String(data.getDate()).padStart(2, "0");
  const mesFormat = String(data.getMonth() + 1).padStart(2, "0");
  const anoFormat = data.getFullYear();
  return `${diaFormat}/${mesFormat}/${anoFormat}`;
}

function criarStatusBadge(status) {
  if (status === "vencido") {
    return `<div class="status-badge status-expired">⚠️ VENCIDO</div>`;
  } else if (status === "quase") {
    return `<div class="status-badge status-expiring">⏰ Vencendo em breve</div>`;
  }
  return '';
}

function mostrarAlimentosVencendo() {
  const container = document.getElementById('cartoes-container');
  const alimentosVencendo = [];

  // Coleta todos os alimentos que estão vencendo
  ambientes.forEach(ambiente => {
    ambiente.itens.forEach(item => {
      const status = verificarStatusVencimento(item.vencimento);
      if (status === "vencido" || status === "quase") {
        const alimento = alimentos.find(a => a.id === item.alimentoId);
        if (alimento) {
          alimentosVencendo.push({
            alimento,
            item,
            ambiente,
            status
          });
        }
      }
    });
  });

  // Se não há alimentos vencendo, mostra estado vazio
  if (alimentosVencendo.length === 0) {
    mostrarEstadoVazio();
    return;
  }

  // Mostra estatísticas
  const statsHtml = `
    <div class="stats-bar">
      <p class="stats-text">
        Encontrados <span class="stats-number">${alimentosVencendo.length}</span> 
        ${alimentosVencendo.length === 1 ? 'alimento' : 'alimentos'} que 
        ${alimentosVencendo.length === 1 ? 'requer' : 'requerem'} atenção
      </p>
    </div>
  `;

  // Cria os cards dos alimentos
  const cardsHtml = alimentosVencendo.map(({ alimento, item, ambiente, status }) => {
    const statusBadge = criarStatusBadge(status);
    const primeiraLetra = alimento.nome.charAt(0).toUpperCase();

    return `
      <div class="food-card">
        <div class="food-image-container">
          <div class="food-image-placeholder">
            ${primeiraLetra}
          </div>
        </div>
        
        <h3 class="food-title">${alimento.nome}</h3>
        
        <div class="food-info">
          <div class="info-item">
            <span class="info-label">Tipo</span>
            <span class="info-value">${alimento.tipo}</span>
          </div>
          
          <div class="info-item">
            <span class="info-label">Ambiente</span>
            <span class="info-value">${ambiente.nome}</span>
          </div>
          
          <div class="info-item">
            <span class="info-label">Quantidade</span>
            <span class="info-value">${item.quantidade}</span>
          </div>
          
          <div class="info-item">
            <span class="info-label">Vencimento</span>
            <span class="info-value">${formatarData(item.vencimento)}</span>
          </div>
        </div>
        
        ${statusBadge}
        
        <button class="delete-button" onclick="deletarAlimentoCompletamente('${alimento.id}')">
          🗑️ Remover
        </button>
      </div>
    `;
  }).join('');

  container.innerHTML = statsHtml + '<div class="cards-grid">' + cardsHtml + '</div>';
}

// Inicialização
document.addEventListener('DOMContentLoaded', carregarDados);

// Adiciona suporte para recarregar dados quando a página fica visível novamente
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    carregarDados();
  }
});