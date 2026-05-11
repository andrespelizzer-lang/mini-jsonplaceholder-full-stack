<template>
  <div>
    <div class="breadcrumb">
      <NuxtLink to="/utenti">Utenti</NuxtLink> &rarr; {{ utente?.nome ?? '…' }}
    </div>

    <p v-if="caricamento" class="vuoto">Caricamento…</p>
    <div v-else-if="errore" class="errore">{{ errore }}</div>

    <template v-else-if="utente">
      <div class="card" style="margin-bottom: 1.5rem">
        <h2>{{ utente.nome }}</h2>
        <p>{{ utente.email }}</p>
        <p>{{ utente.citta || 'Nessuna città' }}</p>
        <p><strong>CF:</strong> {{ utente.codiceFiscale }}</p>
        <p><strong>Sesso:</strong> {{ utente.sesso }}</p>
      </div>

      <h2 class="titolo-sezione">Post di {{ utente.nome }}</h2>

      <p v-if="caricamentoPost" class="vuoto">Caricamento post…</p>
      <p v-else-if="errorePost" class="errore">{{ errorePost }}</p>
      <p v-else-if="post.length === 0" class="vuoto">Nessun post trovato</p>
      <CardPost
        v-for="p in post"
        :key="p.id"
        :post="p"
        @vedi-commenti="(postItem) => navigateTo(`/post/${postItem.id}`)"
        @elimina="eliminaPost"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Utente } from '~/composables/useUtenti'
import type { Post } from '~/composables/usePost'

const route = useRoute()
const id = parseInt(route.params.id as string)

const { ottieniUtente } = useUtenti()
const { ottieniPost, eliminaPost: eliminaPostApi } = usePost()
const { aggiorna: aggiornaStatistiche } = useStatistiche()

const utente = ref<Utente | null>(null)
const post = ref<Post[]>([])
const caricamento = ref(true)
const caricamentoPost = ref(true)
const errore = ref('')
const errorePost = ref('')

async function carica() {
  try {
    utente.value = await ottieniUtente(id)
  } catch (err: unknown) {
    errore.value = err instanceof Error ? err.message : 'Utente non trovato'
  } finally {
    caricamento.value = false
  }
}

async function caricaPost() {
  try {
    const risposta = await ottieniPost({ userId: id, limit: 100 })
    post.value = risposta.dati
  } catch (err: unknown) {
    errorePost.value = err instanceof Error ? err.message : 'Errore nel caricamento post'
  } finally {
    caricamentoPost.value = false
  }
}

async function eliminaPost(idPost: number) {
  if (!confirm('Sei sicuro di voler eliminare questo post?')) return
  try {
    await eliminaPostApi(idPost)
    await caricaPost()
    await aggiornaStatistiche()
  } catch (err: unknown) {
    errorePost.value = err instanceof Error ? err.message : "Errore nell'eliminazione"
  }
}

onMounted(async () => {
  await carica()
  await caricaPost()
})
</script>
