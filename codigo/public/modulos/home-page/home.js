const apiUrl = 'https://json-server-stockit.onrender.com'

// Barra de pesquisa 
document.addEventListener("DOMContentLoaded", () => {
    const barraPes = document.getElementById("texto-pesquisa");
    const dropdown = document.getElementById("dropdown-resultados");

    if (!barraPes || !dropdown) return;

    // Função de pesquisa
    const realizarPesquisa = async () => {
        const query = barraPes.value.toLowerCase().trim();
        if (!query) {
            dropdown.style.display = "none";
            return;
        }

        dropdown.style.display = "block";
        dropdown.innerHTML = "<option>Buscando...</option>";

        try {
            const [resAmb, resAli] = await Promise.all([
                fetch(`${apiUrl}/ambientes`),
                fetch(`${apiUrl}/alimentos`)
            ]);

            if (!resAmb.ok || !resAli.ok) throw new Error("Erro ao buscar dados.");

            const [ambientes, alimentos] = await Promise.all([
                resAmb.json(),
                resAli.json()
            ]);

            const resultados = [];

            ambientes.forEach(env => {
                if (env.nome.toLowerCase().includes(query)) {
                    resultados.push({
                        type: "ambiente",
                        id: env.id,
                        nome: env.nome
                    });
                }

                if (Array.isArray(env.itens)) {
                    env.itens.forEach(item => {
                        const ali = alimentos.find(a => a.id == item.alimentoId);
                        if (ali && ali.nome.toLowerCase().includes(query)) {
                            resultados.push({
                                type: "alimento",
                                id: ali.id,
                                nome: ali.nome,
                                ambienteId: env.id,
                                ambienteNome: env.nome
                            });
                        }
                    });
                }
            });

            dropdown.innerHTML = "";

            if (resultados.length === 0) {
                dropdown.innerHTML = "<option>Nenhum resultado encontrado.</option>";
                return;
            }

            resultados.slice(0, 10).forEach(item => {
                const option = document.createElement("option");
                option.textContent = item.type === "ambiente"
                    ? `${item.nome}`
                    : `${item.nome} (${item.ambienteNome})`;
                option.value = item.id;
                option.dataset.type = item.type;
                if (item.ambienteId) option.dataset.ambiente = item.ambienteId;
                dropdown.appendChild(option);
            });
        } catch (error) {
            console.error(error);
            dropdown.innerHTML = "<option>Erro ao buscar dados.</option>";
        }
    };

    // Event listeners para pesquisa
    barraPes.addEventListener("input", realizarPesquisa);
    barraPes.addEventListener("focus", realizarPesquisa);

    dropdown.addEventListener("change", () => {
        const selected = dropdown.selectedOptions[0];
        if (!selected) return;

        const type = selected.dataset.type;
        const id = selected.value;
        const env = selected.dataset.ambiente;

        if (type === "ambiente") {
            window.location.href = `../ambientes/ambiente.html?id=${id}`;
        } else {
            window.location.href = `../ambientes/ambiente.html?id=${env}&focus=${id}`;
        }
    });

    // Fechar dropdown ao clicar fora
    document.addEventListener("click", (e) => {
        if (!e.target.closest('.search-container')) {
            dropdown.style.display = "none";
        }
    });
});

// Gerenciador de Carrossel
class CarouselManager {
    constructor() {
        this.carousel = document.getElementById('ambientes-container');
        this.prevBtn = document.getElementById('carousel-prev');
        this.nextBtn = document.getElementById('carousel-next');
        this.currentIndex = 0;
        this.cardWidth = 300; // largura do card + gap
        this.visibleCards = 0;
        const firstCard = this.carousel.querySelector('.ambiente-card');
        const style = getComputedStyle(this.carousel);
        this.cardW = firstCard.offsetWidth;
        this.gap = parseFloat(style.gap); 
        this.step = this.cardW + this.gap; 

        this.init();
    }

    init() {
        if (!this.carousel || !this.prevBtn || !this.nextBtn) return;

        this.setupEventListeners();

        this.visibleCards = this.getVisibleCards();
        this.updateCarousel();

        // Atualizar no resize
        window.addEventListener('resize', () => {
            this.visibleCards = this.getVisibleCards();
            this.carousel.parentElement.style.width = `${this.visibleCards * this.cardWidth}px`;
            this.updateCarousel();
        });
    }

