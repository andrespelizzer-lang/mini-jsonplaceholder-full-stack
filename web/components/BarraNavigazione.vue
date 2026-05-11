<template>
  <header class="header">
    <div class="contenitore header-interno">
      <NuxtLink to="/" class="logo">Mini JSONPlaceholder</NuxtLink>

      <nav class="nav-link">
        <NuxtLink to="/utenti">Utenti</NuxtLink>
        <NuxtLink to="/post">Post</NuxtLink>
        <NuxtLink to="/commenti">Commenti</NuxtLink>
      </nav>

      <div class="stato-auth">
        <span v-if="utenteLoggato" class="nome-utente">{{ utenteLoggato.nome }}</span>
        <NuxtLink v-if="!utenteLoggato" to="/login" class="link-login">Login</NuxtLink>
        <button v-if="utenteLoggato" class="btn-logout" @click="eseguiLogout">Logout</button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const { utenteLoggato, logout } = useAuth()
const router = useRouter()

async function eseguiLogout() {
  logout()
  await router.push('/login')
}
</script>
