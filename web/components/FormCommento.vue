<template>
  <form @submit.prevent="invia">
    <h3>Nuovo Commento</h3>

    <template v-if="!postIdFisso">
      <label>Post ID</label>
      <input v-model.number="form.postId" type="number" placeholder="Es. 1" required />
    </template>

    <label>Nome</label>
    <input v-model="form.nome" type="text" placeholder="Es. Mario Rossi" required />

    <label>Email</label>
    <input v-model="form.email" type="email" placeholder="mario@esempio.com" required />

    <label>Corpo</label>
    <textarea v-model="form.corpo" placeholder="Scrivi il commento…" required></textarea>

    <button type="submit">Crea Commento</button>
  </form>
</template>

<script setup lang="ts">
const props = defineProps<{ postIdFisso?: number | null }>()

const emit = defineEmits<{
  'invia': [dati: { postId: number; nome: string; email: string; corpo: string }]
}>()

const form = reactive({
  postId: props.postIdFisso ?? 0,
  nome: '',
  email: '',
  corpo: '',
})

watch(() => props.postIdFisso, (val) => {
  if (val) form.postId = val
})

function invia() {
  emit('invia', { postId: form.postId, nome: form.nome, email: form.email, corpo: form.corpo })
  form.nome = ''
  form.email = ''
  form.corpo = ''
  if (!props.postIdFisso) form.postId = 0
}
</script>
