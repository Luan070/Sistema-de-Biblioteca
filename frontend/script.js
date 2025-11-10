const API_URL = "http://127.0.0.1:8000/api";


function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { "Authorization": "Bearer " + token }),
  };
  return fetch(API_URL + path, { ...options, headers });
}

// LOGIN
async function fazerLogin() {
  try {
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;
    const res = await fetch(`${API_URL}/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error("Usuário ou senha inválidos");
    const data = await res.json();
    localStorage.setItem("token", data.access);
    localStorage.setItem("user", username);
    window.location.href = "dashboard.html";
  } catch (err) {
    alert(err.message);
  }
}

// CADASTRO DE USUÁRIO
document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      try {
        const res = await fetch(`${API_URL}/register/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        const data = await res.json();
        if (res.ok) {
          alert("Usuário cadastrado com sucesso!");
          window.location.href = "index.html"; // volta para o login
        } else {
          alert("Erro ao cadastrar: " + JSON.stringify(data));
        }
      } catch (err) {
        alert("Erro de conexão com o servidor.");
        console.error(err);
      }
    });
  }
});

// CARREGAR LIVROS
async function carregarLivros() {
  try {
    const res = await apiFetch("/livros/");
    if (!res.ok) {
      if (res.status === 401) {
        alert("Você precisa fazer login.");
        window.location.href = "index.html";
        return;
      }
      throw new Error("Falha ao buscar livros");
    }
    const livros = await res.json();
    const lista = document.getElementById("livros-lista") || document.getElementById("lista-livros");
    if (!lista) return;
    lista.innerHTML = "";
    if (livros.length === 0) {
      lista.innerHTML = "<li>Nenhum livro disponível.</li>";
      return;
    }
    livros.forEach((livro) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${livro.titulo}</strong> — ${livro.autor} (${livro.ano})<br>Status: ${livro.status}<br>`;
      if (livro.status === "disponivel") {
        const btn = document.createElement("button");
        btn.textContent = "Emprestar";
        btn.onclick = () => emprestarLivro(livro.id);
        li.appendChild(btn);
      }
      lista.appendChild(li);
    });
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

// EMPRÉSTIMO
async function emprestarLivro(livroId) {
  try {
    const res = await apiFetch("/emprestimos/", {
      method: "POST",
      body: JSON.stringify({ livro: livroId }),
    });
    if (!res.ok) {
      const errTxt = await res.text();
      throw new Error("Erro ao emprestar: " + errTxt);
    }
    alert("Livro emprestado com sucesso!");
    carregarLivros();
  } catch (err) {
    alert(err.message);
  }
}

async function devolverLivro(idEmprestimo) {
  try {
    const res = await apiFetch(`/emprestimos/${idEmprestimo}/devolver/`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Erro ao devolver livro");
    alert("Livro devolvido com sucesso!");
    carregarLivros();
    carregarEmprestimos();
  } catch (err) {
    alert(err.message);
  }
}

// DEVOLUÇÃO (simples: apaga emprestimo e marca livro disponivel - requires endpoint)
// We'll implement a simple delete by finding user's empr and deleting via ID
async function carregarEmprestimos() {
  try {
    const res = await apiFetch("/emprestimos/");
    if (!res.ok) throw new Error("Falha ao carregar empréstimos");
    const emps = await res.json();
    const lista = document.getElementById("emprestimos-lista");
    if (!lista) return;
    lista.innerHTML = "";

    emps.forEach((emp) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${emp.livro_titulo}</strong> — ${emp.livro_autor} (${emp.livro_ano})`;

      const btn = document.createElement("button");
      btn.textContent = "Devolver";
      btn.onclick = () => devolverLivro(emp.id);

      li.appendChild(btn);
      lista.appendChild(li);
    });
  } catch (err) {
    console.error(err);
  }
}


// LOGOUT
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

// UI toggles (index.html)
document.addEventListener("DOMContentLoaded", () => {
  const showRegister = document.getElementById("show-register");
  const showLogin = document.getElementById("show-login");
  if (showRegister) showRegister.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("login-area").classList.add("hidden");
    document.getElementById("cadastro-area").classList.remove("hidden");
  });
  if (showLogin) showLogin.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("login-area").classList.remove("hidden");
    document.getElementById("cadastro-area").classList.add("hidden");
  });

  if (window.location.pathname.includes("dashboard.html")) {
    const user = localStorage.getItem("user") || "";
    const el = document.getElementById("user-nome");
    if (el) el.textContent = user;
    carregarLivros();
    carregarEmprestimos();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("login-btn");
  if (loginBtn) {
    loginBtn.addEventListener("click", fazerLogin);
  }
});
