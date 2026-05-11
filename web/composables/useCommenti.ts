export interface Commento {
  id: number
  postId: number
  nome: string
  email: string
  corpo: string
  creatoIl?: string
}

export const useCommenti = () => {
  const { chiamataApi } = useApi()

  async function ottieniCommenti(postId?: number): Promise<Commento[]> {
    const query = postId ? `?postId=${postId}` : ''
    return chiamataApi<Commento[]>(`/commenti${query}`)
  }

  async function creaCommento(dati: { postId: number; nome: string; email: string; corpo: string }): Promise<Commento> {
    return chiamataApi<Commento>('/commenti', {
      method: 'POST',
      body: JSON.stringify(dati),
    })
  }

  async function eliminaCommento(id: number): Promise<void> {
    return chiamataApi(`/commenti/${id}`, { method: 'DELETE' })
  }

  return { ottieniCommenti, creaCommento, eliminaCommento }
}
