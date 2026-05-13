<template>
  <div>
    <h1 class="titolo-sezione">Utenti</h1>

    <FormUtente
      v-if="isAdmin"
      :utente-in-modifica="utenteInModifica"
      @invia="salvaUtente"
      @annulla="utenteInModifica = null"
    />

    <RicercaUtenti v-model="ricerca" />

    <div v-if="errore" class="errore">{{ errore }}</div>
    <p v-if="caricamento" class="vuoto">Caricamento utenti…</p>

    <template v-else>
      <p v-if="utentiFiltrati.length === 0" class="vuoto">
        Nessun utente trovato
      </p>
      <CardUtente
        v-for="utente in utentiFiltrati"
        :key="utente.id"
        :utente="utente"
        @vedi-post="(u) => navigateTo(`/utenti/${u.id}`)"
        @modifica="attivaModifica"
        @elimina="eliminaUtente"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Utente } from "~/composables/useUtenti";

const { isAdmin } = useAuth();
const {
  ottieniUtenti,
  creaUtente,
  aggiornaUtente,
  eliminaUtente: eliminaUtenteApi,
} = useUtenti();
const { aggiorna: aggiornaStatistiche } = useStatistiche();

const utenti = ref<Utente[]>([]);
const ricerca = ref("");
const errore = ref("");
const caricamento = ref(true);
const utenteInModifica = ref<Utente | null>(null);

const utentiFiltrati = computed(() => {
  const testo = ricerca.value.toLowerCase();
  if (!testo) return utenti.value;
  return utenti.value.filter((u) =>
    `${u.nome} ${u.email} ${u.citta ?? ""}`.toLowerCase().includes(testo),
  );
});

async function carica() {
  caricamento.value = true;
  errore.value = "";
  try {
    utenti.value = await ottieniUtenti();
  } catch (err: unknown) {
    errore.value =
      err instanceof Error ? err.message : "Errore nel caricamento";
  } finally {
    caricamento.value = false;
  }
}

async function salvaUtente(dati: Record<string, string>) {
  errore.value = "";
  try {
    if (utenteInModifica.value) {
      await aggiornaUtente(utenteInModifica.value.id, dati);
      utenteInModifica.value = null;
    } else {
      await creaUtente(dati);
    }
    await carica();
    await aggiornaStatistiche();
  } catch (err: unknown) {
    errore.value =
      err instanceof Error ? err.message : "Errore nel salvataggio";
  }
}

async function eliminaUtente(id: number) {
  if (!confirm("Sei sicuro di voler eliminare questo utente?")) return;
  errore.value = "";
  try {
    await eliminaUtenteApi(id);
    await carica();
    await aggiornaStatistiche();
  } catch (err: unknown) {
    errore.value =
      err instanceof Error ? err.message : "Errore nell'eliminazione";
  }
}

function attivaModifica(utente: Utente) {
  utenteInModifica.value = utente;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

onMounted(carica);
</script>
