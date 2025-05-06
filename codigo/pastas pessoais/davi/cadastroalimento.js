document.querySelector(".form").addEventListener("submit", function(event) {
    event.preventDefault(); // Impede o envio tradicional do formulário

    const nome = document.querySelector('input[name="nome"]').value;
    const tipo = document.querySelector('input[name="tipo"]').value;
    const categoria = document.querySelector('select[name="categoria"]').value;
    const ambiente = document.querySelector('select[name="ambiente"]').value;
    const imagemInput = document.querySelector('#imagem-alimento');
    const imagemFile = imagemInput.files[0];

    // Função para abrir nova aba com JSON
    function abrirJSON(dados) {
        const novaJanela = window.open();
        const conteudo = `
            <html>
                <head><title>Dados Cadastrados</title></head>
                <body>
                    <pre>${JSON.stringify(dados, null, 4)}</pre>
                </body>
            </html>
        `;
        novaJanela.document.write(conteudo);
        novaJanela.document.close();
    }

    // Gerar um ID único para o alimento
    const idAlimento = Date.now(); // Usando o timestamp como ID único

    // Obter os alimentos já armazenados no localStorage
    let alimentos = JSON.parse(localStorage.getItem('alimentos')) || [];

    // Se tiver imagem, converter para base64
    if (imagemFile) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const imagemBase64 = event.target.result;

            const novoAlimento = {
                id: idAlimento,
                nome: nome,
                tipo: tipo,
                categoria: categoria,
                ambiente: ambiente,
                imagem: imagemBase64
            };

            alimentos.push(novoAlimento); // Adicionar o novo alimento à lista
            localStorage.setItem('alimentos', JSON.stringify(alimentos)); // Armazenar novamente no localStorage

            abrirJSON(novoAlimento);
        };
        reader.readAsDataURL(imagemFile);
    } else {
        const novoAlimento = {
            id: idAlimento,
            nome: nome,
            tipo: tipo,
            categoria: categoria,
            ambiente: ambiente,
            imagem: null
        };

        alimentos.push(novoAlimento); // Adicionar o novo alimento à lista
        localStorage.setItem('alimentos', JSON.stringify(alimentos)); // Armazenar novamente no localStorage

        abrirJSON(novoAlimento);
    }
});
