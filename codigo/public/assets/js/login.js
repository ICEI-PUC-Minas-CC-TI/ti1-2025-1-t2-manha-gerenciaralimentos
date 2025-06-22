const apiUrl = "https://json-server-stockit.onrender.com/users";

// LOGIN
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const senha = document.getElementById("loginSenha").value.trim();

  try {
    const res = await fetch(`${apiUrl}?email=${email}&senha=${senha}`);
    const data = await res.json();

    if (data.length > 0) {
      sessionStorage.setItem("user", JSON.stringify(data[0]));
      Swal.fire({
        icon: "success",
        title: "Login realizado!",
        confirmButtonColor: "#28a745"
      }).then(() => {
        window.location.href = "../home-page/home.html";
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Credenciais inválidas",
        confirmButtonColor: "#dc3545"
      });
    }
  } catch {
    Swal.fire({
      icon: "error",
      title: "Erro de conexão",
      text: "Tente novamente mais tarde.",
    });
  }
});

// CADASTRO
document.getElementById("formCadastro").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("cadEmail").value.trim();
  const senha = document.getElementById("cadSenha").value.trim();

  try {
    const check = await fetch(`${apiUrl}?email=${email}`);
    const existe = await check.json();

    if (existe.length > 0) {
      Swal.fire({
        icon: "warning",
        title: "Email já cadastrado",
        confirmButtonColor: "#f59e0b"
      });
      return;
    }

    const novoUsuario = { email, senha };
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novoUsuario)
    });

    if (res.ok) {
      Swal.fire({
        icon: "success",
        title: "Conta criada com sucesso!",
        confirmButtonColor: "#28a745"
      }).then(() => {
        const modal = bootstrap.Modal.getInstance(document.getElementById("modalCadastro"));
        modal.hide();
        document.getElementById("formCadastro").reset();
      });
    }
  } catch {
    Swal.fire({
      icon: "error",
      title: "Erro ao cadastrar",
      confirmButtonColor: "#dc3545"
    });
  }
});