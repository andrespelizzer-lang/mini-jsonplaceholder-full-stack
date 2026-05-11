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
export function mostraPost(post, contenitore, callbacks, utenteLoggato) {
  // 1. Pulizia iniziale (evita duplicati se la funzione viene richiamata)
  pulisciContenitore(contenitore);

  // 2. Controllo se ci sono dati
  if (post.length === 0) {
    mostraVuoto(contenitore, "Nessun post trovato");
    return;
  }

  // 3. Ciclo su ogni post
  post.forEach((p) => {
    // Gestione della data (presa dalla seconda funzione)
    const data = p.creatoIl
      ? new Date(p.creatoIl).toLocaleString("it-IT", {
          timeZone: "Europe/Rome",
        })
      : "-";

    // --- LOGICA DI SICUREZZA (dalla prima funzione) ---
    // Un utente può eliminare se: è loggato E (è il proprietario del post OPPURE è admin)
    const puoEliminare =
      utenteLoggato &&
      (utenteLoggato.id === p.userId || utenteLoggato.ruolo === "admin");

    // 4. Creazione dell'elemento DOM
    const card = document.createElement("div");
    card.className = "card";

    // Costruiamo l'HTML: il tasto elimina appare solo se puoEliminare è true
    card.innerHTML = `
        <h3>${p.titolo}</h3>
        <p>${p.corpo}</p>
        <p><small>Creato il: ${data}</small></p>
        <div class="azioni">
            <button class="btn-primario" data-azione="vedi-commenti">Vedi Commenti</button>
            ${puoEliminare ? `<button class="btn-pericolo" data-azione="elimina">Elimina</button>` : ""}
        </div>
    `;

    // 5. Aggancio dei Listener (Eventi)

    // Listener per i commenti (sempre presente)
    card
      .querySelector('[data-azione="vedi-commenti"]')
      .addEventListener("click", () => callbacks.onVediCommenti(p));

    // Listener per elimina (SOLO se il tasto è stato creato)
    if (puoEliminare) {
      card
        .querySelector('[data-azione="elimina"]')
        .addEventListener("click", () => {
          if (confirm("Sei sicuro di voler eliminare questo post?")) {
            callbacks.onElimina(p.id);
          }
        });
    }

    // 6. Aggiunta della card al contenitore nella pagina
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
