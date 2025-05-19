let ambientes = [];
let alimentos = [];

function mostrarCarregando() {
  const container = document.getElementById('cartoes-container');
  container.innerHTML = `
    <div style="text-align: center; padding: 40px;">
      <div class="spinner-border text-primary" role="status" style="width: 4rem; height: 4rem;">
        <span class="visually-hidden">Carregando...</span>
      </div>
      <p style="margin-top: 15px;">Carregando dados, por favor aguarde...</p>
    </div>
  `;
}

async function carregarDados() {
  try {
    mostrarCarregando(); // Mostra tela de carregamento

    const [resAmbientes, resAlimentos] = await Promise.all([
      fetch('https://json-server-stockit.onrender.com/ambientes'),
      fetch('https://json-server-stockit.onrender.com/alimentos')
    ]);

    if (!resAmbientes.ok || !resAlimentos.ok) {
      throw new Error('Erro ao buscar dados do servidor');
    }

    ambientes = await resAmbientes.json();
    alimentos = await resAlimentos.json();

    mostrarAlimentosVencendo(); // Remove a tela de carregamento automaticamente
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    const container = document.getElementById('cartoes-container');
    container.innerHTML = `
      <h4 style="color:red; text-align: center;">Erro ao conectar ao servidor. Tente novamente mais tarde.</h4>
    `;
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


function mostrarAlimentosVencendo() {
  const container = document.getElementById('cartoes-container');
  container.innerHTML = '';

  let algumVencendo = false;

  ambientes.forEach(ambiente => {
    ambiente.itens.forEach(item => {
      const status = verificarStatusVencimento(item.vencimento);
      if (status === "vencido" || status === "quase") {
        algumVencendo = true;

        const alimento = alimentos.find(a => a.id === item.alimentoId);
        if (!alimento) return;

        const statusTexto = status === "vencido"
          ? `<p class="card-text text-danger font-weight-bold">⚠️ VENCIDO</p>`
          : `<p class="card-text text-warning font-weight-bold">⚠️ Vencendo em breve</p>`;

        const card = document.createElement('div');
        card.className = 'col-sm-6 col-md-4';

        card.innerHTML = `
          <div class="texto-geral">
          <img src="images/${alimento.imagem}" class="card-img-top" style="width: 90px; height: 90px;" alt="${alimento.nome}">
              <div class="info-box">
                  <h5 class="card-title">${alimento.nome}</h5>
              </div>
              <div class="caixa-texto">
                  <p class="card-text">Tipo: ${alimento.tipo}</p>
              </div>
              <div class="caixa-texto">
                  <p class="card-text">Ambiente: ${ambiente.nome}</p>
              </div>
              <div class="caixa-texto">
                  <p class="card-text">Quantidade: ${item.quantidade}</p>
              </div>
              <div class="caixa-texto">
                  <p class="card-text">Vencimento: ${formatarData(item.vencimento)}</p>
                  ${statusTexto}
              </div>
          </div>
        `;

        container.appendChild(card);
      }
    });
  });

  if (!algumVencendo) {
    container.innerHTML = `<h4 style="color:green">Nenhum alimento está vencido ou prestes a vencer!</h4>`;
  }
}

document.addEventListener('DOMContentLoaded', carregarDados);
