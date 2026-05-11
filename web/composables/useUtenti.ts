export interface Utente {
  id: number
  nome: string
  email: string
  citta?: string
  codiceFiscale: string
  sesso: string
  dataNascita?: string
  telefono?: string
  ruolo?: string
  creatoIl?: string
}

export const useUtenti = () => {
  const { chiamataApi } = useApi()

  async function ottieniUtenti(): Promise<Utente[]> {
    return chiamataApi<Utente[]>('/utenti')
  }

  async function ottieniUtente(id: number): Promise<Utente> {
    return chiamataApi<Utente>(`/utenti/${id}`)
  }

  async function creaUtente(dati: Record<string, string>): Promise<Utente> {
    return chiamataApi<Utente>('/utenti', {
      method: 'POST',
      body: JSON.stringify(dati),
    })
  }

  async function aggiornaUtente(id: number, dati: Record<string, string>): Promise<Utente> {
    return chiamataApi<Utente>(`/utenti/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dati),
    })
  }

  async function eliminaUtente(id: number): Promise<void> {
    return chiamataApi(`/utenti/${id}`, { method: 'DELETE' })
  }

  return { ottieniUtenti, ottieniUtente, creaUtente, aggiornaUtente, eliminaUtente }
}
