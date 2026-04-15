// js/ui.js — Funzioni di rendering DOM
//
// Ogni funzione riceve dati + contenitore + callbacks.
// Nessuna chiamata API qui — solo costruzione HTML.

// ============================================================
// Helper
// ============================================================

export function pulisciContenitore(contenitore) {
  contenitore.innerHTML = "";
}

export function mostraErrore(messaggio, contenitore) {
  const div = document.createElement("div");
  div.className = "errore";
  div.textContent = messaggio;
  contenitore.prepend(div);

  // Rimuovi dopo 4 secondi
  setTimeout(() => div.remove(), 4000);
}

function mostraVuoto(contenitore, testo) {
  contenitore.innerHTML = `<p class="vuoto">${testo}</p>`;
}

// ============================================================
// Utenti
// ============================================================

/**
 * @param {Array} utenti
 * @param {HTMLElement} contenitore
 * @param {{ onVediPost: Function, onElimina: Function, onModifica: Function, }} callbacks
 */
export function mostraUtenti(utenti, contenitore, callbacks) {
  pulisciContenitore(contenitore);

  if (utenti.length === 0) {
    mostraVuoto(contenitore, "Nessun utente trovato");
    return;
  }

  utenti.forEach((utente) => {
    const data = utente.creatoIl
      ? new Date(utente.creatoIl).toLocaleString("it-IT", {
          timeZone: "Europe/Rome",
        })
      : "-";

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${utente.nome}</h3>
      <p>${utente.email}</p>
      <p>${utente.citta || "Nessuna citta"}</p>

      <p><strong>CF:</strong> ${utente.codiceFiscale}</p>
      <p><strong>Sesso:</strong> ${utente.sesso}</p>
      <p><strong>Nascita:</strong> ${
        utente.dataNascita
          ? new Date(utente.dataNascita).toLocaleDateString("it-IT")
          : "-"
      }</p>
      <p><strong>Telefono:</strong> ${utente.telefono || "-"}</p>

      <p><strong>Creato il:</strong> ${data}</p>

      <div class="azioni">
        <button class="btn-primario" data-azione="vedi-post">Vedi Post</button>
        <button class="btn-pericolo" data-azione="elimina">Elimina</button>
        <button class="btn-secondario" data-azione="modifica">Modifica</button>
      </div>
    `;

    card
      .querySelector('[data-azione="vedi-post"]')
      .addEventListener("click", () => callbacks.onVediPost(utente));

    card
      .querySelector('[data-azione="elimina"]')
      .addEventListener("click", () => callbacks.onElimina(utente.id));

    card
      .querySelector('[data-azione="modifica"]')
      .addEventListener("click", () => callbacks.onModifica(utente));

    contenitore.appendChild(card);
  });
}

// ============================================================
// Post
// ============================================================

/**
 * @param {Array} post
 * @param {HTMLElement} contenitore
 * @param {{ onVediCommenti: Function, onElimina: Function }} callbacks
 */
export function mostraPost(post, contenitore, callbacks) {
  pulisciContenitore(contenitore);

  if (post.length === 0) {
    mostraVuoto(contenitore, "Nessun post trovato");
    return;
  }

  post.forEach((p) => {
    const data = p.creatoIl
      ? new Date(p.creatoIl).toLocaleString("it-IT", {
          timeZone: "Europe/Rome",
        })
      : "-";

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
            <h3>${p.titolo}</h3>
            <p>${p.corpo}</p>
             <p><strong>Creato il:</strong> ${data}</p>
            <div class="azioni">
                <button class="btn-primario" data-azione="vedi-commenti">Vedi Commenti</button>
                <button class="btn-pericolo" data-azione="elimina">Elimina</button>
            </div>
        `;

    card
      .querySelector('[data-azione="vedi-commenti"]')
      .addEventListener("click", () => {
        callbacks.onVediCommenti(p);
      });

    card
      .querySelector('[data-azione="elimina"]')
      .addEventListener("click", () => {
        callbacks.onElimina(p.id);
      });

    contenitore.appendChild(card);
  });
}

// ============================================================
// Commenti
// ============================================================

/**
 * @param {Array} commenti
 * @param {HTMLElement} contenitore
 * @param {{ onElimina: Function }} callbacks
 */
export function mostraCommenti(commenti, contenitore, callbacks) {
  pulisciContenitore(contenitore);

  if (commenti.length === 0) {
    mostraVuoto(contenitore, "Nessun commento trovato");
    return;
  }

  commenti.forEach((c) => {
    const data = c.creatoIl
      ? new Date(c.creatoIl).toLocaleString("it-IT", {
          timeZone: "Europe/Rome",
        })
      : "-";
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
            <h3>${c.nome}</h3>
            <p>${c.email}</p>
            <p>${c.corpo}</p>
            <p><strong>Creato il:</strong> ${data}</p>
            <div class="azioni">
                <button class="btn-pericolo" data-azione="elimina">Elimina</button>
            </div>
        `;

    card
      .querySelector('[data-azione="elimina"]')
      .addEventListener("click", () => {
        callbacks.onElimina(c.id);
      });

    contenitore.appendChild(card);
  });
}
