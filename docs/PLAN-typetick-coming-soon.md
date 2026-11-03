# Piano: TypeTick tra le app (coming soon)

Stato: fatto, non committato, su `main` (2026-11-03)

Fonti: `https://typetick.app` (letto il 2026-11-03) e il progetto locale `../typetick`.
L'app è in pubblicazione su Google Play; modello Free + Pro (detto da Davide).

## 1. Scheda in `lib/apps.ts`

Nuova voce dopo Tuttodì (le app Android insieme, in ordine di uscita):

- `slug: "typetick"`, `name: "TypeTick"`, `platform: "Android"`, `category: "Productivity"`.
- `tagline`: "Type it. It starts." (dal sito).
- `description`: timer Android che parte scrivendo la durata come la diresti ("5 min",
  "until 17:30", "pomodoro"), in inglese e italiano.
- `details`: due paragrafi: (1) notifica con controlli, pillola fluttuante sopra le altre app,
  allarme che suona anche in Doze o dopo un riavvio; (2) tutto sul telefono: niente account,
  niente pubblicità, niente analytics, nessun permesso internet.
- `price: "Free + Pro"`, `status: "coming-soon"` (compare il chip "Coming soon").
- `availability`: "Coming soon to Google Play, for Android 8.0 or later, in English and Italian.
  Free to use, with an optional Pro upgrade."
- `links`: solo `Website` → `https://typetick.app/` (Google Play si aggiunge all'uscita).
- `highlights`: dal sito (input in linguaggio naturale, +5, Pomodoro e cronometro, pillola
  fluttuante, Live Update su Android 16, notifica con controlli, allarme affidabile, recenti e
  preferiti con colori, schermo intero, privacy).
- `faq`: "Is TypeTick free?" → free + Pro opzionale, **senza elencare cosa sblocca Pro**;
  "Does it run with the app closed?"; "Where do my timers go?" (dal sito).
- `accent: "#2563eb"` (il blu del sito TypeTick).

## 2. Immagini

- Icona: `../typetick/store/icon-512.png` → `public/assets/apps/typetick.png` (512×512, come Tuttodì).
- Screenshot: i primi 4 del Play Store, da `../typetick/store/en/` (01-type, 02-pill,
  03-notification, 04-pomodoro, già 1080×1920) → `public/assets/apps/typetick/*.webp` a 540×960
  con `cwebp`, come quelli di Tuttodì. Correzione di Davide (2026-11-03): le immagini sono quelle
  dello store, non le catture del sito ritagliate.

## 3. Testi che elencano le app (un fatto, ogni posto che lo ripete)

- `lib/site.ts` (description), `app/components/SiteHeader.tsx`, `app/apps/page.tsx`
  (3 description), `app/opengraph-image.tsx`, `public/llms.txt` (riga 3, elenco app, elenco siti):
  "Dunio, Tuttodì, TypeTick and Eye Break". In `llms.txt` TypeTick è "Coming soon to Google Play".

## 4. Link della card

Decisione di Davide (2026-11-03): la card di TypeTick dice "More about TypeTick" come Dunio e
Tuttodì. In `app/components/AppShowcase.tsx` il testo "Take a look" per le app coming soon è
tolto: ogni card dice "More about <nome>".

## Verifica

`npm run build` e controllo in locale di `/apps` e `/apps/typetick`.

## Fuori scope

- Cosa sblocca Pro e se è abbonamento o acquisto unico: `../typetick/docs/PLAN.md` parla di
  abbonamento, `PLAY-STORE.md` dice "acquisti in-app: no (per ora)". Non lo scrivo finché non è deciso.
- Link Google Play e `status: "available"`: all'uscita sullo store.
- Gli altri file non tracciati (articolo TV launcher e il suo piano) restano come sono.

## Branch

Nessun branch: Davide ha chiesto di lavorare su `main` (2026-11-03).
