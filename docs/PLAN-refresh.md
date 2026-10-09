# Piano: refresh del sito (stile, parole chiave, Tuttodì)

Stato: fatto, pubblicato su `main` (2026-10-09)

## Obiettivo

1. Posizionamento: Android engineer che pubblica le proprie app (Dunio, Tuttodì, Eye Break).
2. Aggiungere Tuttodì e aggiornare Dunio.
3. Restyling vero: le app al centro della home, con icone e screenshot.

## Decisioni prese

- Il piano vive in questo file.
- Tuttodì non è ancora su Google Play (`PUBLISHED = false` nel suo repo): scheda completa,
  badge "Coming soon", link a tuttodi.app, nessun link Play finché non esce.
- Posizionamento "Android dev + indie maker".
- Restyling vero, non ritocco.
- Ruolo: **Senior Android Developer**, ovunque (anche nell'About, che oggi dice "Lead").
- Notyze e Tintracker restano in home, ma a basso risalto.

## Passi

### 1. Una sola fonte per identità e parole chiave
- Nuovo `lib/site.ts`: ruolo, descrizione breve, keywords, profili social.
- `app/layout.tsx` (metadata, JSON-LD Person/WebSite) e `SiteHeader` leggono da lì.
  Oggi la stessa descrizione è ripetuta in 5 punti e con ruoli diversi (Senior / Lead).
- Keywords nuove: Android, Kotlin, Jetpack Compose, Kotlin Multiplatform, Android architecture,
  indie Android apps, shared household finance app, daily notes app, local-first, Wear OS,
  macOS menu bar app. Tolte quelle di nicchia senza contenuto dietro (StrongBox, TEE).

### 2. Dati delle app (`lib/apps.ts`)
- Campo nuovo `status: "available" | "coming-soon"` e `screenshots: string[]`.
- **Tuttodì**: testi presi dal sito tuttodi.app (en), icona da
  `tuttodi/app/src/main/ic_launcher-playstore.png`, 3–4 screenshot da `tuttodi/store/en`.
- **Dunio**: release 1.0, Wear OS quick entry, widget, 11 lingue; 3–4 screenshot da
  `dunio/store/en`.
- Screenshot convertiti in WebP ridimensionati (gli originali sono PNG a piena risoluzione).
- Ordine: Dunio, Tuttodì, Eye Break.

### 3. Restyling
- **Home**: hero nuovo (ruolo + indie maker), poi sezione "Apps" con card grandi
  (icona, nome, tagline, piattaforma, stato, screenshot), poi "Writing", "Open source", "About".
- **Selected Work** diventa "Open source & experiments": Android Build Analyzer, ViaMetric,
  Translate AI. Sotto, una riga compatta "Older projects" con Notyze e Tintracker
  (solo nome, tag e link, senza descrizione lunga).
- **`/apps/[slug]`**: galleria screenshot orizzontale, badge di stato, link principali in alto.
- **Stile**: colore d'accento per app, gerarchia tipografica più marcata, card con bordo e
  hover, controllo dark mode e larghezza mobile. Nessuna nuova dipendenza.
- `/android` e i post: solo l'header condiviso cambia, il resto resta com'è.

### 4. SEO e discovery
- JSON-LD: `ItemList` della home con le app vere; `SoftwareApplication` completo per ogni
  pagina app (con `offers` gratis, `operatingSystem`, `downloadUrl` dove esiste).
- `app/sitemap.ts`: include Tuttodì (già generato da `apps`, da verificare).
- `public/llms.txt`: aggiunte Tuttodì, testi allineati a `lib/apps.ts`.
- OG image della home aggiornata col nuovo posizionamento.

### 5. Verifica
- `npm run lint`, `npm run build`, `npm run check:og`.
- Controllo visivo nel browser: home, `/apps`, le tre pagine app, un post; chiaro/scuro,
  desktop e mobile.

## Domande aperte
- ViaMetric: tengo il tono "failure" nell'About?
- Il README è quello di default di Next.js: lo trasformo nel documento di riferimento del
  progetto? (Fuori da questo piano finché non dici sì.)

## Fuori scope
- Contenuto dei post, pagina `/android`, nuove dipendenze, deploy.

## Esito

Fatto: passi 1–4, lint e build verdi, controllo visivo in chiaro su desktop e mobile (390px,
niente scroll orizzontale).

Scostamenti dal piano:
- `npm run check:og` non eseguito: interroga il sito in produzione, non il locale.
- Dark mode non verificata a vista: il browser di test non permette di forzarla.
- Eye Break non ha screenshot (nessun materiale disponibile): la card mostra l'icona grande.
- ViaMetric: testo dell'About lasciato com'era, la domanda resta aperta.
- Le card delle app hanno sostituito anche la griglia di `/apps` (stesso componente della home).
