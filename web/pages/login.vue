<template>
  <div>
    <h1 class="titolo-sezione">Login</h1>

    <form @submit.prevent="eseguiLogin">
      <label>Email</label>
      <input v-model="email" type="email" placeholder="email@esempio.com" required />

      <label>Password</label>
      <input v-model="password" type="password" placeholder="Password" required />

      <div v-if="errore" class="errore">{{ errore }}</div>

      <button type="submit" :disabled="caricamento">
        {{ caricamento ? 'Accesso in corso…' : 'Accedi' }}
      </button>
    </form>

    <p style="margin-top: 1rem; font-size: 0.875rem">
      Non hai un account? <NuxtLink to="/registrazione">Registrati</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
const { login } = useAuth()
const router = useRouter()

const email = ref('')
const password = ref('')
const errore = ref('')
const caricamento = ref(false)

async function eseguiLogin() {
  errore.value = ''
  caricamento.value = true
  try {
    await login(email.value, password.value)
    await router.push('/utenti')
  } catch (err: unknown) {
    errore.value = err instanceof Error ? err.message : 'Errore durante il login'
  } finally {
    caricamento.value = false
  }
}
</script>
