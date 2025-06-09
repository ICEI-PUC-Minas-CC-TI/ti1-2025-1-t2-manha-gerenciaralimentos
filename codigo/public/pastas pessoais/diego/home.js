const apiUrl = 'https://json-server-stockit.onrender.com'
const container = document.getElementById("ambientes")

//criação dos blocos de cada ambiente

async function carregarAmbientes() {
    try {
        const resposta = await fetch(`${apiUrl}/ambientes`)
        const dados = await resposta.json();
        const wrapper = document.querySelector(".swiper-wrapper");

        if (!Array.isArray(dados)) {
            throw new Error("Dados recebidos não são um array");
        }

        dados.forEach(ambiente => {
            const bloco = document.createElement("div");

            bloco.textContent = ambiente.nome; 
            bloco.classList.add("swiper-slide");
            wrapper.appendChild(bloco);

        });

        new Swiper (".swiper-container", {
            slidesPerView: 3,
            spaceBetween: 10, 
            navigation: true,
        });

    } catch (erro) { 

        console.error("Erro ao carregar ambientes", erro);
    }
}

carregarAmbientes();

//Funcionamento das Notificações, feito por Raphael Lucas

document.addEventListener("DOMContentLoaded", () => {
    const btnNotificacao = document.getElementById("btnNotificacao");
    const dropdown = document.getElementById("dropdownNotificacao");
    const badge = document.getElementById("badgeNotificacao");

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

            // Verifica se o item está vencido
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
            badge.style.display = alimentosVencendo.length > 0 ? "inline" : "none";

            //Cria a div de cada item
            dropdown.innerHTML = alimentosVencendo.length
                ? alimentosVencendo.map(({ texto, ambienteId, alimentoId }) => `
                    <div class="dropdown-item">
                        ${texto}
                        <button class="btn-excluir" data-ambiente="${ambienteId}" data-alimento="${alimentoId}">🗑️</button>
                        <button class="btn-ver" data-ambiente="${ambienteId}">🔍</button>
                    </div>
                `).join("")
                : `<div class="dropdown-item">Nenhum alimento vencendo nos próximos ${diasLimite} dias.</div>`;

            // Botão de excluir item
            dropdown.querySelectorAll(".btn-excluir").forEach(btn => {
                btn.addEventListener("click", async () => {
                    const confirmar = window.confirm("Tem certeza que deseja excluir este item?");
                    if (!confirmar) return;

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

                        await carregarNotificacoes();
                    } catch (error) {
                        console.error("Erro ao excluir item:", error);
                    }
                });
            });

            // Botão para ver o ambiente
            dropdown.querySelectorAll(".btn-ver").forEach(btn => {
                btn.addEventListener("click", () => {
                    const ambienteId = btn.dataset.ambiente;
                    window.location.href = `../arthur/ambiente.html?id=${ambienteId}`;
                });
            });

        } catch (error) {
            console.error("Erro ao carregar notificações:", error);
        }
    }

    btnNotificacao.addEventListener("click", () => {
        dropdown.classList.toggle("hidden");
    });

    // Inicializa notificações
    carregarNotificacoes();
    setInterval(carregarNotificacoes, 30000);
});