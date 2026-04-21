// database/queries/utenti.js — Query SQL per la risorsa Utenti
import pool from "../connessione.js";
import bcrypt from "bcrypt";

// Campi da restituire per non inviare mai la password al frontend
const CAMPI_SICURI =
  "id, nome, email, citta, codiceFiscale, sesso, dataNascita, telefono, creatoIl";

// ============================================================
// SELECT — Lettura
// ============================================================

export async function trovaUtenti(citta) {
  if (citta) {
    const [righe] = await pool.query(
      `SELECT ${CAMPI_SICURI} FROM utenti WHERE LOWER(citta) = LOWER(?)`,
      [citta],
    );
    return righe;
  }
  const [righe] = await pool.query(`SELECT ${CAMPI_SICURI} FROM utenti`);
  return righe;
}

export async function trovaUtentePerId(id) {
  const [righe] = await pool.query(
    `SELECT ${CAMPI_SICURI} FROM utenti WHERE id = ?`,
    [id],
  );
  return righe[0];
}

export async function trovaUtentePerEmail(email) {
  const [righe] = await pool.query(
    `SELECT id, nome, email, password FROM utenti WHERE email = ?`,
    [email],
  );
  return righe[0];
}

// ============================================================
// INSERT — Creazione (Esercizio 8)
// ============================================================

export async function creaUtente(dati) {
  // Hashing della password prima del salvataggio
  const hash = await bcrypt.hash(dati.password, 10);

  const [risultato] = await pool.query(
    "INSERT INTO utenti (nome, email, citta, codiceFiscale, sesso, dataNascita, telefono, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      dati.nome,
      dati.email,
      dati.citta || "",
      dati.codiceFiscale,
      dati.sesso,
      dati.dataNascita,
      dati.telefono,
      hash,
    ],
  );

  return { id: risultato.insertId, ...dati, password: undefined };
}

// ============================================================
// UPDATE — Modifica (Sostituzione e Aggiornamento)
// ============================================================

export async function sostituisciUtente(id, dati) {
  // Se nella sostituzione viene passata una password, va hashata
  let passwordDaSalvare = dati.password;
  if (passwordDaSalvare) {
    passwordDaSalvare = await bcrypt.hash(passwordDaSalvare, 10);
  }

  const [risultato] = await pool.query(
    "UPDATE utenti SET nome = ?, email = ?, citta = ?, codiceFiscale = ?, sesso = ?, dataNascita = ?, telefono = ?, password = ? WHERE id = ?",
    [
      dati.nome,
      dati.email,
      dati.citta || "",
      dati.codiceFiscale,
      dati.sesso,
      dati.dataNascita,
      dati.telefono,
      passwordDaSalvare,
      id,
    ],
  );

  if (risultato.affectedRows === 0) return null;
  return trovaUtentePerId(id);
}

export async function aggiornaUtente(id, dati) {
  const campiPermessi = [
    "nome",
    "email",
    "citta",
    "codiceFiscale",
    "sesso",
    "dataNascita",
    "telefono",
    "password",
  ];
  const aggiornamenti = [];
  const valori = [];

  for (const campo of campiPermessi) {
    if (dati[campo] !== undefined) {
      let valore = dati[campo];

      // Se stiamo aggiornando la password (PATCH), la hashiamo qui
      if (campo === "password") {
        valore = await bcrypt.hash(valore, 10);
      }

      aggiornamenti.push(`${campo} = ?`);
      valori.push(valore);
    }
  }

  if (aggiornamenti.length > 0) {
    valori.push(id);
    const [risultato] = await pool.query(
      `UPDATE utenti SET ${aggiornamenti.join(", ")} WHERE id = ?`,
      valori,
    );
    if (risultato.affectedRows === 0) return null;
  }

  return trovaUtentePerId(id);
}

// ============================================================
// DELETE — Eliminazione
// ============================================================

export async function eliminaUtente(id) {
  const utente = await trovaUtentePerId(id);
  if (!utente) return null;

  await pool.query("DELETE FROM utenti WHERE id = ?", [id]);
  return utente;
}
