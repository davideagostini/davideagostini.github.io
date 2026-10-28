# Piano: Kotlin Multiplatform tolto dalle competenze del sito

Stato: fatto e pubblicato (2026-10-28).

## Perché

Davide non ha progetti Kotlin Multiplatform. Nel CV KMP è uscito dalle Skill e dal titolo
ed è nel Summary come "Open to … projects that use AI or Kotlin Multiplatform" (2026-10-28).
Il sito si allinea: KMP non si dichiara come competenza.

## Modifiche

- `lib/about.ts`: "Kotlin Multiplatform" esce dal gruppo Android delle skill.
- `lib/site.ts`:
  - `description`: "Senior Android Engineer working with Kotlin and Jetpack Compose. …".
  - `knowsAbout`: tolti "Kotlin Multiplatform" e "Compose Multiplatform" (dichiara competenza).
  - `keywords`: invariate. Servono alla ricerca e non dichiarano esperienza (scelta di Davide).
- `app/components/SiteHeader.tsx`: "By day I work on Android with Kotlin and Jetpack Compose."
- `public/llms.txt`: intro come la `description`; tolti KMP e Compose Multiplatform dai Topics
  (il sito non ha contenuti su KMP).

## Fuori dal piano

- Nessuna frase "Open to …" nella pagina About: Davide non l'ha chiesta.
- `content/android/_topics-pipeline.md` ("KMP-ready architecture boundaries") resta: è un'idea
  di articolo, non una competenza dichiarata.
- `docs/PLAN-refresh.md` resta: è lo storico di una decisione, e le keyword sono invariate.
