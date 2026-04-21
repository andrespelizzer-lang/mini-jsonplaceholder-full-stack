import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { creaUtente, trovaUtentePerEmail } from "../database/queries/utenti.js";

const router = Router();

router.post("/registrazione", async (req, res) => {
  try {
    const { nome, email, password, codiceFiscale, sesso } = req.body;

    if (!email || !password) {
      return res.status(400).json({ errore: "Email e password obbligatori" });
    }

    // Passiamo l'oggetto completo a creaUtente
    const utente = await creaUtente({
      nome,
      email,
      password,
      codiceFiscale,
      sesso,
    });

    // Firmiamo il token
    const token = jwt.sign(
      { id: utente.id, email: utente.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    // UNICA RISPOSTA: manda tutto insieme
    return res.status(201).json({
      token,
      utente: { id: utente.id, nome: utente.nome, email: utente.email },
    });
  } catch (errore) {
    console.error("Errore POST /api/registrazione:", errore);
    res.status(500).json({ errore: "Errore interno del server" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const utente = await trovaUtentePerEmail(email);
  if (!utente)
    return res.status(401).json({ errore: "Credenziali non valide" });

  const valida = await bcrypt.compare(password, utente.password);
  if (!valida)
    return res.status(401).json({ errore: "Credenziali non valide" });

  const token = jwt.sign(
    { id: utente.id, email: utente.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN },
  );
  res.json({
    token,
    utente: { id: utente.id, nome: utente.nome, email: utente.email },
  });
});

export default router;
