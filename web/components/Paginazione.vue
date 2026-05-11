<template>
  <div v-if="totalePagine > 1" class="paginazione">
    <button class="btn-secondario" :disabled="pagina === 1" @click="$emit('cambia', pagina - 1)">
      Precedente
    </button>
    <span>Pagina {{ pagina }} di {{ totalePagine }}</span>
    <button class="btn-secondario" :disabled="pagina === totalePagine" @click="$emit('cambia', pagina + 1)">
      Successiva
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ pagina: number; totalePagine: number }>()
defineEmits<{ 'cambia': [pagina: number] }>()
</script>
