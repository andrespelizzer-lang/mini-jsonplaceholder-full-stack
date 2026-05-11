<template>
  <div>
    <h1 class="titolo-sezione">Commenti</h1>

    <FormCommento v-if="utenteLoggato" @invia="aggiungiCommento" />

    <div v-if="errore" class="errore">{{ errore }}</div>
    <p v-if="caricamento" class="vuoto">Caricamento commenti…</p>

    <template v-else>
      <p v-if="commenti.length === 0" class="vuoto">Nessun commento trovato</p>
      <CardCommento
        v-for="c in commenti"
        :key="c.id"
        :commento="c"
        @elimina="eliminaCommento"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Commento } from '~/composables/useCommenti'

const { utenteLoggato } = useAuth()
const { ottieniCommenti, creaCommento, eliminaCommento: eliminaCommentoApi } = useCommenti()
const { aggiorna: aggiornaStatistiche } = useStatistiche()

const commenti = ref<Commento[]>([])
const caricamento = ref(true)
const errore = ref('')

async function carica() {
  caricamento.value = true
  errore.value = ''
  try {
    commenti.value = await ottieniCommenti()
  } catch (err: unknown) {
    errore.value = err instanceof Error ? err.message : 'Errore nel caricamento'
  } finally {
    caricamento.value = false
  }
}

async function aggiungiCommento(dati: { postId: number; nome: string; email: string; corpo: string }) {
  errore.value = ''
  try {
    await creaCommento(dati)
    await carica()
    await aggiornaStatistiche()
  } catch (err: unknown) {
    errore.value = err instanceof Error ? err.message : 'Errore nella creazione'
  }
}

async function eliminaCommento(id: number) {
  if (!confirm('Sei sicuro di voler eliminare questo commento?')) return
  errore.value = ''
  try {
    await eliminaCommentoApi(id)
    await carica()
    await aggiornaStatistiche()
  } catch (err: unknown) {
    errore.value = err instanceof Error ? err.message : "Errore nell'eliminazione"
  }
}

onMounted(carica)
</script>
