export const useApi = () => {
  const config = useRuntimeConfig();
  const baseUrl = config.public.apiBase;

  async function chiamataApi<T = unknown>(
    percorso: string,
    opzioni: RequestInit = {},
  ): Promise<T> {
    const token = localStorage.getItem("token");
    const intestazioni: Record<string, string> = {
      "Content-Type": "application/json",
      ...(opzioni.headers as Record<string, string>),
    };
    if (token) intestazioni["Authorization"] = `Bearer ${token}`;

    const risposta = await fetch(`${baseUrl}${percorso}`, {
      ...opzioni,
      headers: intestazioni,
    });

    if (!risposta.ok) {
      const corpo = await risposta.json();
      throw new Error(corpo.errore || "Errore sconosciuto");
    }

    return risposta.json();
  }

  return { chiamataApi };
};
