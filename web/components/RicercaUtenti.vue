<template>
  <input
    v-model="cerca"
    type="text"
    class="ricerca-input"
    placeholder="Cerca utenti per nome, email o città…"
  />
</template>

<script setup lang="ts">
const cerca = defineModel<string>({ default: '' })
</script>
