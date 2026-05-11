export interface Post {
  id: number
  userId: number
  titolo: string
  corpo: string
  creatoIl?: string
}

export interface RispostaPost {
  dati: Post[]
  totale: number
}

export const usePost = () => {
  const { chiamataApi } = useApi()

  async function ottieniPost(params: { userId?: number; page?: number; limit?: number } = {}): Promise<RispostaPost> {
    const query = new URLSearchParams()
    if (params.userId) query.set('userId', String(params.userId))
    if (params.page) query.set('page', String(params.page))
    if (params.limit) query.set('limit', String(params.limit))
    const strQuery = query.toString() ? `?${query}` : ''
    return chiamataApi<RispostaPost>(`/post${strQuery}`)
  }

  async function ottieniPostPerId(id: number): Promise<Post> {
    return chiamataApi<Post>(`/post/${id}`)
  }

  async function creaPost(dati: { titolo: string; corpo: string }): Promise<Post> {
    return chiamataApi<Post>('/post', {
      method: 'POST',
      body: JSON.stringify(dati),
    })
  }

  async function eliminaPost(id: number): Promise<void> {
    return chiamataApi(`/post/${id}`, { method: 'DELETE' })
  }

  return { ottieniPost, ottieniPostPerId, creaPost, eliminaPost }
}