    getTotalCards() {
        return this.carousel.children.length;
    }

    getVisibleCards() {
        const containerWidth = this.carousel.parentElement.offsetWidth;
        const fitCount = Math.floor(containerWidth / this.cardWidth);
        const total = this.getTotalCards(); 

        return Math.min(fitCount, 3, total); 
    }

    setupEventListeners() {
        this.prevBtn.addEventListener('click', () => this.prev());
        this.nextBtn.addEventListener('click', () => this.next());
    }

    prev() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateCarousel();
        }
    }

    next() {
        const maxIndex = Math.max(0, this.getTotalCards() - this.visibleCards);
        if (this.currentIndex < maxIndex) {
            this.currentIndex++;
            this.updateCarousel();
        }
    }

    updateCarousel() {
  const tx = - this.currentIndex * this.step;
  this.carousel.style.transform = `translateX(${tx}px)`;

  // botão prev só ativo se index > 0
  this.prevBtn.disabled = this.currentIndex === 0;
  // next só até o último grupo de 3 aparecer
  this.nextBtn.disabled =
    this.currentIndex >= this.getTotalCards() - this.visibleCards;
}


    reset() {
        this.currentIndex = 0;
        this.visibleCards = this.getVisibleCards();
        this.updateCarousel();
    }
}

// Gerenciador de Ambientes
class AmbientesManager {
    constructor() {
        this.container = document.getElementById('ambientes-container');
        this.ambientes = [];
        this.carousel = null;
        this.init();
    }

    async init() {
        if (!this.container) return;

        try {
            await this.loadAmbientes();
            this.setupEventListeners();

            // Inicializar carrossel após carregar ambientes
            this.carousel = new CarouselManager();
        } catch (error) {
            console.error('Erro ao inicializar ambientes:', error);
            this.showError();
        }
    }

    async loadAmbientes() {
        const resposta = await fetch(`${apiUrl}/ambientes`);
        if (!resposta.ok) throw new Error('Erro ao buscar os ambientes');

        this.ambientes = await resposta.json();
        this.renderAmbientes();
    }

    renderAmbientes() {
        this.container.innerHTML = '';

        this.ambientes.forEach(ambiente => {
            const card = this.createAmbienteCard(ambiente);
            this.container.appendChild(card);
        });

        // Resetar carrossel após renderizar
        if (this.carousel) {
            this.carousel.reset();
        }
    }

