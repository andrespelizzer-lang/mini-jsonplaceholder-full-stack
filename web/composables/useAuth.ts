interface Utente {
  id: number
  nome: string
  email: string
  ruolo?: string
}

export const useAuth = () => {
  const { chiamataApi } = useApi()

  const utenteLoggato = useState<Utente | null>('utenteLoggato', () => {
    const raw = localStorage.getItem('utente')
    return raw ? JSON.parse(raw) : null
  })

  const isAdmin = computed(() => utenteLoggato.value?.ruolo === 'admin')

  async function registrazione(dati: { nome: string; email: string; password: string; codiceFiscale: string; sesso: string }) {
    const { token, utente } = await chiamataApi<{ token: string; utente: Utente }>('/auth/registrazione', {
      method: 'POST',
      body: JSON.stringify(dati),
    })
    localStorage.setItem('token', token)
    localStorage.setItem('utente', JSON.stringify(utente))
    utenteLoggato.value = utente
  }

  async function login(email: string, password: string) {
    const { token, utente } = await chiamataApi<{ token: string; utente: Utente }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    localStorage.setItem('token', token)
    localStorage.setItem('utente', JSON.stringify(utente))
    utenteLoggato.value = utente
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('utente')
    utenteLoggato.value = null
  }

  return { utenteLoggato, isAdmin, registrazione, login, logout }
}
