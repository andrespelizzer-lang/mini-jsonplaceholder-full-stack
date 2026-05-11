<template>
  <div class="card">
    <h3>{{ commento.nome }}</h3>
    <p>{{ commento.email }}</p>
    <p>{{ commento.corpo }}</p>
    <p v-if="commento.creatoIl"><strong>Creato il:</strong> {{ creatoIl }}</p>
    <div class="azioni">
      <button v-if="utenteLoggato" class="btn-pericolo" @click="$emit('elimina', commento.id)">
        Elimina
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Commento } from '~/composables/useCommenti'

const props = defineProps<{ commento: Commento }>()
defineEmits<{ 'elimina': [id: number] }>()

const { utenteLoggato } = useAuth()

const creatoIl = computed(() =>
  props.commento.creatoIl
    ? new Date(props.commento.creatoIl).toLocaleString('it-IT', { timeZone: 'Europe/Rome' })
    : '-'
)
</script>
