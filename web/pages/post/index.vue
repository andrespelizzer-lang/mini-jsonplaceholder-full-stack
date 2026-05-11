<template>
  <div>
    <h1 class="titolo-sezione">Post</h1>

    <FormPost v-if="utenteLoggato" @invia="creaPost" />

    <div v-if="errore" class="errore">{{ errore }}</div>
    <p v-if="caricamento" class="vuoto">Caricamento post…</p>

    <template v-else>
      <p v-if="post.length === 0" class="vuoto">Nessun post trovato</p>
      <CardPost
        v-for="p in post"
        :key="p.id"
        :post="p"
        @vedi-commenti="(postItem) => navigateTo(`/post/${postItem.id}`)"
        @elimina="eliminaPost"
      />
    </template>

    <Paginazione :pagina="pagina" :totale-pagine="totalePagine" @cambia="cambiaPagina" />
  </div>
</template>

<script setup lang="ts">
import type { Post } from '~/composables/usePost'

const LIMITE = 5

const { utenteLoggato } = useAuth()
const { ottieniPost, creaPost: creaPostApi, eliminaPost: eliminaPostApi } = usePost()
const { aggiorna: aggiornaStatistiche } = useStatistiche()

const post = ref<Post[]>([])
const pagina = ref(1)
const totale = ref(0)
const caricamento = ref(true)
const errore = ref('')

const totalePagine = computed(() => Math.max(1, Math.ceil(totale.value / LIMITE)))

async function carica() {
  caricamento.value = true
  errore.value = ''
  try {
    const risposta = await ottieniPost({ page: pagina.value, limit: LIMITE })
    post.value = risposta.dati
    totale.value = risposta.totale
  } catch (err: unknown) {
    errore.value = err instanceof Error ? err.message : 'Errore nel caricamento'
  } finally {
    caricamento.value = false
  }
}

async function cambiaPagina(nuovaPagina: number) {
  pagina.value = nuovaPagina
  await carica()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function creaPost(dati: { titolo: string; corpo: string }) {
  errore.value = ''
  try {
    await creaPostApi(dati)
    pagina.value = 1
    await carica()
    await aggiornaStatistiche()
  } catch (err: unknown) {
    errore.value = err instanceof Error ? err.message : 'Errore nella creazione'
  }
}

async function eliminaPost(id: number) {
  if (!confirm('Sei sicuro di voler eliminare questo post?')) return
  errore.value = ''
  try {
    await eliminaPostApi(id)
    await carica()
    await aggiornaStatistiche()
  } catch (err: unknown) {
    errore.value = err instanceof Error ? err.message : "Errore nell'eliminazione"
  }
}

onMounted(carica)
</script>
