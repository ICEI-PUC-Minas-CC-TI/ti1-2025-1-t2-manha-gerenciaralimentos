const API_BASE = "http://localhost:3000";

let ambientes = [];
let alimentos = [];
let alimentosMap = new Map();

async function carregarDados() {
  try {
    const [resAmbientes, resAlimentos] = await Promise.all([
      fetch(`${API_BASE}/ambientes`),
      fetch(`${API_BASE}/alimentos`)
    ]);
    if (!resAmbientes.ok || !resAlimentos.ok) {
      throw new Error('Erro ao buscar dados do servidor');
    }

    ambientes = await resAmbientes.json();
    alimentos = await resAlimentos.json();
    alimentosMap = new Map(alimentos.map(a => [String(a.id), a]));
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    exibirReceita('Erro ao conectar ao servidor. Tente novamente mais tarde.');
  }
}

function verificarStatusVencimento(dataVencimentoStr) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const [ano, mes, dia] = dataVencimentoStr.split('-').map(Number);
  const vencimento = new Date(ano, mes - 1, dia);
  vencimento.setHours(0, 0, 0, 0);

  const diffDias = (vencimento - hoje) / (1000 * 60 * 60 * 24);

  if (diffDias < 0) return "vencido";
  if (diffDias <= 7) return "quase";
  return "ok";
}

async function buscarReceitaComAlimentosVencendo() {
  try {
    if (!ambientes.length || !alimentos.length) {
      await carregarDados();
      console.log("Ambientes carregados:", ambientes);
      console.log("Alimentos carregados:", alimentos);
    }

    const ingredientes = [];

    ambientes.forEach(ambiente => {
      console.log("Ambiente:", ambiente.nome, "Itens:", ambiente.itens);
      ambiente.itens.forEach(item => {
        const status = verificarStatusVencimento(item.vencimento);
        const alimento = alimentosMap.get(String(item.alimentoId));
        console.log({
          ambiente: ambiente.nome,
          item,
          status,
          alimento
        });
        if (status === "vencido" || status === "quase") {
          if (alimento && !ingredientes.includes(alimento.nome)) {
            ingredientes.push(alimento.nome);
          }
        }
      });
    });
    console.log("Ingredientes finais:", ingredientes);

    if (ingredientes.length === 0) {
      exibirReceita("Nenhum ingrediente próximo do vencimento foi encontrado.");
      return;
    }

    exibirReceita(ingredientes);
  } catch (erro) {
    console.error("Erro geral:", erro);
    exibirReceita("Erro ao gerar receita. Verifique a conexão.");
  }
}

function gerarLinkGoogleReceitas(ingredientes) {
  const query = `receitas com ${ingredientes.join(', ')}`;
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function exibirReceita(info) {
  let container = document.getElementById('receitas-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'receitas-container';
    container.className = 'grade-receitas mt-4';
    document.body.appendChild(container);
  }

  container.innerHTML = '';

  if (typeof info === 'string') {
    container.innerHTML = `
      <div class="alert alert-warning text-center" role="alert">
        ${info}
      </div>
    `;
    return;
  }

  // Lista dos principais sites de receita (nome e função para gerar link de busca)
  const receitaSites = [
    {
      nome: 'Google',
      getLink: ingrediente => `https://www.google.com/search?q=receitas+com+${encodeURIComponent(ingrediente)}`
    },
    {
      nome: 'TudoGostoso',
      getLink: ingrediente => `https://www.tudogostoso.com.br/busca?q=${encodeURIComponent(ingrediente)}`
    }
  ];

  info.forEach(ingredienteNome => {
    // Busca o alimento pelo nome
    const alimento = alimentos.find(a => a.nome === ingredienteNome);

    // Usa a imagem do alimento ou um placeholder
    const imgSrc = alimento && alimento.imagem ? alimento.imagem : 'alimento.png';

    const card = document.createElement('div');
    card.className = 'card m-2 p-4 text-center';
    card.style.width = '370px';
    card.style.minHeight = '230px';
    card.style.backgroundColor = '#f0f8ff';
    card.style.borderRadius = '14px';
    card.style.display = 'inline-block';
    card.style.verticalAlign = 'top';

    card.innerHTML = `
      <img src="${imgSrc}" alt="${ingredienteNome}" style="width:80px;height:80px;object-fit:contain; margin-bottom: 16px;"/>
      <h5 style="font-size:1.2rem;word-break:break-word;">Receitas com ${ingredienteNome}</h5>
      <div class="mt-3 mb-2" style="display: flex; flex-direction: column; gap: 8px;">
        ${receitaSites.map(site =>
          `<a href="${site.getLink(ingredienteNome)}" target="_blank" class="btn btn-primary" style="font-size:1rem;white-space:normal;">
            Ver no ${site.nome}
          </a>`
        ).join('')}
      </div>
    `;

    container.appendChild(card);
  });
}