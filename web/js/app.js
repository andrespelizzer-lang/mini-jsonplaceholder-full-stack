// js/app.js — Modulo principale
import * as api from "./api.js";
import * as ui from "./ui.js";

// ============================================================
// Stato drill-down
// ============================================================

let utenteSelezionato = null;
let postSelezionato = null;
let paginaPost = 1;
const limitePost = 5;
let utenteInModifica = null;

// ============================================================
// Riferimenti DOM
// ============================================================

const sezioni = {
  utenti: document.getElementById("sezione-utenti"),
  post: document.getElementById("sezione-post"),
  commenti: document.getElementById("sezione-commenti"),
};

const navBottoni = {
  utenti: document.getElementById("nav-utenti"),
  post: document.getElementById("nav-post"),
  commenti: document.getElementById("nav-commenti"),
};

const liste = {
  utenti: document.getElementById("lista-utenti"),
  post: document.getElementById("lista-post"),
  commenti: document.getElementById("lista-commenti"),
};

const paginazionePost = document.createElement("div");
paginazionePost.id = "paginazione-post";
liste.post.after(paginazionePost);

const breadcrumbs = {
  post: document.getElementById("breadcrumb-post"),
  commenti: document.getElementById("breadcrumb-commenti"),
};

const titoli = {
  post: document.getElementById("titolo-post"),
  commenti: document.getElementById("titolo-commenti"),
};

const ricerca = {
  utenti: document.getElementById("ricerca-utenti"),
};

// ============================================================
// Navigazione
// ============================================================

function mostraSezione(nome) {
  for (const [chiave, sezione] of Object.entries(sezioni)) {
    sezione.classList.toggle("nascosta", chiave !== nome);
    navBottoni[chiave].classList.toggle("attivo", chiave === nome);
  }
}

navBottoni.utenti.addEventListener("click", async () => {
  utenteSelezionato = null;
  mostraSezione("utenti");
  await caricaUtenti();
});

navBottoni.post.addEventListener("click", async () => {
  utenteSelezionato = null;
  breadcrumbs.post.innerHTML = "";
  titoli.post.textContent = "Post";
  document.getElementById("post-userId").value = "";
  mostraSezione("post");
  await caricaPost();
});

navBottoni.commenti.addEventListener("click", async () => {
  postSelezionato = null;
  breadcrumbs.commenti.innerHTML = "";
  titoli.commenti.textContent = "Commenti";
  document.getElementById("commento-postId").value = "";
  mostraSezione("commenti");
  await caricaCommenti();
});

// ============================================================
// Statistiche
// ============================================================

async function aggiornaStatistiche() {
  const [utenti, postRisposta, commenti] = await Promise.all([
    api.ottieniUtenti(),
    api.ottieniPost(),
    api.ottieniCommenti(),
  ]);
  document.getElementById("statistiche").textContent =
    `Utenti: ${utenti.length} | Post: ${postRisposta.dati.length} | Commenti: ${commenti.length}`;
}
aggiornaStatistiche();

// ============================================================
// Caricamento dati
// ============================================================

async function caricaUtenti() {
  try {
    const utenti = await api.ottieniUtenti();
    ui.mostraUtenti(utenti, liste.utenti, {
      onVediPost: vediPostDiUtente,
      onElimina: eliminaUtente,
      onModifica: attivaModalitaModifica,
    });
  } catch (err) {
    ui.mostraErrore(err.message, liste.utenti);
  }
  aggiornaStatistiche();
}

async function caricaPost(userId) {
  try {
    const risposta = await api.ottieniPost(userId, paginaPost, limitePost);
    ui.mostraPost(risposta.dati, liste.post, {
      onVediCommenti: vediCommentiDiPost,
      onElimina: eliminaPost,
    });
    renderPaginazione(risposta.totale);
  } catch (err) {
    ui.mostraErrore(err.message, liste.post);
  }
  aggiornaStatistiche();
}

