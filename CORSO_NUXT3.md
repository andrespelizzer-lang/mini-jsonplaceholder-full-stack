# Corso completo: Nuxt 3 sul Mini JSONPlaceholder

> Questo corso è basato al 100% sul tuo progetto reale. Ogni concetto è spiegato
> con il codice che hai effettivamente in `web/`. Alla fine c'è una sezione di
> esercizi pratici con soluzioni complete.

---

## Indice

1. [Introduzione: cos'è Nuxt 3 e perché esiste](#1-introduzione)
2. [Setup del progetto e configurazione](#2-setup)
3. [Vue 3: i concetti base della reattività](#3-vue-3-concetti-base)
4. [Le direttive del template](#4-direttive)
5. [I componenti: props, emit, slot](#5-componenti)
6. [Routing automatico in Nuxt](#6-routing)
7. [Layouts e app.vue](#7-layouts)
8. [Composables: la riusabilità della logica](#8-composables)
9. [TypeScript nel progetto](#9-typescript)
10. [Analisi file per file (riga per riga)](#10-file-per-file)
11. [Flussi completi end-to-end](#11-flussi-completi)
12. [Esercizi con soluzioni](#12-esercizi)
13. [Cheat sheet finale](#13-cheat-sheet)

---

<a id="1-introduzione"></a>
## 1. Introduzione: cos'è Nuxt 3 e perché esiste

### 1.1 Il problema che risolve

Nel vecchio progetto (`web-old/`) avevi tre file:
- `index.html` con tutta l'interfaccia in un unico file enorme
- `stile.css` con tutti gli stili
- `js/app.js` (oltre 430 righe) con tutta la logica

Tutto era costruito a mano:
```js
document.getElementById("lista-utenti").innerHTML = utenti.map(u => `
  <div class="card">
    <h3>${u.nome}</h3>
  </div>
`).join('')
```

**Problema:** quando l'app cresce, diventa impossibile capire chi modifica cosa,
chi ascolta quale evento, dove sta lo stato. Un bottone che apparentemente
funziona può rompere tre cose in altre parti.

### 1.2 La soluzione: Vue 3 + Nuxt 3

**Vue 3** è una libreria che ti permette di:
- Scrivere componenti riutilizzabili (file `.vue`)
- Usare la **reattività**: quando una variabile cambia, l'HTML si aggiorna da solo
- Pensare in termini di "cosa devo mostrare" invece di "come modifico il DOM"

**Nuxt 3** è un framework che sta sopra Vue 3 e aggiunge:
- **Routing automatico**: una cartella `pages/` diventa l'insieme delle URL
- **Auto-import**: non scrivi mai `import` per le tue funzioni Vue
- **Configurazione pronta**: hot reload, build, TypeScript già impostati
- **Server-side rendering** (qui non lo usiamo: `ssr: false` in config)

**Analogia:** se Vue 3 è il motore di un'auto, Nuxt 3 è l'auto montata e pronta.

### 1.3 Cosa abbiamo costruito

```
web/                       ← il frontend Nuxt
├── app.vue                ← componente radice
├── nuxt.config.ts         ← configurazione
├── layouts/
│   └── default.vue        ← struttura comune a tutte le pagine
├── pages/                 ← una cartella = un sito intero
│   ├── index.vue          → URL "/"
│   ├── login.vue          → URL "/login"
│   ├── registrazione.vue  → URL "/registrazione"
│   ├── utenti/
│   │   ├── index.vue      → URL "/utenti"
│   │   └── [id].vue       → URL "/utenti/42"
│   ├── post/
│   │   ├── index.vue      → URL "/post"
│   │   └── [id].vue       → URL "/post/7"
│   └── commenti.vue       → URL "/commenti"
├── components/            ← componenti riutilizzabili
│   ├── BarraNavigazione.vue
│   ├── BarraStatistiche.vue
│   ├── CardUtente.vue
│   ├── CardPost.vue
│   ├── CardCommento.vue
│   ├── FormUtente.vue
│   ├── FormPost.vue
│   ├── FormCommento.vue
│   ├── RicercaUtenti.vue
│   └── Paginazione.vue
└── composables/           ← funzioni riutilizzabili (logica)
    ├── useApi.ts          ← chiamate HTTP
    ├── useAuth.ts         ← login/logout/JWT
    ├── useUtenti.ts       ← CRUD utenti
    ├── usePost.ts         ← CRUD post
    ├── useCommenti.ts     ← CRUD commenti
    └── useStatistiche.ts  ← contatori globali
```

---

<a id="2-setup"></a>
## 2. Setup del progetto e configurazione

### 2.1 `nuxt.config.ts`

```ts
export default defineNuxtConfig({
  compatibilityDate: "2026-05-11",   // versione delle API di Nuxt
  devtools: { enabled: true },        // strumenti di sviluppo nel browser
  ssr: false,                         // niente server-side rendering (SPA pura)

  devServer: {
    port: 3001,                       // il dev server gira sulla porta 3001
  },

  nitro: {
    preset: "static",                 // build produce file statici
  },

  vite: {                             // configurazione di Vite (il bundler)
    server: {
      hmr: { protocol: "ws", host: "localhost" },  // hot reload
      watch: { usePolling: true },                  // serve su Windows/Docker
    },
  },

  css: ["~/assets/css/main.css"],     // CSS globale, importato ovunque

  runtimeConfig: {
    public: {
      apiBase: "http://localhost:3000/api",  // URL del backend
    },
  },
})
```

**Punti chiave:**

- **`ssr: false`** — il sito viene renderizzato **solo nel browser**. Niente
  server Node che pre-renderizza l'HTML. È più semplice ma perde SEO.
- **`runtimeConfig.public.apiBase`** — è una variabile **accessibile dal client**
  via `useRuntimeConfig().public.apiBase`. La usi in `useApi.ts` per non
  hard-coddare l'URL del backend.
- **`devServer.port: 3001`** — il frontend gira su `:3001`, il backend su `:3000`.
  Per questo serve CORS abilitato lato API.

### 2.2 Come avviare il progetto

Dalla cartella `web/`:
```bash
npm install     # installa le dipendenze (solo la prima volta)
npm run dev     # avvia il dev server su http://localhost:3001
```

Dalla cartella `api/`:
```bash
npm install
npm run dev     # avvia il backend su http://localhost:3000
```

Per il database MySQL, dalla cartella radice:
```bash
docker compose up -d
```

---

<a id="3-vue-3-concetti-base"></a>
## 3. Vue 3: i concetti base della reattività

### 3.1 Cos'è la "reattività"

In JavaScript normale:
```js
let nome = "Mario"
document.getElementById("output").textContent = nome
nome = "Luigi"   // il DOM non cambia! resta "Mario"
```

Devi aggiornare il DOM manualmente ogni volta.

Con Vue:
```js
const nome = ref("Mario")
// nel template: <p>{{ nome }}</p>
nome.value = "Luigi"   // il template mostra automaticamente "Luigi"
```

Vue "osserva" `nome` e ogni volta che cambia, **ricalcola solo le parti del
DOM che dipendono da `nome`**. Tu non tocchi il DOM.

### 3.2 `ref()` — variabili reattive

```ts
const contatore = ref(0)
const nome = ref<string>('')
const utenti = ref<Utente[]>([])
```

**Regola fondamentale:**
- In `<script>` accedi al valore con **`.value`**:
  ```ts
  contatore.value++
  utenti.value = await ottieniUtenti()
  ```
- Nel `<template>` Vue lo capisce automaticamente, **niente `.value`**:
  ```html
  <p>{{ contatore }}</p>
  ```

### 3.3 `reactive()` — oggetti reattivi

Per gli oggetti `reactive()` è più comodo di `ref()`:

```ts
// in FormUtente.vue, riga 57
const form = reactive({
  nome: '',
  email: '',
  citta: '',
  password: '',
})

// accedi senza .value
form.nome = 'Mario'
console.log(form.email)
```

**Quando usare cosa:**
- Stringa, numero, booleano, array → `ref()`
- Oggetto con tante proprietà → `reactive()`

In realtà `ref()` funziona anche con oggetti — è solo questione di stile.
Il progetto usa `reactive()` per i form.

### 3.4 `computed()` — valori derivati

```ts
// in CardUtente.vue, riga 31
const dataNascita = computed(() =>
  props.utente.dataNascita
    ? new Date(props.utente.dataNascita).toLocaleDateString('it-IT')
    : '-'
)
```

`computed()` crea una variabile che si **ricalcola automaticamente** quando
qualcosa che usa al suo interno cambia.

Pensa a Excel: una cella con `=A1+B1` si aggiorna ogni volta che A1 o B1
cambiano. `computed()` è la stessa cosa.

**Esempio dal progetto** (pages/utenti/index.vue, riga 44):

```ts
const utentiFiltrati = computed(() => {
  const testo = ricerca.value.toLowerCase()
  if (!testo) return utenti.value
  return utenti.value.filter((u) =>
    `${u.nome} ${u.email} ${u.citta ?? ''}`.toLowerCase().includes(testo)
  )
})
```

Quando l'utente scrive nella casella di ricerca, `ricerca.value` cambia →
Vue ricalcola `utentiFiltrati` → il template mostra la nuova lista. Zero
addEventListener.

### 3.5 `watch()` — reagire ai cambiamenti

`computed()` produce un valore. `watch()` invece **esegue codice** quando
qualcosa cambia.

```ts
// in FormUtente.vue, riga 68
watch(
  () => props.utenteInModifica,   // cosa osservare
  (utente) => {                    // cosa fare quando cambia
    if (utente) {
      form.nome = utente.nome
      form.email = utente.email
      // ... pre-compila il form
    } else {
      Object.assign(form, { nome: '', email: '', /* ... */ })
    }
  },
  { immediate: true }              // esegui anche al montaggio
)
```

Quando il parent passa un nuovo `utenteInModifica` (perché l'utente ha
cliccato "Modifica"), questo watch si attiva e popola il form.

`{ immediate: true }` significa "esegui anche subito, non aspettare il primo
cambio".

### 3.6 Lifecycle hooks: `onMounted()`

I componenti hanno un "ciclo di vita":
1. Vengono creati
2. Vengono inseriti nel DOM (montati)
3. Possono essere aggiornati
4. Vengono rimossi (smontati)

```ts
// in pages/utenti/index.vue, riga 97
onMounted(carica)
```

`onMounted(funzione)` esegue `funzione` **dopo che il componente è
nel DOM**. È il momento giusto per fare le prime chiamate API.

Equivale al vecchio `caricaUtenti()` chiamato in fondo al file `app.js`.

Altri hook (non usati qui ma utili):
- `onUnmounted` — quando il componente viene rimosso (cleanup di listener)
- `onUpdated` — dopo ogni re-render

---

<a id="4-direttive"></a>
## 4. Le direttive del template

Le **direttive** sono attributi HTML speciali che iniziano con `v-` (oppure
con le scorciatoie `:` e `@`).

### 4.1 `{{ }}` — interpolazione di testo

```html
<h3>{{ utente.nome }}</h3>
<p>{{ contatore + 1 }}</p>
<p>{{ utente.citta || 'Nessuna città' }}</p>
```

Dentro le doppie graffe puoi scrivere **qualsiasi espressione JavaScript**
(no statement come `if`, ma sì ternario `? :`).

### 4.2 `v-bind` / `:` — legare attributi a variabili

```html
<!-- senza v-bind: stringa letterale "utente.id" -->
<input id="utente.id" />

<!-- con v-bind: il VALORE di utente.id -->
<input :id="utente.id" />

<!-- forma estesa equivalente -->
<input v-bind:id="utente.id" />
```

Esempi dal progetto:
```html
<CardUtente :utente="u" :key="u.id" />
<button :disabled="caricamento">Salva</button>
<Paginazione :pagina="pagina" :totale-pagine="totalePagine" />
```

**Nota:** le props in kebab-case (`totale-pagine`) corrispondono a camelCase
nel JS (`totalePagine`).

### 4.3 `v-on` / `@` — ascoltare eventi

```html
<button @click="invia">Salva</button>
<form @submit.prevent="invia">...</form>
<input @input="aggiorna" />
```

**Modificatori utili:**
- `.prevent` — chiama `event.preventDefault()` automaticamente
- `.stop` — `event.stopPropagation()`
- `.once` — l'evento viene ascoltato una sola volta
- `.enter` su keyboard — solo se l'utente preme Invio

Esempio:
```html
<!-- equivale a fare e.preventDefault() dentro la funzione -->
<form @submit.prevent="eseguiLogin">
```

### 4.4 `v-model` — binding bidirezionale

```html
<input v-model="form.nome" />
```

Equivale a:
```html
<input :value="form.nome" @input="form.nome = $event.target.value" />
```

Cioè: il campo mostra `form.nome`, e quando l'utente scrive, aggiorna
`form.nome`. Sincronizzazione bidirezionale.

**Modificatori utili:**
- `v-model.number` — converte automaticamente a numero
- `v-model.trim` — toglie gli spazi all'inizio/fine
- `v-model.lazy` — aggiorna su `change` invece che `input`

Esempio dal progetto (FormCommento.vue, riga 7):
```html
<input v-model.number="form.postId" type="number" />
```

### 4.5 `v-if`, `v-else-if`, `v-else` — condizionali

```html
<p v-if="caricamento">Caricamento…</p>
<p v-else-if="errore">{{ errore }}</p>
<p v-else>Tutto ok!</p>
```

L'elemento **non esiste nel DOM** se la condizione è falsa. È diverso da
`v-show` che usa `display: none`.

**Quando usare cosa:**
- `v-if` — l'elemento appare/scompare raramente (es. login form)
- `v-show` — l'elemento si nasconde/mostra spesso (è più veloce nascondere
  via CSS che ricreare il DOM)

Nel progetto si usa solo `v-if`.

### 4.6 `v-for` — cicli

```html
<CardUtente
  v-for="utente in utentiFiltrati"
  :key="utente.id"
  :utente="utente"
/>
```

**Regola importante:** ogni elemento ripetuto deve avere una `:key` unica.
Vue la usa per capire quale elemento è quale quando la lista cambia, così
non deve distruggere e ricreare tutto.

Forme alternative:
```html
<li v-for="(item, index) in lista" :key="index">
  {{ index }}: {{ item }}
</li>

<div v-for="(valore, chiave) in oggetto" :key="chiave">
  {{ chiave }}: {{ valore }}
</div>
```

### 4.7 `<template>` come contenitore senza tag

A volte vuoi raggruppare elementi senza aggiungere un `<div>` superfluo:

```html
<template v-if="utente">
  <h2>{{ utente.nome }}</h2>
  <p>{{ utente.email }}</p>
</template>
```

`<template>` non viene renderizzato nel DOM, è solo un raggruppamento logico.

---

<a id="5-componenti"></a>
## 5. I componenti: props, emit, slot

Un componente è un file `.vue` riutilizzabile. Pensa a una funzione: ha
**input** (props), **output** (emit) e può avere **contenuto interno** (slot).

### 5.1 `defineProps` — gli input

```ts
// in CardUtente.vue, riga 22
const props = defineProps<{ utente: Utente }>()
```

`defineProps<{...}>()` dichiara quali parametri il componente accetta,
con il loro tipo TypeScript.

Sintassi alternative:
```ts
// con valori di default
const props = withDefaults(
  defineProps<{ titolo?: string; conteggio?: number }>(),
  { titolo: 'Default', conteggio: 0 }
)

// senza TypeScript (vecchio stile)
const props = defineProps({
  utente: { type: Object, required: true },
  titolo: { type: String, default: '' }
})
```

**Come si usano:**

Dal parent:
```html
<CardUtente :utente="mioUtente" />
```

Dentro il componente:
```ts
console.log(props.utente.nome)   // nello script
```

Nel template puoi anche scrivere direttamente `{{ utente.nome }}` (senza
`props.`) — Vue lo capisce.

**Importante:** le props sono **read-only**. Non puoi fare
`props.utente.nome = 'Pippo'`. Se devi modificare un valore ricevuto, devi
emettere un evento e lasciare che il parent lo modifichi.

### 5.2 `defineEmits` — gli output

```ts
// in CardUtente.vue, righe 23-27
defineEmits<{
  'vedi-post': [utente: Utente]
  'modifica': [utente: Utente]
  'elimina': [id: number]
}>()
```

Dichiara quali eventi il componente può emettere e con quali dati.

**Come si emettono nel template:**
```html
<button @click="$emit('vedi-post', utente)">Vedi Post</button>
```

**Come si emettono in script:**
```ts
const emit = defineEmits<{ 'invia': [dati: object] }>()
function invia() {
  emit('invia', { nome: 'Mario' })
}
```

**Come il parent li ascolta:**
```html
<CardUtente
  :utente="u"
  @vedi-post="(u) => navigateTo(`/utenti/${u.id}`)"
  @modifica="attivaModifica"
  @elimina="eliminaUtente"
/>
```

### 5.3 `defineModel` — v-model custom (Vue 3.4+)

Per componenti che si comportano come un input nativo:

```vue
<!-- RicercaUtenti.vue, righe 1-12 -->
<template>
  <input v-model="cerca" placeholder="Cerca utenti…" />
</template>

<script setup lang="ts">
const cerca = defineModel<string>({ default: '' })
</script>
```

Uso:
```html
<RicercaUtenti v-model="ricerca" />
```

`defineModel()` crea un ref reattivo collegato bidirezionalmente al `v-model`
del parent. Quando l'utente scrive, `ricerca` nel parent si aggiorna.

Sotto il cofano è equivalente a:
```ts
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [valore: string] }>()
```

Ma molto più conciso.

### 5.4 `<slot />` — contenuto dinamico

In `layouts/default.vue`:
```html
<template>
  <div>
    <BarraNavigazione />
    <BarraStatistiche />
    <main>
      <slot />   <!-- qui finisce il contenuto della pagina -->
    </main>
  </div>
</template>
```

Lo slot è "il buco" dove il componente padre inserisce contenuto. È usato
soprattutto nei **layout** e nei **wrapper**.

Esempio di uso fuori dal progetto:
```vue
<!-- Card.vue -->
<template>
  <div class="card">
    <slot />
  </div>
</template>

<!-- uso -->
<Card>
  <h2>Ciao</h2>   <!-- finisce dentro lo slot -->
</Card>
```

---

<a id="6-routing"></a>
## 6. Routing automatico in Nuxt

### 6.1 Come funziona

Nuxt guarda la cartella `pages/` e crea **automaticamente** una rotta per
ogni file `.vue`:

| File                        | URL              |
|-----------------------------|------------------|
| `pages/index.vue`           | `/`              |
| `pages/login.vue`           | `/login`         |
| `pages/commenti.vue`        | `/commenti`      |
| `pages/utenti/index.vue`    | `/utenti`        |
| `pages/utenti/[id].vue`     | `/utenti/:id`    |
| `pages/post/index.vue`      | `/post`          |
| `pages/post/[id].vue`       | `/post/:id`      |

**Regole:**
- `index.vue` dentro una cartella = URL della cartella senza `/index`
- `[nome].vue` = parametro dinamico (es. `[id]` cattura `/utenti/42`)
- Si possono annidare cartelle quanto vuoi

### 6.2 `useRoute()` — leggere i parametri dell'URL

```ts
// in pages/utenti/[id].vue, righe 39-40
const route = useRoute()
const id = parseInt(route.params.id as string)
```

`useRoute()` restituisce l'oggetto della rotta corrente:
- `route.params` — i parametri dinamici (`[id]` → `route.params.id`)
- `route.query` — i parametri della query string (`?page=2` → `route.query.page`)
- `route.path` — il percorso (`/utenti/42`)
- `route.fullPath` — percorso + query (`/utenti/42?page=2`)

### 6.3 `useRouter()` — navigare programmaticamente

```ts
// in pages/login.vue, righe 27 e 39
const router = useRouter()
// ...dopo il login...
await router.push('/utenti')
```

Metodi:
- `router.push('/percorso')` — vai a una nuova pagina
- `router.back()` — torna indietro
- `router.replace('/percorso')` — vai senza aggiungere alla cronologia

### 6.4 `navigateTo()` — alternativa moderna

```ts
// in pages/utenti/index.vue, riga 23
@vedi-post="(u) => navigateTo(`/utenti/${u.id}`)"
```

`navigateTo()` è la versione "Nuxt-friendly" di `router.push()`. Funziona
anche in contesti SSR e supporta più opzioni.

### 6.5 `<NuxtLink>` — link interni senza ricaricare

```html
<NuxtLink to="/utenti">Utenti</NuxtLink>
<NuxtLink :to="`/utenti/${u.id}`">Vai al profilo</NuxtLink>
```

**Differenza da `<a href="...">`:**
- `<a>` ricarica completamente la pagina (perdi lo stato)
- `<NuxtLink>` cambia URL senza ricaricare (Single Page Application)

Inoltre `<NuxtLink>` aggiunge automaticamente la classe `router-link-active`
al link della pagina corrente — utile per evidenziare il menu attivo.

---

<a id="7-layouts"></a>
## 7. Layouts e app.vue

### 7.1 `app.vue` — la radice di tutto

```html
<!-- app.vue -->
<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
```

- `<NuxtLayout>` — applica il layout corrente (default: `layouts/default.vue`)
- `<NuxtPage />` — qui dentro Nuxt mette la pagina corrispondente all'URL

Questo è il componente più esterno. Tutto il resto sta dentro.

### 7.2 `layouts/default.vue` — la struttura comune

```html
<!-- layouts/default.vue -->
<template>
  <div>
    <BarraNavigazione />
    <BarraStatistiche />
    <main class="contenitore pagina">
      <slot />
    </main>
  </div>
</template>
```

Il layout è la "cornice" che si ripete su tutte le pagine: header, sidebar,
footer. Lo `<slot />` è dove Nuxt inserisce la pagina specifica.

**Flusso visivo:**
```
app.vue
└── NuxtLayout (default.vue)
    ├── BarraNavigazione
    ├── BarraStatistiche
    └── <main>
        └── NuxtPage (pages/utenti/index.vue)
            ├── h1
            ├── FormUtente
            ├── RicercaUtenti
            └── CardUtente (× N)
```

### 7.3 Layout multipli

Puoi definire più layout (`layouts/admin.vue`, `layouts/blank.vue`, ecc.)
e sceglierne uno per pagina:

```vue
<!-- pages/login.vue -->
<script setup>
definePageMeta({ layout: 'blank' })
</script>
```

Nel progetto c'è solo `default.vue`, quindi tutte le pagine lo usano.

---

<a id="8-composables"></a>
## 8. Composables: la riusabilità della logica

### 8.1 Cos'è un composable

Un **composable** è una funzione che:
1. Inizia con `use` per convenzione (`useAuth`, `useUtenti`, ecc.)
2. Sta in `composables/` (auto-importata da Nuxt)
3. Contiene logica reattiva riutilizzabile

È il modo "Composition API" di organizzare il codice — invece di mettere
tutto dentro un componente, estrai pezzi di logica in funzioni.

### 8.2 Auto-import

In Nuxt non scrivi mai:
```ts
import { useAuth } from '~/composables/useAuth'   // ❌ inutile
```

Nuxt importa automaticamente:
- Tutto quello che sta in `composables/`
- Tutto quello che sta in `components/`
- Le API di Vue (`ref`, `computed`, `watch`, `onMounted`, ...)
- Le API di Nuxt (`useRoute`, `useRouter`, `navigateTo`, `useState`, ...)

Scrivi direttamente:
```ts
const { isAdmin } = useAuth()
const utenti = ref<Utente[]>([])
```

### 8.3 Anatomia di un composable: `useApi.ts`

```ts
export const useApi = () => {
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiBase

  async function chiamataApi<T = unknown>(
    percorso: string,
    opzioni: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('token')
    const intestazioni: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(opzioni.headers as Record<string, string>),
    }
    if (token) intestazioni['Authorization'] = `Bearer ${token}`

    const risposta = await fetch(`${baseUrl}${percorso}`, {
      ...opzioni,
      headers: intestazioni,
    })

    if (!risposta.ok) {
      const corpo = await risposta.json()
      throw new Error(corpo.errore || 'Errore sconosciuto')
    }

    return risposta.json()
  }

  return { chiamataApi }
}
```

**Spiegazione riga per riga:**

```ts
const config = useRuntimeConfig()
const baseUrl = config.public.apiBase
```
Legge la configurazione dal `nuxt.config.ts`. `apiBase` vale
`http://localhost:3000/api`.

```ts
async function chiamataApi<T = unknown>(
  percorso: string,
  opzioni: RequestInit = {}
): Promise<T>
```
La funzione è **generica** (`<T>`): chi la chiama dice che tipo si aspetta.
Esempio: `chiamataApi<Utente[]>('/utenti')` significa "questa restituisce
un array di Utente".

```ts
const token = localStorage.getItem('token')
```
Legge il token JWT salvato al login.

```ts
const intestazioni: Record<string, string> = {
  'Content-Type': 'application/json',
  ...(opzioni.headers as Record<string, string>),
}
```
Costruisce gli header HTTP. Lo spread `...opzioni.headers` permette al
chiamante di aggiungere o sovrascrivere header.

```ts
if (token) intestazioni['Authorization'] = `Bearer ${token}`
```
Se c'è un token, lo aggiunge come `Bearer`. È lo standard JWT.

```ts
const risposta = await fetch(`${baseUrl}${percorso}`, {
  ...opzioni,
  headers: intestazioni,
})
```
Fa la chiamata. `${baseUrl}${percorso}` costruisce l'URL completo:
`http://localhost:3000/api` + `/utenti` = `http://localhost:3000/api/utenti`.

```ts
if (!risposta.ok) {
  const corpo = await risposta.json()
  throw new Error(corpo.errore || 'Errore sconosciuto')
}
```
Se HTTP status è 4xx o 5xx, legge il messaggio di errore dal body (il backend
risponde con `{ errore: "..." }`) e lancia un'eccezione. Chi chiama
`chiamataApi` deve catturarla con `try/catch`.

```ts
return risposta.json()
```
Restituisce il body parsato come JSON.

### 8.4 `useState()` — stato globale condiviso

Il problema: se due componenti chiamano lo stesso composable, ognuno ottiene
i propri `ref()`. Non c'è condivisione.

```ts
// dentro useAuth(), se facessimo così:
const utenteLoggato = ref<Utente | null>(null)
```
Ogni componente avrebbe il suo `utenteLoggato`. Il logout in uno non si
propaga negli altri.

Soluzione: `useState('chiave', fn)`:
```ts
// useAuth.ts, riga 11
const utenteLoggato = useState<Utente | null>('utenteLoggato', () => {
  const raw = localStorage.getItem('utente')
  return raw ? JSON.parse(raw) : null
})
```

`useState('utenteLoggato', ...)` registra uno stato **globale** identificato
dalla stringa `'utenteLoggato'`. Tutti i componenti che chiamano
`useState('utenteLoggato', ...)` ottengono lo stesso ref. È **come una
variabile globale ma reattiva**.

La funzione passata come secondo argomento serve solo a fornire il **valore
iniziale** la prima volta che lo stato viene creato.

### 8.5 Composables impilati

Il progetto ha questa struttura a livelli:

```
useApi          (livello base: HTTP)
  ↑
useAuth         (usa useApi per /auth/login, /auth/registrazione)
useUtenti       (usa useApi per /utenti, /utenti/:id, ...)
usePost         (usa useApi per /post, /post/:id, ...)
useCommenti     (usa useApi per /commenti, ...)
useStatistiche  (usa useApi per /utenti, /post, /commenti)
```

Ogni composable più alto si appoggia a `useApi`. Questo separa:
- **COME** si fa una chiamata HTTP (`useApi`)
- **CHE** chiamate fare per ogni risorsa (`useUtenti`, `usePost`, ...)

---

<a id="9-typescript"></a>
## 9. TypeScript nel progetto

### 9.1 `interface` — definire la forma degli oggetti

```ts
// useUtenti.ts, righe 1-12
export interface Utente {
  id: number
  nome: string
  email: string
  citta?: string           // il "?" significa: opzionale
  codiceFiscale: string
  sesso: string
  dataNascita?: string
  telefono?: string
  ruolo?: string
  creatoIl?: string
}
```

Le interface descrivono la "forma" di un oggetto. TypeScript controlla che
tu non scriva codice sbagliato:

```ts
const u: Utente = { id: 1, nome: 'Mario' }
// ❌ ERRORE: mancano email, codiceFiscale, sesso (obbligatori)

const u: Utente = { id: 1, nome: 'Mario', email: 'm@x.it',
  codiceFiscale: 'X', sesso: 'M' }
// ✓ ok

console.log(u.eta)
// ❌ ERRORE: la proprietà 'eta' non esiste su Utente
```

### 9.2 `import type` — solo per i tipi

```ts
import type { Utente } from '~/composables/useUtenti'
```

Usa `import type` quando importi **solo l'interfaccia**, non il codice
runtime. È un'ottimizzazione: TypeScript rimuove questi import dal bundle
finale.

### 9.3 Generics `<T>`

```ts
async function chiamataApi<T = unknown>(percorso: string): Promise<T>
```

`<T>` è un "parametro di tipo". Chi chiama decide cosa è `T`:

```ts
chiamataApi<Utente>('/utenti/1')        // T = Utente, ritorna Promise<Utente>
chiamataApi<Utente[]>('/utenti')        // T = Utente[]
chiamataApi<{ totale: number }>('/post') // T è un oggetto specifico
```

Senza generics dovresti scrivere `as Utente` ogni volta — meno sicuro,
meno leggibile.

### 9.4 Type narrowing

```ts
catch (err: unknown) {
  errore.value = err instanceof Error ? err.message : 'Errore'
}
```

`err` è di tipo `unknown` perché in JavaScript puoi lanciare qualsiasi cosa
(`throw 'stringa'`, `throw 42`). Il `instanceof Error` "restringe" il tipo:
dentro il ramo `?` TypeScript sa che `err` ha `.message`.

### 9.5 `?.` e `??` — accessi sicuri

```ts
utenteLoggato.value?.ruolo === 'admin'
```
- `?.` = optional chaining: se `utenteLoggato.value` è `null`/`undefined`,
  non crasha, restituisce `undefined`.

```ts
return Math.max(1, Math.ceil(totale.value / LIMITE))
const x = a ?? 'default'
```
- `??` = nullish coalescing: usa il valore di destra solo se quello di
  sinistra è `null` o `undefined` (NON usa per `0` o `""` come fa `||`).

### 9.6 `Record<K, V>`

```ts
async function creaUtente(dati: Record<string, string>): Promise<Utente>
```

`Record<string, string>` significa "un oggetto con chiavi stringa e valori
stringa". Equivale a `{ [chiave: string]: string }`.

---

<a id="10-file-per-file"></a>
## 10. Analisi file per file (riga per riga)

### 10.1 `app.vue`

```vue
<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
```

È il componente più esterno. Non ha logica, solo struttura:
- `<NuxtLayout>` applica il layout (di default `layouts/default.vue`)
- `<NuxtPage>` è il "buco" dove Nuxt mette la pagina in base all'URL

### 10.2 `layouts/default.vue`

```vue
<template>
  <div>
    <BarraNavigazione />
    <BarraStatistiche />
    <main class="contenitore pagina">
      <slot />
    </main>
  </div>
</template>
```

- `BarraNavigazione` e `BarraStatistiche` sono auto-importati da `components/`
- `<slot />` è dove finisce la `<NuxtPage>` di `app.vue`

### 10.3 `components/BarraNavigazione.vue`

```vue
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
```

**Punti chiave:**
- Tre `NuxtLink` di navigazione principale (non ricaricano la pagina)
- `v-if="utenteLoggato"` mostra il nome solo se loggato
- `v-if="!utenteLoggato"` mostra il link login se NON loggato
- `eseguiLogout()` chiama `logout()` (svuota lo stato) e poi reindirizza al login

### 10.4 `components/BarraStatistiche.vue`

```vue
<template>
  <div class="barra-statistiche">
    <span>Utenti: <strong>{{ stats.utenti }}</strong></span>
    <span>Post: <strong>{{ stats.post }}</strong></span>
    <span>Commenti: <strong>{{ stats.commenti }}</strong></span>
  </div>
</template>

<script setup lang="ts">
const { stats, aggiorna } = useStatistiche()
onMounted(aggiorna)
</script>
```

- `stats` è uno stato globale (via `useState` dentro `useStatistiche`)
- `onMounted(aggiorna)` chiama l'API al primo caricamento
- Quando altri componenti chiamano `aggiornaStatistiche()`, `stats` cambia e
  questa barra si aggiorna in automatico

### 10.5 `components/CardUtente.vue`

Vedi la sezione 5 per l'analisi completa.

### 10.6 `components/CardPost.vue`

```vue
<script setup lang="ts">
import type { Post } from '~/composables/usePost'

const props = defineProps<{ post: Post }>()
defineEmits<{
  'vedi-commenti': [post: Post]
  'elimina': [id: number]
}>()

const { utenteLoggato, isAdmin } = useAuth()

const puoEliminare = computed(() =>
  utenteLoggato.value !== null &&
  (utenteLoggato.value.id === props.post.userId || isAdmin.value)
)
</script>
```

**Logica autorizzazione:** un post può essere eliminato se:
- C'è un utente loggato, E
- È l'autore del post (`utenteLoggato.id === post.userId`) OPPURE è admin

Questa logica è in `computed()` perché dipende da `utenteLoggato` e
`isAdmin` (reattivi). Se l'utente fa logout, `puoEliminare` diventa `false`
e il bottone "Elimina" sparisce.

### 10.7 `components/CardCommento.vue`

Più semplice: tutti gli utenti loggati possono eliminare i commenti.

### 10.8 `components/FormUtente.vue` — analisi completa

```vue
<template>
  <form @submit.prevent="invia">
    <h3>{{ utenteInModifica ? 'Modifica Utente' : 'Nuovo Utente' }}</h3>

    <label>Nome</label>
    <input v-model="form.nome" type="text" required />

    <!-- ... altri campi ... -->

    <template v-if="!utenteInModifica">
      <label>Password</label>
      <input v-model="form.password" type="password" required />
    </template>

    <div v-if="errore" class="errore">{{ errore }}</div>

    <button type="submit">
      {{ utenteInModifica ? 'Salva modifiche' : 'Crea Utente' }}
    </button>
    <button v-if="utenteInModifica" type="button" @click="$emit('annulla')">
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
  nome: '', email: '', citta: '', codiceFiscale: '',
  sesso: '', dataNascita: '', telefono: '', password: '',
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
      Object.assign(form, {
        nome: '', email: '', citta: '', codiceFiscale: '',
        sesso: '', dataNascita: '', telefono: '', password: ''
      })
    }
  },
  { immediate: true }
)

function invia() {
  errore.value = ''
  if (!regexCF.test(form.codiceFiscale.toUpperCase())) {
    errore.value = 'Codice fiscale non valido'
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
```

**Cose interessanti:**

1. **Stesso form per crea/modifica**: il titolo, il testo del bottone e
   la presenza del campo password cambiano in base a `utenteInModifica`.

2. **`watch(() => props.utenteInModifica, ...)`**: quando il parent passa
   un nuovo utente da modificare, il watch popola i campi.

3. **`immediate: true`**: esegui il watch anche all'avvio, così se il
   componente viene montato con `utenteInModifica` già valorizzato, parte già
   compilato.

4. **`type="button"` sul bottone Annulla**: senza questo sarebbe `type="submit"`
   di default e farebbe submit del form.

5. **`emit('invia', dati)`** alla fine: il form non sa cosa fare con i dati,
   delega al parent.

### 10.9 `components/FormPost.vue`

```vue
<script setup lang="ts">
const emit = defineEmits<{
  'invia': [dati: { titolo: string; corpo: string }]
}>()

const form = reactive({ titolo: '', corpo: '' })

function invia() {
  emit('invia', { titolo: form.titolo, corpo: form.corpo })
  form.titolo = ''
  form.corpo = ''
}
</script>
```

Più semplice di `FormUtente`. Dopo l'emit svuota il form (questa è una
scelta di UX: una volta inviato il post, il form si pulisce).

### 10.10 `components/FormCommento.vue`

```vue
<script setup lang="ts">
const props = defineProps<{ postIdFisso?: number | null }>()

const emit = defineEmits<{
  'invia': [dati: { postId: number; nome: string; email: string; corpo: string }]
}>()

const form = reactive({
  postId: props.postIdFisso ?? 0,
  nome: '', email: '', corpo: '',
})

watch(() => props.postIdFisso, (val) => {
  if (val) form.postId = val
})

function invia() {
  emit('invia', { postId: form.postId, nome: form.nome,
    email: form.email, corpo: form.corpo })
  form.nome = ''
  form.email = ''
  form.corpo = ''
  if (!props.postIdFisso) form.postId = 0
}
</script>
```

**Pattern interessante:** `postIdFisso` ti dice se il form deve mostrare il
campo "Post ID" o nasconderlo. Nella pagina `/post/[id]` lo nascondi (il post
è già noto), nella pagina `/commenti` lo mostri.

```html
<template v-if="!postIdFisso">
  <label>Post ID</label>
  <input v-model.number="form.postId" type="number" required />
</template>
```

`v-model.number` converte automaticamente l'input string in numero — utile
qui perché il backend si aspetta `postId: number`.

### 10.11 `components/RicercaUtenti.vue`

```vue
<template>
  <input v-model="cerca" placeholder="Cerca utenti…" />
</template>

<script setup lang="ts">
const cerca = defineModel<string>({ default: '' })
</script>
```

Usato così:
```html
<RicercaUtenti v-model="ricerca" />
```

Il `defineModel` collega bidirezionalmente la `ricerca` del parent con il
`cerca` del componente.

### 10.12 `components/Paginazione.vue`

```vue
<template>
  <div v-if="totalePagine > 1" class="paginazione">
    <button :disabled="pagina === 1" @click="$emit('cambia', pagina - 1)">
      Precedente
    </button>
    <span>Pagina {{ pagina }} di {{ totalePagine }}</span>
    <button :disabled="pagina === totalePagine" @click="$emit('cambia', pagina + 1)">
      Successiva
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ pagina: number; totalePagine: number }>()
defineEmits<{ 'cambia': [pagina: number] }>()
</script>
```

Componente "stupido" (presentational): riceve i dati come props, emette un
evento. Tutta la logica della paginazione sta nel parent
(`pages/post/index.vue`).

### 10.13 `composables/useApi.ts`

Già analizzato nella sezione 8.3. È il cuore di tutte le chiamate HTTP.

### 10.14 `composables/useAuth.ts`

Già spiegato in dettaglio nelle conversazioni precedenti. Riassunto:
- `utenteLoggato` — stato globale (via `useState`)
- `isAdmin` — computed derivato
- `login`, `logout`, `registrazione` — funzioni che chiamano l'API

### 10.15 `composables/useUtenti.ts`

```ts
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
```

Pattern CRUD classico:
- `ottieniUtenti()` → `GET /utenti`
- `ottieniUtente(id)` → `GET /utenti/:id`
- `creaUtente(dati)` → `POST /utenti`
- `aggiornaUtente(id, dati)` → `PUT /utenti/:id`
- `eliminaUtente(id)` → `DELETE /utenti/:id`

### 10.16 `composables/usePost.ts`

```ts
export const usePost = () => {
  const { chiamataApi } = useApi()

  async function ottieniPost(params: {
    userId?: number; page?: number; limit?: number
  } = {}): Promise<RispostaPost> {
    const query = new URLSearchParams()
    if (params.userId) query.set('userId', String(params.userId))
    if (params.page) query.set('page', String(params.page))
    if (params.limit) query.set('limit', String(params.limit))
    const strQuery = query.toString() ? `?${query}` : ''
    return chiamataApi<RispostaPost>(`/post${strQuery}`)
  }

  // ... creaPost, eliminaPost, ottieniPostPerId
}
```

**Cosa fa di interessante:**
- Usa `URLSearchParams` per costruire la query string in modo sicuro
- Tutti i parametri sono opzionali → chiamabile come `ottieniPost()` o
  `ottieniPost({ userId: 5 })` o `ottieniPost({ page: 2, limit: 10 })`
- La risposta ha la forma `{ dati: Post[], totale: number }` (per la
  paginazione)

### 10.17 `composables/useStatistiche.ts`

```ts
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
```

**Trucco di ottimizzazione:** per i post chiama `/post?page=1&limit=1` invece
di scaricare TUTTI i post. Il backend risponde con `{ dati: [unPost], totale: N }`
e a noi serve solo `totale`. Risparmia banda.

**`Promise.all`** lancia le tre chiamate in **parallelo**. Senza `Promise.all`
sarebbero sequenziali (una dopo l'altra) — più lente.

### 10.18 `pages/index.vue`

```vue
<script setup lang="ts">
await navigateTo('/utenti')
</script>
```

La home page è solo un redirect: quando vai a `/` sei mandato a `/utenti`.

### 10.19 `pages/login.vue`

```vue
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
    errore.value = err instanceof Error ? err.message : 'Errore'
  } finally {
    caricamento.value = false
  }
}
</script>
```

**Pattern UX comune** in 4 step:
1. `caricamento = true` all'inizio (mostra "Accesso in corso…", disabilita il bottone)
2. `try`: fai l'azione
3. `catch`: salva l'errore in una ref reattiva (verrà mostrato dal template)
4. `finally`: `caricamento = false`, sia se è andata bene sia se è fallita

### 10.20 `pages/utenti/index.vue`

Già analizzato in dettaglio. Riassumendo:
- Carica utenti all'`onMounted`
- Filtra in tempo reale con `computed(utentiFiltrati)`
- Form `<FormUtente>` per creare/modificare
- Lista di `<CardUtente>` con `v-for`

### 10.21 `pages/utenti/[id].vue`

Pagina di dettaglio utente. Mostra l'utente e i suoi post.

```ts
const route = useRoute()
const id = parseInt(route.params.id as string)
```

Cattura l'`id` dall'URL. `route.params.id` è una `string` (gli URL sono
stringhe), `parseInt` la converte in numero.

```ts
onMounted(async () => {
  await carica()
  await caricaPost()
})
```

Carica in sequenza: prima l'utente, poi i suoi post.

### 10.22 `pages/post/index.vue`

Pagina post con **paginazione**:

```ts
const LIMITE = 5
const pagina = ref(1)
const totale = ref(0)

const totalePagine = computed(() => Math.max(1, Math.ceil(totale.value / LIMITE)))

async function cambiaPagina(nuovaPagina: number) {
  pagina.value = nuovaPagina
  await carica()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
```

`Math.ceil(totale / LIMITE)` calcola quante pagine servono. `Math.max(1, ...)`
evita di mostrare "Pagina 1 di 0" se non ci sono post.

```html
<Paginazione :pagina="pagina" :totale-pagine="totalePagine" @cambia="cambiaPagina" />
```

Il componente `Paginazione` riceve i numeri ed emette `cambia` con la
nuova pagina.

### 10.23 `pages/post/[id].vue`

Dettaglio post + lista commenti. Usa due composables (`usePost`, `useCommenti`).

Nota: `FormCommento` riceve `:post-id-fisso="post.id"` così non chiede
all'utente di inserire manualmente il `postId`.

### 10.24 `pages/commenti.vue`

Mostra TUTTI i commenti (senza filtro per post). Usa la stessa `FormCommento`
ma senza `postIdFisso`, così l'utente deve specificare il `postId`.

### 10.25 `pages/registrazione.vue`

Simile alla login. Differenza: valida il codice fiscale con regex prima di
inviare al backend.

---

<a id="11-flussi-completi"></a>
## 11. Flussi completi end-to-end

### 11.1 Login

```
1. Utente va su /login
2. Compila email e password (v-model aggiorna le ref)
3. Clicca "Accedi" → @submit.prevent="eseguiLogin"
4. eseguiLogin():
   a. caricamento = true
   b. await login(email, password)  ← useAuth.ts
        - POST /api/auth/login
        - Backend verifica password con bcrypt
        - Backend firma JWT con jwt.sign(...)
        - Backend risponde { token, utente }
        - Frontend salva in localStorage
        - utenteLoggato.value = utente  (aggiorna stato globale)
   c. router.push('/utenti')
5. Tutti i componenti che usano utenteLoggato si aggiornano automaticamente:
   - BarraNavigazione mostra il nome utente e il bottone Logout
   - Le pagine che fanno v-if="utenteLoggato" mostrano i form
   - useApi inizia ad aggiungere Authorization: Bearer ... a ogni chiamata
```

### 11.2 Creazione utente (già visto in dettaglio prima)

Riassunto:
```
FormUtente → emit('invia', dati)
  ↓
index.vue → salvaUtente(dati)
  ↓
useUtenti.creaUtente(dati)
  ↓
useApi.chiamataApi('/utenti', { method: 'POST', body: JSON.stringify(dati) })
  ↓
fetch → Backend Express → INSERT INTO utenti → MySQL
  ↓
Backend risponde { id: nuovoId, ...dati }
  ↓
Risposta risale → salvaUtente chiama carica() per ricaricare la lista
  ↓
utenti.value = await ottieniUtenti() (nuova GET /utenti)
  ↓
Template si aggiorna automaticamente → nuovo utente appare nella lista
  ↓
aggiornaStatistiche() aggiorna i contatori globali
```

### 11.3 Eliminazione commento

```
1. Utente nella pagina /post/7 clicca "Elimina" su un commento
2. CardCommento → emit('elimina', commento.id)
3. [id].vue → eliminaCommento(idCommento)
4. confirm('Sei sicuro...?') → se ok prosegue
5. useCommenti.eliminaCommento(idCommento)
6. useApi.chiamataApi('/commenti/3', { method: 'DELETE' })
   - Includes Authorization header (perché loggato)
7. Backend Express:
   - Middleware richiediAutenticazione verifica JWT
   - DELETE FROM commenti WHERE id = ?
   - Risponde 200 { messaggio: "..." }
8. caricaCommenti() ricarica i commenti del post
9. aggiornaStatistiche() aggiorna il contatore
10. Template re-renderizza, il commento sparisce
```

### 11.4 Navigazione drill-down: Utente → suoi post → commenti

```
/utenti
   ↓ click "Vedi Post" su CardUtente
   ↓ navigateTo(`/utenti/${u.id}`)
   ↓
/utenti/3
   ├─ Mostra dati utente
   └─ Mostra suoi post
        ↓ click "Vedi Commenti" su CardPost
        ↓ navigateTo(`/post/${p.id}`)
        ↓
/post/7
   ├─ Mostra il post
   └─ Mostra i suoi commenti + FormCommento (postIdFisso=7)
```

I breadcrumb (`<NuxtLink to="/utenti">Utenti</NuxtLink> → ...`) ti permettono
di tornare indietro.

### 11.5 Paginazione

```
1. /post → onMounted → carica() con page=1, limit=5
2. Backend risponde { dati: [5 post], totale: 23 }
3. totalePagine = ceil(23/5) = 5
4. Paginazione mostra "Pagina 1 di 5"
5. Click "Successiva" → emit('cambia', 2)
6. pages/post/index.vue → cambiaPagina(2)
   - pagina.value = 2
   - await carica()  → GET /post?page=2&limit=5
   - window.scrollTo (torna in cima)
7. Template mostra i 5 nuovi post + "Pagina 2 di 5"
```

---

<a id="12-esercizi"></a>
## 12. Esercizi con soluzioni

Gli esercizi sono in difficoltà crescente. Prova prima da solo, poi guarda la
soluzione.

---

### Esercizio 1 — Contatore reattivo

**Compito:** crea un nuovo file `web/pages/contatore.vue` con un contatore
che parte da 0, un bottone "+" che incrementa, un bottone "-" che decrementa,
e un bottone "Reset" che lo riporta a 0.

<details>
<summary>Soluzione</summary>

```vue
<template>
  <div>
    <h1>Contatore: {{ contatore }}</h1>
    <button @click="contatore++">+</button>
    <button @click="contatore--">-</button>
    <button @click="contatore = 0">Reset</button>
  </div>
</template>

<script setup lang="ts">
const contatore = ref(0)
</script>
```

Vai su `http://localhost:3001/contatore`.
</details>

---

### Esercizio 2 — Computed: parità

**Compito:** estendi l'esercizio 1 mostrando sotto il contatore se il numero
è "Pari" o "Dispari".

<details>
<summary>Soluzione</summary>

```vue
<template>
  <div>
    <h1>Contatore: {{ contatore }}</h1>
    <p>{{ parita }}</p>
    <button @click="contatore++">+</button>
    <button @click="contatore--">-</button>
    <button @click="contatore = 0">Reset</button>
  </div>
</template>

<script setup lang="ts">
const contatore = ref(0)
const parita = computed(() => contatore.value % 2 === 0 ? 'Pari' : 'Dispari')
</script>
```

Nota che NON c'è alcun event listener: `parita` si ricalcola da sola.
</details>

---

### Esercizio 3 — Form con v-model

**Compito:** in `web/pages/saluti.vue` crea un campo di testo per il nome e
un'area che mostra "Ciao [nome]!" in tempo reale, oppure "Ciao sconosciuto"
se il campo è vuoto.

<details>
<summary>Soluzione</summary>

```vue
<template>
  <div>
    <input v-model="nome" type="text" placeholder="Il tuo nome" />
    <h2>Ciao {{ nomeMostrato }}!</h2>
  </div>
</template>

<script setup lang="ts">
const nome = ref('')
const nomeMostrato = computed(() => nome.value.trim() || 'sconosciuto')
</script>
```

`nome.value.trim() || 'sconosciuto'` — se la stringa (dopo trim) è vuota,
JavaScript la considera falsy e usa `'sconosciuto'`.
</details>

---

### Esercizio 4 — Lista filtrata con v-for

**Compito:** crea `web/pages/lista.vue` con una lista hard-coded di 5 frutti
(`mela, banana, ciliegia, dattero, fragola`) e un input di ricerca che
filtra la lista in tempo reale.

<details>
<summary>Soluzione</summary>

```vue
<template>
  <div>
    <input v-model="ricerca" placeholder="Cerca un frutto…" />
    <ul>
      <li v-for="frutto in frutta" :key="frutto">{{ frutto }}</li>
    </ul>
    <p v-if="frutta.length === 0">Nessun frutto trovato</p>
  </div>
</template>

<script setup lang="ts">
const ricerca = ref('')
const tuttiIFrutti = ['mela', 'banana', 'ciliegia', 'dattero', 'fragola']

const frutta = computed(() =>
  tuttiIFrutti.filter(f => f.toLowerCase().includes(ricerca.value.toLowerCase()))
)
</script>
```

Stesso pattern di `utentiFiltrati` in `pages/utenti/index.vue`.
</details>

---

### Esercizio 5 — Componente con prop

**Compito:** crea `web/components/Saluto.vue` che riceve una prop `nome` e
mostra "Buongiorno [nome]!". Poi usalo nella pagina `/lista` per salutare
ogni frutto.

<details>
<summary>Soluzione</summary>

`web/components/Saluto.vue`:
```vue
<template>
  <p>Buongiorno {{ nome }}!</p>
</template>

<script setup lang="ts">
defineProps<{ nome: string }>()
</script>
```

Nella pagina:
```vue
<template>
  <div>
    <Saluto v-for="frutto in tuttiIFrutti" :key="frutto" :nome="frutto" />
  </div>
</template>
```

Nota: non scrivi nessun `import Saluto from ...` — Nuxt lo auto-importa.
</details>

---

### Esercizio 6 — Componente con emit

**Compito:** crea `web/components/BottoneConfermaIndice.vue` che ha un bottone
"Conferma" e quando viene cliccato, emette un evento `conferma` con il
testo `'Sì!'`. Usalo in una pagina e mostra il testo emesso.

<details>
<summary>Soluzione</summary>

`web/components/BottoneConferma.vue`:
```vue
<template>
  <button @click="$emit('conferma', 'Sì!')">Conferma</button>
</template>

<script setup lang="ts">
defineEmits<{ 'conferma': [testo: string] }>()
</script>
```

In una pagina (es. `pages/test.vue`):
```vue
<template>
  <div>
    <BottoneConferma @conferma="riceviConferma" />
    <p v-if="risposta">Risposta: {{ risposta }}</p>
  </div>
</template>

<script setup lang="ts">
const risposta = ref('')
function riceviConferma(testo: string) {
  risposta.value = testo
}
</script>
```
</details>

---

### Esercizio 7 — Routing dinamico

**Compito:** crea `web/pages/saluta/[nome].vue` che mostra "Ciao [nome]
dall'URL!" usando il parametro `nome` preso dall'URL. Prova ad andare
su `/saluta/Mario` e `/saluta/Luigi`.

<details>
<summary>Soluzione</summary>

```vue
<template>
  <h1>Ciao {{ nome }} dall'URL!</h1>
</template>

<script setup lang="ts">
const route = useRoute()
const nome = route.params.nome as string
</script>
```

`as string` è un type assertion: dice a TypeScript "fidati, è una stringa".
In effetti `route.params.nome` è `string | string[]` perché Vue Router
supporta anche parametri ripetuti — qui non è il caso.
</details>

---

### Esercizio 8 — Chiamata API GET

**Compito:** crea `web/pages/conteggio.vue` che, all'avvio, fa una GET a
`/api/utenti` e mostra "Ci sono N utenti." (dove N è il numero ricevuto).
Mostra "Caricamento…" durante la chiamata.

<details>
<summary>Soluzione</summary>

```vue
<template>
  <div>
    <p v-if="caricamento">Caricamento…</p>
    <p v-else-if="errore" class="errore">{{ errore }}</p>
    <p v-else>Ci sono {{ totale }} utenti.</p>
  </div>
</template>

<script setup lang="ts">
import type { Utente } from '~/composables/useUtenti'

const { ottieniUtenti } = useUtenti()
const totale = ref(0)
const caricamento = ref(true)
const errore = ref('')

onMounted(async () => {
  try {
    const utenti = await ottieniUtenti()
    totale.value = utenti.length
  } catch (err: unknown) {
    errore.value = err instanceof Error ? err.message : 'Errore'
  } finally {
    caricamento.value = false
  }
})
</script>
```
</details>

---

### Esercizio 9 — Filtro avanzato sui post

**Compito:** modifica `web/pages/post/index.vue` per aggiungere un campo di
ricerca che filtra i post visibili per titolo (lato client, sui post già
caricati nella pagina corrente).

<details>
<summary>Soluzione</summary>

Aggiungi in `<script setup>`:
```ts
const ricerca = ref('')

const postFiltrati = computed(() => {
  const testo = ricerca.value.toLowerCase().trim()
  if (!testo) return post.value
  return post.value.filter(p =>
    p.titolo.toLowerCase().includes(testo) ||
    p.corpo.toLowerCase().includes(testo)
  )
})
```

Nel template, sostituisci `post` con `postFiltrati` nel v-for, e aggiungi
prima:
```html
<input v-model="ricerca" type="text" placeholder="Cerca nei post…"
       style="margin-bottom: 1rem; width: 100%; padding: 0.5rem;" />

<CardPost
  v-for="p in postFiltrati"
  :key="p.id"
  :post="p"
  @vedi-commenti="(postItem) => navigateTo(`/post/${postItem.id}`)"
  @elimina="eliminaPost"
/>
```

**Limitazione consapevole:** il filtro funziona solo sui 5 post visibili.
Per filtrare TUTTI i post bisognerebbe rifare la chiamata al backend con
un nuovo parametro (es. `?ricerca=...`) — esercizio avanzato.
</details>

---

### Esercizio 10 — Nuovo composable

**Compito:** crea `web/composables/useTempo.ts` che esponga:
- `oraCorrente` (un ref con l'ora corrente come stringa "HH:MM:SS")
- Una funzione `avviaOrologio()` che aggiorna `oraCorrente` ogni secondo

Usalo in una nuova pagina `web/pages/orologio.vue`.

<details>
<summary>Soluzione</summary>

`web/composables/useTempo.ts`:
```ts
export const useTempo = () => {
  const oraCorrente = ref(new Date().toLocaleTimeString('it-IT'))

  function avviaOrologio() {
    setInterval(() => {
      oraCorrente.value = new Date().toLocaleTimeString('it-IT')
    }, 1000)
  }

  return { oraCorrente, avviaOrologio }
}
```

`web/pages/orologio.vue`:
```vue
<template>
  <div>
    <h1>Orologio</h1>
    <p style="font-size: 3rem; font-family: monospace">{{ oraCorrente }}</p>
  </div>
</template>

<script setup lang="ts">
const { oraCorrente, avviaOrologio } = useTempo()
onMounted(avviaOrologio)
</script>
```

**Nota avanzata:** in un'app reale dovresti chiamare `clearInterval` in
`onUnmounted` per evitare leak di memoria. Per questo esercizio è ok.
</details>

---

### Esercizio 11 — Conta i tuoi post

**Compito:** nella pagina `/utenti/[id]` aggiungi una riga che dice
"Questo utente ha N post" usando il `totale` restituito dall'API.

<details>
<summary>Soluzione</summary>

In `pages/utenti/[id].vue`, modifica `caricaPost`:

```ts
const totalePost = ref(0)

async function caricaPost() {
  try {
    const risposta = await ottieniPost({ userId: id, limit: 100 })
    post.value = risposta.dati
    totalePost.value = risposta.totale
  } catch (err: unknown) {
    errorePost.value = err instanceof Error ? err.message : 'Errore'
  } finally {
    caricamentoPost.value = false
  }
}
```

E nel template, dentro `<template v-else-if="utente">`:
```html
<h2 class="titolo-sezione">Post di {{ utente.nome }} ({{ totalePost }})</h2>
```

Oppure prima della lista:
```html
<p v-if="!caricamentoPost">Questo utente ha {{ totalePost }} post.</p>
```
</details>

---

### Esercizio 12 — Protezione delle pagine

**Compito:** crea un middleware di Nuxt che reindirizza l'utente non loggato
a `/login` se prova ad accedere a `/utenti`. (Hint: cerca "Nuxt middleware".)

<details>
<summary>Soluzione</summary>

Crea `web/middleware/auth.ts`:
```ts
export default defineNuxtRouteMiddleware((to) => {
  const { utenteLoggato } = useAuth()
  if (!utenteLoggato.value) {
    return navigateTo('/login')
  }
})
```

In `pages/utenti/index.vue` aggiungi in cima allo script:
```ts
definePageMeta({ middleware: 'auth' })
```

Ora se vai su `/utenti` senza essere loggato, vieni reindirizzato a `/login`.

**Bonus avanzato:** se vuoi che il middleware si applichi a TUTTE le pagine
tranne `/login` e `/registrazione`, rinominalo `auth.global.ts` e dentro:
```ts
export default defineNuxtRouteMiddleware((to) => {
  if (to.path === '/login' || to.path === '/registrazione') return
  const { utenteLoggato } = useAuth()
  if (!utenteLoggato.value) return navigateTo('/login')
})
```
</details>

---

<a id="13-cheat-sheet"></a>
## 13. Cheat sheet finale

### 13.1 Reattività

| API           | Per cosa                                  | Esempio                       |
|---------------|-------------------------------------------|-------------------------------|
| `ref(v)`      | Variabile reattiva                        | `const n = ref(0); n.value++` |
| `reactive(o)` | Oggetto reattivo                          | `const f = reactive({a:1})`   |
| `computed()`  | Valore derivato che si auto-aggiorna      | `const d = computed(() => …)` |
| `watch()`     | Esegui codice quando qualcosa cambia      | `watch(a, (val) => …)`        |
| `useState()`  | Stato globale condiviso tra componenti    | `useState('k', () => 0)`      |

### 13.2 Direttive

| Direttiva   | Cosa fa                              |
|-------------|--------------------------------------|
| `{{ x }}`   | Mostra il valore di `x`              |
| `:attr`     | Lega un attributo a una variabile    |
| `@evento`   | Ascolta un evento                    |
| `v-model`   | Two-way binding                      |
| `v-if`      | Condizionale (crea/distrugge DOM)    |
| `v-show`    | Condizionale (display: none)         |
| `v-for`     | Cicla su array/oggetti               |

### 13.3 Lifecycle

| Hook            | Quando                                   |
|-----------------|------------------------------------------|
| `onMounted`     | Dopo che il componente è nel DOM         |
| `onUnmounted`   | Prima che il componente venga rimosso    |
| `onUpdated`     | Dopo ogni re-render                      |

### 13.4 Componenti

| API             | Cosa fa                                   |
|-----------------|-------------------------------------------|
| `defineProps`   | Dichiara gli input del componente         |
| `defineEmits`   | Dichiara gli eventi che può emettere      |
| `defineModel`   | v-model custom (Vue 3.4+)                 |
| `<slot />`      | Contenitore dinamico per contenuto figlio |

### 13.5 Nuxt-specific

| API                | Cosa fa                                |
|--------------------|----------------------------------------|
| `useRoute()`       | Info sulla rotta corrente              |
| `useRouter()`      | Navigazione programmatica              |
| `navigateTo()`     | Vai a un'altra pagina                  |
| `<NuxtLink>`       | Link interno SPA                       |
| `<NuxtPage>`       | Renderizza la pagina corrente          |
| `<NuxtLayout>`     | Renderizza il layout corrente          |
| `useRuntimeConfig` | Legge configurazione                   |
| `useState()`       | Stato globale                          |
| `definePageMeta`   | Configura una pagina (layout, middleware) |

### 13.6 Pattern visto nel progetto

**Pattern 1 — Form con loading/error/data:**
```ts
const dati = ref(...)
const caricamento = ref(false)
const errore = ref('')

async function azione() {
  caricamento.value = true
  errore.value = ''
  try {
    dati.value = await chiamata()
  } catch (err: unknown) {
    errore.value = err instanceof Error ? err.message : 'Errore'
  } finally {
    caricamento.value = false
  }
}
```

**Pattern 2 — Form padre/figlio:**
- Figlio: raccoglie dati, valida, emette `'invia'`
- Padre: riceve `@invia`, decide cosa fare (crea o modifica)

**Pattern 3 — Composable per ogni risorsa REST:**
- `useApi` fa le chiamate fetch
- `use<Risorsa>` espone i metodi CRUD specifici
- Le pagine usano `use<Risorsa>` senza sapere come fa le chiamate

**Pattern 4 — Stato globale:**
- `useState('chiave', initFn)` per dati condivisi (utente loggato, statistiche)
- Tutti i componenti che chiamano lo stesso `useState` vedono lo stesso valore

---

## Conclusione

Hai ora una mappa completa del progetto. Per consolidare:

1. Fai gli esercizi 1-7 (Vue base) senza guardare le soluzioni
2. Apri ogni file in `web/` e prova a spiegarlo a parole tue
3. Fai gli esercizi 8-12 (Nuxt avanzato)
4. Modifica qualcosa di tuo: aggiungi un campo, una pagina, un componente

Se ti blocchi, chiedi: il progetto è la migliore palestra possibile.
