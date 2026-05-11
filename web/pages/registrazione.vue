<template>
  <div>
    <h1 class="titolo-sezione">Registrazione</h1>

    <form @submit.prevent="eseguiRegistrazione">
      <label>Nome</label>
      <input v-model="form.nome" type="text" placeholder="Es. Mario Rossi" required />

      <label>Email</label>
      <input v-model="form.email" type="email" placeholder="mario@esempio.com" required />

      <label>Password</label>
      <input v-model="form.password" type="password" placeholder="Minimo 8 caratteri" required />

      <label>Codice Fiscale</label>
      <input v-model="form.codiceFiscale" type="text" placeholder="RSSMRA90A01H501A" maxlength="16" required />

      <label>Sesso</label>
      <select v-model="form.sesso" required>
        <option value="">Seleziona</option>
        <option value="M">M</option>
        <option value="F">F</option>
        <option value="Altro">Altro</option>
      </select>

      <div v-if="errore" class="errore">{{ errore }}</div>

      <button type="submit" :disabled="caricamento">
        {{ caricamento ? 'Registrazione in corso…' : 'Registrati' }}
      </button>
    </form>

    <p style="margin-top: 1rem; font-size: 0.875rem">
      Hai già un account? <NuxtLink to="/login">Accedi</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
const { registrazione } = useAuth()
const router = useRouter()

const regexCF = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/

const form = reactive({
  nome: '',
  email: '',
  password: '',
  codiceFiscale: '',
  sesso: '',
})

const errore = ref('')
const caricamento = ref(false)

async function eseguiRegistrazione() {
  errore.value = ''
  if (!regexCF.test(form.codiceFiscale.toUpperCase())) {
    errore.value = 'Codice fiscale non valido (formato: RSSMRA90A01H501A)'
    return
  }
  caricamento.value = true
  try {
    await registrazione({ ...form, codiceFiscale: form.codiceFiscale.toUpperCase() })
    await router.push('/utenti')
  } catch (err: unknown) {
    errore.value = err instanceof Error ? err.message : 'Errore durante la registrazione'
  } finally {
    caricamento.value = false
  }
}
</script>
