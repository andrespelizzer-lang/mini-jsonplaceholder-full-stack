<template>
  <div>
    <div class="breadcrumb">
      <NuxtLink to="/post">Post</NuxtLink> &rarr; {{ post?.titolo ?? '…' }}
    </div>

    <p v-if="caricamento" class="vuoto">Caricamento…</p>
    <div v-else-if="errore" class="errore">{{ errore }}</div>

    <template v-else-if="post">
      <div class="card" style="margin-bottom: 1.5rem">
        <h2>{{ post.titolo }}</h2>
        <p>{{ post.corpo }}</p>
        <p v-if="post.creatoIl"><small>Creato il: {{ creatoIl }}</small></p>
      </div>

      <h2 class="titolo-sezione">Commenti</h2>

      <FormCommento
        v-if="utenteLoggato"
        :post-id-fisso="post.id"
        @invia="aggiungiCommento"
      />

      <div v-if="erroreCommenti" class="errore">{{ erroreCommenti }}</div>
      <p v-if="caricamentoCommenti" class="vuoto">Caricamento commenti…</p>
      <template v-else>
        <p v-if="commenti.length === 0" class="vuoto">Nessun commento</p>
        <CardCommento
          v-for="c in commenti"
          :key="c.id"
          :commento="c"
          @elimina="eliminaCommento"
        />
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Post } from '~/composables/usePost'
import type { Commento } from '~/composables/useCommenti'

const route = useRoute()
const id = parseInt(route.params.id as string)

const { ottieniPostPerId } = usePost()
const { ottieniCommenti, creaCommento, eliminaCommento: eliminaCommentoApi } = useCommenti()
const { utenteLoggato } = useAuth()
const { aggiorna: aggiornaStatistiche } = useStatistiche()

const post = ref<Post | null>(null)
const commenti = ref<Commento[]>([])
const caricamento = ref(true)
const caricamentoCommenti = ref(true)
const errore = ref('')
const erroreCommenti = ref('')

const creatoIl = computed(() =>
  post.value?.creatoIl
    ? new Date(post.value.creatoIl).toLocaleString('it-IT', { timeZone: 'Europe/Rome' })
    : '-'
)

async function carica() {
  try {
    post.value = await ottieniPostPerId(id)
  } catch (err: unknown) {
    errore.value = err instanceof Error ? err.message : 'Post non trovato'
  } finally {
    caricamento.value = false
  }
}

async function caricaCommenti() {
  try {
    commenti.value = await ottieniCommenti(id)
  } catch (err: unknown) {
    erroreCommenti.value = err instanceof Error ? err.message : 'Errore nel caricamento commenti'
  } finally {
    caricamentoCommenti.value = false
  }
}

async function aggiungiCommento(dati: { postId: number; nome: string; email: string; corpo: string }) {
  erroreCommenti.value = ''
  try {
    await creaCommento(dati)
    await caricaCommenti()
    await aggiornaStatistiche()
  } catch (err: unknown) {
    erroreCommenti.value = err instanceof Error ? err.message : 'Errore nella creazione'
  }
}

async function eliminaCommento(idCommento: number) {
  if (!confirm('Sei sicuro di voler eliminare questo commento?')) return
  erroreCommenti.value = ''
  try {
    await eliminaCommentoApi(idCommento)
    await caricaCommenti()
    await aggiornaStatistiche()
  } catch (err: unknown) {
    erroreCommenti.value = err instanceof Error ? err.message : "Errore nell'eliminazione"
  }
}

onMounted(async () => {
  await carica()
  await caricaCommenti()
})
</script>
