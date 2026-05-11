<template>
  <form @submit.prevent="invia">
    <h3>Nuovo Post</h3>

    <label>Titolo</label>
    <input v-model="form.titolo" type="text" placeholder="Es. Il mio primo post" required />

    <label>Corpo</label>
    <textarea v-model="form.corpo" placeholder="Scrivi il contenuto del post…" required></textarea>

    <button type="submit">Crea Post</button>
  </form>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  'invia': [dati: { titolo: string; corpo: string }]
}>()

const form = reactive({ titolo: '', corpo: '' })

function invia() {
  emit('invia', { titolo: form.titolo, corpo: form.corpo })
  form.titolo = ''
  form.corpo = ''
}
</script>