    createAmbienteCard(ambiente) {
        const card = document.createElement('div');
        card.className = 'ambiente-card';
        card.innerHTML = `
            <div class="ambiente-header">
                <h3 class="ambiente-nome">${ambiente.nome}</h3>
                <div class="ambiente-actions">
                    <button class="ambiente-menu-btn" data-id="${ambiente.id}">
                        <i class="fa-solid fa-ellipsis-vertical"></i>
                    </button>
                    <div class="ambiente-dropdown hidden" id="dropdown-${ambiente.id}">
                        <div class="ambiente-dropdown-item editar-ambiente" data-id="${ambiente.id}">
                            Editar
                        </div>
                        <div class="ambiente-dropdown-item excluir-ambiente" data-id="${ambiente.id}">
                            Excluir
                        </div>
                    </div>
                </div>
            </div>
            <div class="ambiente-image-placeholder">
                Imagem
            </div>
        `;

        // Adicionar evento de clique no card (exceto no menu)
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.ambiente-actions')) {
                window.location.href = `../ambientes/ambiente.html?id=${ambiente.id}`;
            }
        });

        return card;
    }

    setupEventListeners() {
        // Event delegation para botões de menu
        this.container.addEventListener('click', (e) => {
            if (e.target.closest('.ambiente-menu-btn')) {
                e.stopPropagation();
                const btn = e.target.closest('.ambiente-menu-btn');
                const id = btn.dataset.id;
                const dropdown = document.getElementById(`dropdown-${id}`);

                // Fechar outros dropdowns
                document.querySelectorAll('.ambiente-dropdown').forEach(d => {
                    if (d !== dropdown) d.classList.add('hidden');
                });

                dropdown.classList.toggle('hidden');
            }

            if (e.target.classList.contains('editar-ambiente')) {
                e.stopPropagation();
                this.editarAmbiente(e.target.dataset.id);
            }

            if (e.target.classList.contains('excluir-ambiente')) {
                e.stopPropagation();
                this.excluirAmbiente(e.target.dataset.id);
            }
        });

        // Fechar dropdowns ao clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.ambiente-actions')) {
                document.querySelectorAll('.ambiente-dropdown').forEach(d => {
                    d.classList.add('hidden');
                });
            }
        });
    }

    async editarAmbiente(id) {
        try {
            const ambiente = await (await fetch(`${apiUrl}/ambientes/${id}`)).json();

            const { value: novoNome } = await Swal.fire({
                title: 'Editar Ambiente',
                input: 'text',
                inputLabel: 'Nome do ambiente',
                inputValue: ambiente.nome,
                inputPlaceholder: 'Digite o novo nome...',
                showCancelButton: true,
                confirmButtonText: 'Salvar',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#059669',
                cancelButtonColor: '#6b7280',
                inputValidator: (value) => {
                    if (!value || !value.trim()) {
                        return 'Por favor, digite um nome válido!';
                    }
                }
            });

            if (novoNome && novoNome.trim()) {
                const response = await fetch(`${apiUrl}/ambientes/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome: novoNome.trim() })
                });

                if (response.ok) {
                    await Swal.fire({
                        title: 'Sucesso!',
                        text: 'Ambiente atualizado com sucesso!',
                        icon: 'success',
                        confirmButtonColor: '#059669'
                    });
                    await this.loadAmbientes();
                } else {
                    throw new Error('Erro na resposta do servidor');
                }
            }
        } catch (error) {
            console.error('Erro ao editar ambiente:', error);
            await Swal.fire({
                title: 'Erro!',
                text: 'Erro ao editar ambiente. Tente novamente.',
                icon: 'error',
                confirmButtonColor: '#dc2626'
            });
        }
    }

    async excluirAmbiente(id) {
        const result = await Swal.fire({
            title: 'Tem certeza?',
            text: 'Esta ação não pode ser desfeita!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`${apiUrl}/ambientes/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    await Swal.fire({
                        title: 'Excluído!',
                        text: 'Ambiente removido com sucesso!',
                        icon: 'success',
                        confirmButtonColor: '#059669'
                    });
                    await this.loadAmbientes();
                } else {
                    throw new Error('Erro na resposta do servidor');
                }
            } catch (error) {
                console.error('Erro ao excluir ambiente:', error);
                await Swal.fire({
                    title: 'Erro!',
                    text: 'Erro ao excluir ambiente. Tente novamente.',
                    icon: 'error',
                    confirmButtonColor: '#dc2626'
                });
            }
        }
    }

    showError() {
        if (this.container) {
            this.container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #dc2626; grid-column: 1 / -1;">
                    <h3>Erro ao carregar ambientes</h3>
                    <p>Verifique sua conexão e tente novamente.</p>
                </div>
            `;
        }
    }
}

// Inicializar gerenciador de ambientes
let ambientesManager;
document.addEventListener('DOMContentLoaded', () => {
    ambientesManager = new AmbientesManager();
});

// Links para outras partes do site 
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".funcionalidade-card").forEach(card => {
        card.addEventListener("click", () => {
            const url = card.getAttribute("data-url");
            if (url) window.location.href = url;
        });
    });
});

// Funcionamento das Notificações
document.addEventListener("DOMContentLoaded", () => {
    const btnNotificacao = document.getElementById("btnNotificacao");
    const dropdown = document.getElementById("dropdownNotificacao");
    const badge = document.getElementById("badgeNotificacao");

    if (!btnNotificacao || !dropdown || !badge) return;

    const diasLimite = 3;

    async function carregarNotificacoes() {
        try {
            const [resAmbientes, resAlimentos] = await Promise.all([
                fetch(`${apiUrl}/ambientes`),
                fetch(`${apiUrl}/alimentos`)
            ]);

            const ambientes = await resAmbientes.json();
            const alimentos = await resAlimentos.json();

            const hoje = new Date();
            const alimentosVencendo = [];

            ambientes.forEach(amb => {
                amb.itens?.forEach(item => {
                    const vencimento = new Date(item.vencimento);
                    const diffDias = (vencimento - hoje) / (1000 * 60 * 60 * 24);
                    if (diffDias <= diasLimite) {
                        const alimento = alimentos.find(a => a.id == item.alimentoId.toString());
                        if (alimento) {
                            alimentosVencendo.push({
                                texto: `${alimento.nome} (${item.quantidade} un) - ${amb.nome}`,
                                ambienteId: amb.id,
                                alimentoId: item.alimentoId
                            });
                        }
                    }
                });
            });

            badge.textContent = alimentosVencendo.length;
            badge.style.display = alimentosVencendo.length > 0 ? "flex" : "none";

            if (alimentosVencendo.length === 0) {
                dropdown.innerHTML = `
                    <div class="notification-item">
                        <strong>Notificações</strong>
                        <p style="margin: 0.5rem 0 0 0; color: #6b7280;">Nenhum alimento vencendo nos próximos ${diasLimite} dias.</p>
                    </div>
                `;
            } else {
                dropdown.innerHTML = `
                    <div style="margin-bottom: 1rem;">
                        <strong style="color: #374151;">Alimentos Vencendo</strong>
                    </div>
                    ${alimentosVencendo.map(({ texto, ambienteId, alimentoId }) => `
                        <div class="notification-item">
                            <div style="margin-bottom: 0.5rem; color: #374151; font-size: 14px;">
                                ${texto}
                            </div>
                            <div class="notification-actions">
                                <button class="btn-excluir" data-ambiente="${ambienteId}" data-alimento="${alimentoId}">
                                    🗑️ Excluir
                                </button>
                                <button class="btn-ver" data-ambiente="${ambienteId}">
                                    👁️ Ver
                                </button>
                            </div>
                        </div>
                    `).join("")}
                `;
            }

            // Event listeners para botões
            dropdown.querySelectorAll(".btn-excluir").forEach(btn => {
                btn.addEventListener("click", async (e) => {
                    e.stopPropagation();

                    const result = await Swal.fire({
                        title: 'Excluir Item',
                        text: 'Tem certeza que deseja excluir este item?',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#dc2626',
                        cancelButtonColor: '#6b7280',
                        confirmButtonText: 'Sim, excluir!',
                        cancelButtonText: 'Cancelar'
                    });

                    if (!result.isConfirmed) return;

                    const ambienteId = btn.dataset.ambiente;
                    const alimentoId = parseInt(btn.dataset.alimento);

                    try {
                        const res = await fetch(`${apiUrl}/ambientes/${ambienteId}`);
                        const ambiente = await res.json();

                        const novosItens = ambiente.itens?.filter(item => item.alimentoId !== alimentoId) || [];

                        await fetch(`${apiUrl}/ambientes/${ambienteId}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ itens: novosItens })
                        });

                        await Swal.fire({
                            title: 'Excluído!',
                            text: 'Item removido com sucesso!',
                            icon: 'success',
                            confirmButtonColor: '#059669'
                        });

                        await carregarNotificacoes();
                        if (ambientesManager) {
                            ambientesManager.loadAmbientes();
                        }
                    } catch (error) {
                        console.error("Erro ao excluir item:", error);
                        await Swal.fire({
                            title: 'Erro!',
                            text: 'Erro ao excluir item. Tente novamente.',
                            icon: 'error',
                            confirmButtonColor: '#dc2626'
                        });
                    }
                });
            });

            dropdown.querySelectorAll(".btn-ver").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    const ambienteId = btn.dataset.ambiente;
                    window.location.href = `../ambientes/ambiente.html?id=${ambienteId}`;
                });
            });

        } catch (error) {
            console.error("Erro ao carregar notificações:", error);
            dropdown.innerHTML = `
                <div class="notification-item">
                    <strong>Erro</strong>
                    <p style="margin: 0.5rem 0 0 0; color: #dc2626;">Erro ao carregar notificações. Tente novamente.</p>
                </div>
            `;
        }
    }

    btnNotificacao.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.classList.toggle("hidden");
    });

    // Fechar dropdown ao clicar fora
    document.addEventListener("click", (e) => {
        if (!e.target.closest('.notification-container')) {
            dropdown.classList.add("hidden");
        }
    });

    carregarNotificacoes();
    setInterval(carregarNotificacoes, 30000);
});

// Botão CRUD Ambiente
document.addEventListener("DOMContentLoaded", () => {
    const btnCrudAmbiente = document.getElementById("btn-crudAmbiente");
    if (btnCrudAmbiente) {
        btnCrudAmbiente.addEventListener("click", () => {
            window.location.href = "../../pastas pessoais/davi/CrudAmbiente.html"; //deve ser alterado futuramente
        });
    }
});