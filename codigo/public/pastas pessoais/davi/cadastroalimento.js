document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formCadastro");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const nome = form.elements["nome"].value;
        const tipo = form.elements["tipo"].value;
        const categoria = form.elements["categoria"].value;
        const ambiente = form.elements["ambiente"].value;
        const imagemInput = form.elements["imagem"];
        let imagemURL = "";

        // Lê o arquivo de imagem e converte para base64
        if (imagemInput.files.length > 0) {
            const file = imagemInput.files[0];
            imagemURL = await toBase64(file);
        }

        const alimento = {
            nome,
            tipo,
            categoria,
            ambiente,
            imagem: imagemURL
        };

        try {
            const response = await fetch("https://json-server-stockit.onrender.com/alimentos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(alimento)
            });

            if (!response.ok) throw new Error("Erro ao cadastrar alimento");

            alert("Alimento cadastrado com sucesso!");
            form.reset();
        } catch (error) {
            console.error("Erro ao enviar dados:", error);
            alert("Erro ao cadastrar o alimento.");
        }
    });
});

// Função para converter arquivo em base64
function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
}