function renderPaginazione(totale) {
  const totalePagine = Math.ceil(totale / limitePost);

  paginazionePost.innerHTML = `
        <button id="btn-prev-post" ${paginaPost === 1 ? "disabled" : ""}>Precedente</button>
        <span>Pagina ${paginaPost} di ${totalePagine}</span>
        <button id="btn-next-post" ${paginaPost === totalePagine ? "disabled" : ""}>Successiva</button>
    `;

  document.getElementById("btn-prev-post").onclick = async () => {
    if (paginaPost > 1) {
      paginaPost--;
      await caricaPost(utenteSelezionato?.id);
    }
  };

  document.getElementById("btn-next-post").onclick = async () => {
    if (paginaPost < totalePagine) {
      paginaPost++;
      await caricaPost(utenteSelezionato?.id);
    }
  };
}

async function caricaCommenti(postId) {
  try {
    const commenti = await api.ottieniCommenti(postId);
    ui.mostraCommenti(commenti, liste.commenti, {
      onElimina: eliminaCommento,
    });
  } catch (err) {
    ui.mostraErrore(err.message, liste.commenti);
  }
  aggiornaStatistiche();
}

// ============================================================
// Drill-down
// ============================================================

async function vediPostDiUtente(utente) {
  utenteSelezionato = { id: utente.id, nome: utente.nome };
  titoli.post.textContent = `Post di ${utente.nome}`;
  breadcrumbs.post.innerHTML = `<a id="torna-utenti">Utenti</a> &rarr; Post di ${utente.nome}`;
  document.getElementById("post-userId").value = utente.id;

  document
    .getElementById("torna-utenti")
    .addEventListener("click", async () => {
      utenteSelezionato = null;
      mostraSezione("utenti");
      await caricaUtenti();
    });

  mostraSezione("post");
  await caricaPost(utente.id);
}

async function vediCommentiDiPost(post) {
  postSelezionato = { id: post.id, titolo: post.titolo };
  titoli.commenti.textContent = `Commenti al post: ${post.titolo}`;
  breadcrumbs.commenti.innerHTML = `<a id="torna-post">Post</a> &rarr; Commenti`;
  document.getElementById("commento-postId").value = post.id;

  document.getElementById("torna-post").addEventListener("click", async () => {
    postSelezionato = null;
    mostraSezione("post");
    if (utenteSelezionato) {
      await caricaPost(utenteSelezionato.id);
    } else {
      breadcrumbs.post.innerHTML = "";
      titoli.post.textContent = "Post";
      await caricaPost();
    }
  });

  mostraSezione("commenti");
  await caricaCommenti(post.id);
}

// ============================================================
// Eliminazione
// ============================================================

async function eliminaUtente(id) {
  if (!confirm("Sei sicuro di voler eliminare questo utente?")) return;
  try {
    await api.eliminaUtente(id);
    await caricaUtenti();
  } catch (err) {
    ui.mostraErrore(err.message, liste.utenti);
  }
}

async function eliminaPost(id) {
  if (!confirm("Sei sicuro di voler eliminare questo post?")) return;
  try {
    await api.eliminaPost(id);
    await caricaPost(utenteSelezionato?.id);
  } catch (err) {
    ui.mostraErrore(err.message, liste.post);
  }
}

async function eliminaCommento(id) {
  if (!confirm("Sei sicuro di voler eliminare questo commento?")) return;
  try {
    await api.eliminaCommento(id);
    await caricaCommenti(postSelezionato?.id);
  } catch (err) {
    ui.mostraErrore(err.message, liste.commenti);
  }
}

// ============================================================
// Modifica utenti
// ============================================================

function attivaModalitaModifica(utente) {
  utenteInModifica = utente;
  document.getElementById("utente-nome").value = utente.nome;
  document.getElementById("utente-email").value = utente.email;
  document.getElementById("utente-citta").value = utente.citta || "";
  document.getElementById("utente-cf").value = utente.codiceFiscale;
  document.getElementById("utente-sesso").value = utente.sesso;
  document.getElementById("utente-nascita").value = utente.dataNascita || "";
  document.getElementById("utente-telefono").value = utente.telefono || "";
}

function resetFormUtente() {
  document.getElementById("form-utente").reset();
  utenteInModifica = null;
}

