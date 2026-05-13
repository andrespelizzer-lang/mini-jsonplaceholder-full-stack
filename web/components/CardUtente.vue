<template>
  <div class="card">
    <h3>{{ utente.nome }}</h3>
    <p>{{ utente.email }}</p>
    <p>{{ utente.citta || "Nessuna città" }}</p>
    <p><strong>CF:</strong> {{ utente.codiceFiscale }}</p>
    <p><strong>Sesso:</strong> {{ utente.sesso }}</p>
    <p><strong>Nascita:</strong> {{ dataNascita }}</p>
    <p><strong>Telefono:</strong> {{ utente.telefono || "-" }}</p>
    <p v-if="utente.creatoIl"><strong>Creato il:</strong> {{ creatoIl }}</p>
    <div class="azioni">
      <button class="btn-primario" @click="$emit('vedi-post', utente)">
        Vedi Post
      </button>
      <button
        v-if="isAdmin"
        class="btn-secondario"
        @click="$emit('modifica', utente)"
      >
        Modifica
      </button>
      <button
        v-if="isAdmin"
        class="btn-pericolo"
        @click="$emit('elimina', utente.id)"
      >
        Elimina
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Utente } from "~/composables/useUtenti";

const props = defineProps<{ utente: Utente }>();
defineEmits<{
  "vedi-post": [utente: Utente];
  modifica: [utente: Utente];
  elimina: [id: number];
}>();

const { isAdmin } = useAuth();

const dataNascita = computed(() =>
  props.utente.dataNascita
    ? new Date(props.utente.dataNascita).toLocaleDateString("it-IT")
    : "-",
);

const creatoIl = computed(() =>
  props.utente.creatoIl
    ? new Date(props.utente.creatoIl).toLocaleString("it-IT", {
        timeZone: "Europe/Rome",
      })
    : "-",
);
</script>
