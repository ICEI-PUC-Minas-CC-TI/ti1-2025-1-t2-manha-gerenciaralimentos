const apiUrl = 'https://json-server-stockit.onrender.com'
const container = document.getElementById("ambientes")

//criação dos blocos de cada ambiente

async function carregarAmbientes() {
    try { 
        const resposta = await fetch(`${apiUrl}/ambientes`)
        const dados = await resposta.json();

        if (!Array.isArray(dados)) {
            throw new Error ("Dados recebidos não são um array");
        }
        
        dados.forEach(ambiente => { 
            const bloco = document.createElement("div");
            bloco.textContent = ambiente.nome; 
            bloco.classList.add("blocoAmbiente");

            container.appendChild(bloco);
        });
    } catch (erro) { 
        console.error("Erro ao carregar ambientes", erro);
    }
}

carregarAmbientes(); 