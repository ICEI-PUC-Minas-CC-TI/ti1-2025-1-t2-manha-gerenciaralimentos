const apiUrl = 'https://json-server-stockit.onrender.com'

//barra de pesquisa 

document.addEventListener("DOMContentLoaded", () => {

    const barraPes = document.getElementById("texto-pesquisa");
    const botaoPes = document.getElementById("pesquisar");
    const dropdown = document.getElementById("dropdown-resultados");

    botaoPes.addEventListener("click", async () => {
        const query = barraPes.value.toLowerCase().trim();
        if (!query) return;
        
        dropdown.style.display = "block";

        dropdown.innerHTML = "<p>Buscando...</p>";

        try {
            const response = await fetch(`${apiUrl}/alimentos`)
            if (!response.ok) throw new Error ("Erro ao buscar alimento.");

            const data = await response.json(); 
            dropdown.innerHTML = ""; 

            const dataFiltrada = data.filter(item => item.nome.toLowerCase().includes(query));

            if (dataFiltrada.length === 0) {
                dropdown.innerHTML = "<p> Nenhum alimento encontrado. </p>";
                return;
            }

            dataFiltrada.forEach(item => {
                const option = document.createElement("option");
                option.textContent = `${item.nome} - ${item.categoria}`;
                option.value = item.id; 
                dropdown.appendChild(option)
            });
        } catch (error) {
            console.error(error);
            dropdown.innerText= "<p> Erro ao buscar dados. </p>";
        }
    });

    dropdown.addEventListener("change", () => {
        const selectedValue = dropdown.value; 
        if (selectedValue) {
            window.location.href = `` //sem direcionamento temporariamente
        }
    })

});

//criação dos blocos de cada ambiente

document.addEventListener('DOMContentLoaded', async () => {
    const carousel = document.getElementById('carousel');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    try {
        const resposta = await fetch('https://json-server-stockit.onrender.com/ambientes');
        if (!resposta.ok) throw new Error('Erro ao buscar os ambientes');

        const ambientes = await resposta.json();

        ambientes.forEach(ambiente => {
            const link = document.createElement('a');
            link.href = `../arthur/ambiente.html?id=${ambiente.id}`;
            link.style.textDecoration = 'none';
            link.style.color = 'inherit';

            const item = document.createElement('div');
            item.classList.add('carousel-item');
            item.textContent = ambiente.nome;

            link.appendChild(item);
            carousel.appendChild(link);

        });

        //botões para o carrosel

        let scrollAmount = 0;
        const itemWidth = document.querySelector('.carousel-item').offsetWidth + 20;

        nextBtn.addEventListener('click', () => {
            if (scrollAmount < (itemWidth * ambientes.length) - (itemWidth * 3)) {
                scrollAmount += itemWidth;
                carousel.style.transform = `translateX(-${scrollAmount}px)`;
            }
        });

        prevBtn.addEventListener('click', () => {
            if (scrollAmount > 0) {
                scrollAmount -= itemWidth;
                carousel.style.transform = `translateX(-${scrollAmount}px)`;
            }
        });

    } catch (erro) {
        console.error(erro);
        listaAmbientes.innerHTML += '<h1>JSON Server ERROR!!!<br><br>Se estiver fazendo a avaliação por pares e o server cair,<br>   utilize o db.json na pasta db e hospede em seu replit. Troque o link no fetch! <br><br>Caso necessário: Contato: (31)999623317</h1>';
    }
});

//link para as outras partes do site 

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".cards").forEach(card => {
        card.addEventListener("click", () => {
            const url = card.getAttribute("data-url");
            if (url) window.location.href = url;
        });
    });
});

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