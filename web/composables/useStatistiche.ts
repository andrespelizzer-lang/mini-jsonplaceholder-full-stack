export const useStatistiche = () => {
  const { chiamataApi } = useApi()

  const stats = useState('statistiche', () => ({
    utenti: 0 as number | string,
    post: 0 as number | string,
    commenti: 0 as number | string,
  }))

  async function aggiorna() {
    try {
      const [utenti, postRisposta, commenti] = await Promise.all([
        chiamataApi<unknown[]>('/utenti'),
        chiamataApi<{ totale: number }>('/post?page=1&limit=1'),
        chiamataApi<unknown[]>('/commenti'),
      ])
      stats.value = {
        utenti: utenti.length,
        post: postRisposta.totale,
        commenti: commenti.length,
      }
    } catch {
      // silenzioso
    }
  }

  return { stats, aggiorna }
}
