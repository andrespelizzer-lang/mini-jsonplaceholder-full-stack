<template>
  <form @submit.prevent="invia">
    <h3>{{ utenteInModifica ? 'Modifica Utente' : 'Nuovo Utente' }}</h3>

    <label>Nome</label>
    <input v-model="form.nome" type="text" placeholder="Es. Yoshi Verde" required />

    <label>Email</label>
    <input v-model="form.email" type="email" placeholder="Es. yoshi@email.com" required />

    <label>Città (opzionale)</label>
    <input v-model="form.citta" type="text" placeholder="Es. Isola Yoshi" />

    <label>Codice Fiscale</label>
    <input v-model="form.codiceFiscale" type="text" placeholder="Es. RSSMRA90A01H501A" maxlength="16" required />

    <label>Sesso</label>
    <select v-model="form.sesso" required>
      <option value="">Seleziona</option>
      <option value="M">M</option>
      <option value="F">F</option>
      <option value="Altro">Altro</option>
    </select>

    <label>Data di nascita</label>
    <input v-model="form.dataNascita" type="date" />

    <label>Telefono (10 cifre, opzionale)</label>
    <input v-model="form.telefono" type="tel" placeholder="Es. 3331234567" />

    <template v-if="!utenteInModifica">
      <label>Password</label>
      <input v-model="form.password" type="password" placeholder="Minimo 8 caratteri" required />
    </template>

    <div v-if="errore" class="errore">{{ errore }}</div>

    <button type="submit">{{ utenteInModifica ? 'Salva modifiche' : 'Crea Utente' }}</button>
    <button v-if="utenteInModifica" type="button" class="btn-secondario" style="margin-left: 0.5rem" @click="$emit('annulla')">
      Annulla
    </button>
  </form>
</template>

<script setup lang="ts">
import type { Utente } from '~/composables/useUtenti'

const props = defineProps<{ utenteInModifica?: Utente | null }>()
const emit = defineEmits<{
  'invia': [dati: Record<string, string>]
  'annulla': []
}>()

const regexCF = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/
const errore = ref('')

const form = reactive({
  nome: '',
  email: '',
  citta: '',
  codiceFiscale: '',
  sesso: '',
  dataNascita: '',
  telefono: '',
  password: '',
})

watch(
  () => props.utenteInModifica,
  (utente) => {
    if (utente) {
      form.nome = utente.nome
      form.email = utente.email
      form.citta = utente.citta || ''
      form.codiceFiscale = utente.codiceFiscale
      form.sesso = utente.sesso
      form.dataNascita = utente.dataNascita || ''
      form.telefono = utente.telefono || ''
      form.password = ''
    } else {
      Object.assign(form, { nome: '', email: '', citta: '', codiceFiscale: '', sesso: '', dataNascita: '', telefono: '', password: '' })
    }
  },
  { immediate: true }
)

function invia() {
  errore.value = ''
  if (!regexCF.test(form.codiceFiscale.toUpperCase())) {
    errore.value = 'Codice fiscale non valido (formato: RSSMRA90A01H501A)'
    return
  }
  const dati: Record<string, string> = {
    nome: form.nome,
    email: form.email,
    citta: form.citta,
    codiceFiscale: form.codiceFiscale.toUpperCase(),
    sesso: form.sesso,
    dataNascita: form.dataNascita,
    telefono: form.telefono,
  }
  if (!props.utenteInModifica) dati.password = form.password
  emit('invia', dati)
}
</script>
