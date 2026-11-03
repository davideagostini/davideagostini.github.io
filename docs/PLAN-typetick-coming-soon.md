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
- Screenshot: 4 da `../typetick/website/src/assets/screens/en/` (01-type, 02-pill,
  04-pomodoro, 08-until) → `public/assets/apps/typetick/*.webp` a 540×960, come quelli di Tuttodì.
  Gli originali sono 1080×2340: il layout del sito forza 9:16 e li deformava, quindi sono
  ritagliati a 1080×1920 da y=150 (via status bar e barra di navigazione) con `ffmpeg`, poi `cwebp`.
  03-notification escluso: è un'immagine orizzontale (1080×530).

## 3. Testi che elencano le app (un fatto, ogni posto che lo ripete)

- `lib/site.ts` (description), `app/components/SiteHeader.tsx`, `app/apps/page.tsx`
  (3 description), `app/opengraph-image.tsx`, `public/llms.txt` (riga 3, elenco app, elenco siti):
  "Dunio, Tuttodì, TypeTick and Eye Break". In `llms.txt` TypeTick è "Coming soon to Google Play".

## Verifica

`npm run build` e controllo in locale di `/apps` e `/apps/typetick`.

## Fuori scope

- Cosa sblocca Pro e se è abbonamento o acquisto unico: `../typetick/docs/PLAN.md` parla di
  abbonamento, `PLAY-STORE.md` dice "acquisti in-app: no (per ora)". Non lo scrivo finché non è deciso.
- Link Google Play e `status: "available"`: all'uscita sullo store.
- Gli altri file non tracciati (articolo TV launcher e il suo piano) restano come sono.

## Branch

Nessun branch: Davide ha chiesto di lavorare su `main` (2026-11-03).