document.getElementById("btn-annulla-utente").addEventListener("click", () => {
  resetFormUtente();
});
// ============================================================
// Form — Login
// ============================================================
document.getElementById("form-login").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  try {
    const { token, utente } = await api.login(email, password);
    localStorage.setItem("token", token);
    localStorage.setItem("utente", JSON.stringify(utente));
    aggiornaStatoLogin();
  } catch (errore) {
    alert("Login fallito: " + errore.message);
  }
});

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("utente");
  aggiornaStatoLogin();
}

function aggiornaStatoLogin() {
  const utente = JSON.parse(localStorage.getItem("utente") || "null");
  document.getElementById("stato-login").textContent = utente
    ? `Loggato come ${utente.nome}`
    : "Non sei autenticato";
}

const navLogout = document.getElementById("nav-logout");

if (navLogout) {
  navLogout.addEventListener("click", () => {
    logout(); //
    alert("Logout effettuato");
    // torna alla sezione utenti dopo il logout
    navBottoni.utenti.click();
  });
}
// ============================================================
// Form — Creazione e Modifica utenti
// ============================================================

document.getElementById("form-utente").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("utente-nome").value.trim();
  const email = document.getElementById("utente-email").value.trim();
  const citta = document.getElementById("utente-citta").value.trim();
  const codiceFiscale = document.getElementById("utente-cf").value.trim();
  const sesso = document.getElementById("utente-sesso").value;
  const dataNascita = document.getElementById("utente-nascita").value;
  const telefono = document.getElementById("utente-telefono").value.trim();
  const password = document.getElementById("utente-password").value.trim();

  const regexCF = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/;
  if (!regexCF.test(codiceFiscale.toUpperCase())) {
    ui.mostraErrore("Codice fiscale non valido", liste.utenti);
    return;
  }

  const dati = {
    nome,
    email,
    citta,
    codiceFiscale,
    sesso,
    dataNascita,
    telefono,
    password,
  };

  try {
    if (utenteInModifica) {
      await api.aggiornaUtente(utenteInModifica.id, dati);
      resetFormUtente();
    } else {
      await api.creaUtente(dati);
      e.target.reset();
    }
    await caricaUtenti();
  } catch (err) {
    ui.mostraErrore(err.message, liste.utenti);
  }
});

// ============================================================
// Form — Post
// ============================================================

document.getElementById("form-post").addEventListener("submit", async (e) => {
  e.preventDefault();
  const userId = parseInt(document.getElementById("post-userId").value);
  const titolo = document.getElementById("post-titolo").value.trim();
  const corpo = document.getElementById("post-corpo").value.trim();

  try {
    await api.creaPost({ userId, titolo, corpo });
    e.target.reset();
    if (utenteSelezionato) {
      document.getElementById("post-userId").value = utenteSelezionato.id;
    }
    await caricaPost(utenteSelezionato?.id);
  } catch (err) {
    ui.mostraErrore(err.message, liste.post);
  }
});

// ============================================================
// Form — Commenti
// ============================================================

document
  .getElementById("form-commento")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const postId = parseInt(document.getElementById("commento-postId").value);
    const nome = document.getElementById("commento-nome").value.trim();
    const email = document.getElementById("commento-email").value.trim();
    const corpo = document.getElementById("commento-corpo").value.trim();

    try {
      await api.creaCommento({ postId, nome, email, corpo });
      e.target.reset();
      if (postSelezionato) {
        document.getElementById("commento-postId").value = postSelezionato.id;
      }
      await caricaCommenti(postSelezionato?.id);
    } catch (err) {
      ui.mostraErrore(err.message, liste.commenti);
    }
  });

// ============================================================
// Ricerca utenti
// ============================================================

ricerca.utenti.addEventListener("input", (e) => {
  const testo = e.target.value.toLowerCase();
  const cards = document.querySelectorAll("#lista-utenti .card");
  cards.forEach((card) => {
    const contenuto = card.textContent.toLowerCase();
    card.style.display = contenuto.includes(testo) ? "" : "none";
  });
});

// ============================================================
// Avvio
// ============================================================
aggiornaStatoLogin();
caricaUtenti();
