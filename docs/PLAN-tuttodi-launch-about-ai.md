# Piano: Tuttodì pubblicata + About con Design System e AI

Stato: fatto, non committato, su `main` per scelta di Davide (2026-10-26)

## 1. Tuttodì disponibile su Google Play

Link verificato (HTTP 200): `https://play.google.com/store/apps/details?id=com.davideagostini.tuttodi`

- `lib/apps.ts` (Tuttodì):
  - `status: "available"` (sparisce il chip "Coming soon" in `AppShowcase`).
  - `availability`: "Available on Android through Google Play, for Android 8.0 or later, in 11 languages. Free to use; Tuttodì Pro is an optional one-time purchase, no subscription."
  - `links`: Google Play prima di Website, come Dunio (la pagina `/apps/[slug]` lo trova da sola).
  - FAQ "When is it available?": rimossa (non ha più senso) oppure → "Where can I get it?" con link a Google Play.
- `public/llms.txt` riga 16: togliere "Coming soon to Google Play", scrivere "Available on Google Play".
- Fuori scope: l'articolo EmbeddingGemma dice che l'esperimento non è in produzione; resta vero.

## 2. About: Design System e AI

Fatti già presenti: design system Compose condiviso tra team (Synapses), on-device AI (LiteRT),
App Functions, articoli su EmbeddingGemma e sul launcher Android TV con agente AI.

Decisione (2026-10-26): solo "Design systems" e "AI", senza nominare strumenti specifici.

- Intro About: un paragrafo nuovo, senza nomi di strumenti: "Lately my work leans on two things:
  design systems that several teams build on, and AI, both running on the device and as part of
  how I build software every day."
- `skills` in `lib/about.ts`: nuovo gruppo **Design systems & AI** con le voci
  "Design systems", "AI-assisted development", "On-device AI", "App Functions".
  "On-device AI (LiteRT)" e "App Functions" escono da "Beyond Android" (un fatto, un posto).
- `lib/site.ts`: `knowsAbout` e `keywords` + "Design systems", "AI".
- Fuori scope: `site.description`, tagline, home, OG image e `llms.txt` (descrizione) restano come sono.

## Branch
Nessun branch: Davide ha chiesto di lavorare direttamente su `main` (2026-10-26).
