// routes/post.js — Versione Completa con Esercizio 12 (Ruoli e Ownership)
import { Router } from "express";
import { richiediAutenticazione } from "../middleware/autenticazione.js";
import {
  trovaPost,
  trovaPostPerId,
  creaPost,
  sostituisciPost,
  aggiornaPost,
  eliminaPost,
} from "../database/queries/post.js";

const router = Router();

// ============================================================
// GET /api/post — Lista post con paginazione
// ============================================================
router.get("/", async (req, res) => {
  try {
    const { userId, page, limit } = req.query;
    const pagina = parseInt(page) || 1;
    const limite = parseInt(limit) || 5;
    const risultato = await trovaPost(
      userId ? parseInt(userId) : undefined,
      pagina,
      limite,
    );
    res.json(risultato);
  } catch (errore) {
    console.error("Errore GET /api/post:", errore);
    res.status(500).json({ errore: "Errore interno del server" });
  }
});

// ============================================================
// GET /api/post/:id — Singolo post
// ============================================================
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const elemento = await trovaPostPerId(id);
    if (!elemento) return res.status(404).json({ errore: "Post non trovato" });
    res.json(elemento);
  } catch (errore) {
    res.status(500).json({ errore: "Errore interno del server" });
  }
});

// ============================================================
// POST /api/post — Crea post (Autorizzato)
// ============================================================
router.post("/", richiediAutenticazione, async (req, res) => {
  try {
    const { titolo, corpo } = req.body;
    if (!titolo || !corpo)
      return res.status(400).json({ errore: "Campi mancanti" });

    // Usiamo req.utente.id dal token, più sicuro che passarlo dal body
    const nuovoPost = await creaPost({ userId: req.utente.id, titolo, corpo });
    res.status(201).json(nuovoPost);
  } catch (errore) {
    res.status(500).json({ errore: "Errore interno del server" });
  }
});

// ============================================================
// PUT /api/post/:id — Sostituisce post (Ownership/Admin)
// ============================================================
router.put("/:id", richiediAutenticazione, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const postEsistente = await trovaPostPerId(id);
    if (!postEsistente)
      return res.status(404).json({ errore: "Post non trovato" });

    const isAutore = postEsistente.userId === req.utente.id;
    const isAdmin = req.utente.ruolo === "admin";

    if (!isAutore && !isAdmin) {
      return res
        .status(403)
        .json({ errore: "Non autorizzato a modificare questo post" });
    }

    const { titolo, corpo } = req.body;
    const aggiornato = await sostituisciPost(id, {
      userId: postEsistente.userId,
      titolo,
      corpo,
    });
    res.json(aggiornato);
  } catch (errore) {
    res.status(500).json({ errore: "Errore interno del server" });
  }
});

// ============================================================
// PATCH /api/post/:id — Aggiorna post (Ownership/Admin)
// ============================================================
router.patch("/:id", richiediAutenticazione, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const postEsistente = await trovaPostPerId(id);
    if (!postEsistente)
      return res.status(404).json({ errore: "Post non trovato" });

    const isAutore = postEsistente.userId === req.utente.id;
    const isAdmin = req.utente.ruolo === "admin";

    if (!isAutore && !isAdmin) {
      return res.status(403).json({ errore: "Non autorizzato" });
    }

    const { titolo, corpo } = req.body;
    const elemento = await aggiornaPost(id, { titolo, corpo });
    res.json(elemento);
  } catch (errore) {
    res.status(500).json({ errore: "Errore interno del server" });
  }
});

// ============================================================
// DELETE /api/post/:id — Elimina post (Ownership/Admin)
// ============================================================
router.delete("/:id", richiediAutenticazione, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const post = await trovaPostPerId(id);
    if (!post) return res.status(404).json({ errore: "Post non trovato" });

    const isAutore = post.userId === req.utente.id;
    const isAdmin = req.utente.ruolo === "admin";

    if (!isAutore && !isAdmin) {
      return res
        .status(403)
        .json({ errore: "Puoi modificare solo i tuoi post" });
    }

    const rimosso = await eliminaPost(id);
    res.json({ messaggio: "Post eliminato", post: rimosso });
  } catch (errore) {
    res.status(500).json({ errore: "Errore interno del server" });
  }
});

export default router;
