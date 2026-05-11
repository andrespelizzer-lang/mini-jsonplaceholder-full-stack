<template>
  <div class="card">
    <h3>{{ post.titolo }}</h3>
    <p>{{ post.corpo }}</p>
    <p v-if="post.creatoIl"><small>Creato il: {{ creatoIl }}</small></p>
    <div class="azioni">
      <button class="btn-primario" @click="$emit('vedi-commenti', post)">Vedi Commenti</button>
      <button v-if="puoEliminare" class="btn-pericolo" @click="$emit('elimina', post.id)">Elimina</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Post } from '~/composables/usePost'

const props = defineProps<{ post: Post }>()
defineEmits<{
  'vedi-commenti': [post: Post]
  'elimina': [id: number]
}>()

const { utenteLoggato, isAdmin } = useAuth()

const puoEliminare = computed(() =>
  utenteLoggato.value !== null &&
  (utenteLoggato.value.id === props.post.userId || isAdmin.value)
)

const creatoIl = computed(() =>
  props.post.creatoIl
    ? new Date(props.post.creatoIl).toLocaleString('it-IT', { timeZone: 'Europe/Rome' })
    : '-'
)
</script>
