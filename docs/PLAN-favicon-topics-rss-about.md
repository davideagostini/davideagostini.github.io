# Piano: favicon DA, topics, feed RSS, pagina About

Stato: fatto, pubblicato su `main` (2026-10-12)

## Decisioni prese

- Favicon: variante 4 "Android green" (DA pixel art 16×16, `#3ddc84` su `#073042`).
- Si fanno: pagina topics/tag, feed RSS, pagina `/about` più completa.
- Fonte per l'About: profilo LinkedIn (esperienze, certificazioni) + testo attuale della home.
- Tag: si riscrive il frontmatter con un elenco curato di topic (niente alias nel codice).
- Ruolo: **Senior Android Engineer** (come il titolo LinkedIn). Sostituisce la decisione
  "Senior Android Developer" di `PLAN-refresh.md`.
- Branch: `feat/favicon-topics-rss-about`.

### 0. Ruolo
- `lib/site.ts`: `role`, `tagline`, `description`, keyword "Senior Android Developer" → Engineer.
- `public/llms.txt` ripete la descrizione: aggiornarla (è testo statico, non legge `lib/site.ts`).
- `docs/PLAN-refresh.md`: nota che la decisione sul ruolo è superata da questo piano.

## Passi

### 1. Favicon
- Nuovo `app/icon.svg` (16×16, `shape-rendering="crispEdges"`).
- Nuovo `app/apple-icon.png` 180×180 generato dallo stesso disegno (iOS non legge gli SVG).
- Rimuovere `app/icon.jpg` (oggi è la foto). La foto resta dove è usata altrove (da verificare).

### 2. Topics
- Oggi i tag nel frontmatter sono incoerenti: maiuscole/minuscole (`android`/`Android`),
  sinonimi (`Compose`/`Jetpack Compose`), tag di servizio (`gde`).
- Proposta: un elenco curato di topic in `lib/topics.ts` (slug, nome, descrizione)
  e i tag di ogni articolo riscritti nel frontmatter usando solo quegli slug.
  Una sola fonte: niente tabella di alias nel codice.
- Topic scelti (9): Jetpack Compose, Architecture, Performance, Security, Data & storage,
  Navigation, Background & async, Testing, AI on Android. Un tag sconosciuto fa fallire la build.
- Rotte: `/android/topics` (indice con conteggi) e `/android/topics/[slug]` (statiche).
- I tag nella pagina articolo diventano link al topic. Nella lista restano testo (la scheda è già un link):
  al loro posto, una riga di filtri per topic su `/android` e sulle pagine topic.
- Aggiungere le rotte a `app/sitemap.ts`.

### 3. Feed RSS
- `app/rss.xml/route.ts`, statico (`dynamic = "force-static"`), RSS 2.0 con tutti gli articoli
  (titolo, link, data, descrizione; niente testo completo).
- `<link rel="alternate" type="application/rss+xml">` direttamente nel `<head>` di `app/layout.tsx`:
  con `metadata.alternates.types` le pagine che hanno un proprio `alternates` lo perderebbero.
- Footer unico `app/components/SiteFooter.tsx` su tutte le pagine (prima c'era solo in home):
  copyright, About, Topics, RSS; a destra le icone di GitHub, LinkedIn e X
  (Bootstrap Icons, inline: lucide-react v1 non ha icone dei brand).
  Tolti dall'header i link testuali GitHub, LinkedIn e X: stanno solo nel footer.
- URL base da `lib/site.ts` (oggi `sitemap.ts` ripete l'URL: segnalato, non corretto in questo piano).

### 4. Pagina About
- Nuova `app/about/page.tsx`; in home resta un estratto con link "More about me".
- Sezioni: chi sono; esperienza (insegnamento incluso); formazione; competenze; interessi.
- Dati della timeline in `lib/about.ts` (una sola fonte).
- Aggiungere `/about` a sitemap e header; JSON-LD `ProfilePage`.
- Revisione (2026-10-12): esperienza snella, la storia completa resta su LinkedIn.
  Una riga per ruolo (periodo · ruolo · azienda); solo Synapses ha una frase, fedele a LinkedIn:
  "Lead Android development", e una sola Android SDK con 20+ versioni (non 20 SDK).
  Synapses ha anche un breve elenco di punti presi da LinkedIn (sicurezza, stabilità, offline,
  architettura, localizzazione, Flutter). Tolti i numeri non verificati (+20% iscrizioni, -60% rete, -15%).
  L'insegnamento va nella stessa lista. Il Medium esce. Link "Full history on LinkedIn".
  Certificazioni: tolte per ora.
- Education: le due lauree in Informatica (Università di Catania), stessa forma a righe, senza voto;
  il liceo resta solo su LinkedIn.
- Niente ripetizioni: BlueGPS è descritto una volta sola, nell'intro.
- Revisione finale (2026-10-12): esperienza ordinata per anno di inizio; Synapses con 4 punti
  (tolti crash rate 0,01%, non verificato, e tracciamento, già nell'intro); Skills senza le voci già
  nei punti; ViaMetric fuori dagli Interessi (sta in home); sezione "Get in touch" (LinkedIn);
  foto nell'intro; `alumniOf` nel JSON-LD.

### 5. Documentazione
- Nessun file descrive le rotte (il README è quello di create-next-app): aggiornato solo `public/llms.txt`.

## Verifica
- `npm run lint` e `npm run build` senza errori.
- Controllo nel browser: favicon nella tab, `/android/topics`, `/rss.xml` valido, `/about`.

## Fuori da questo piano
- Pagine `/uses` e `/now`, sezione pubblicazioni.
