<template>
  <div class="barra-statistiche">
    <span>Utenti: <strong>{{ stats.utenti }}</strong></span>
    <span>Post: <strong>{{ stats.post }}</strong></span>
    <span>Commenti: <strong>{{ stats.commenti }}</strong></span>
  </div>
</template>

<script setup lang="ts">
const { stats, aggiorna } = useStatistiche()
onMounted(aggiorna)
</script>
