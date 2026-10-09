# Piano: articolo su EmbeddingGemma 2 in Tuttodì

Stato: fatto, pubblicato su `main` (2026-10-09)

## Obiettivo

Un nuovo post in `/android`, in inglese come gli altri, che racconta tutto il processo
dell'esplorazione sul branch `explore/embeddinggemma-2` di Tuttodì (commit `4e9648f`,
2026-10-07). Il lettore conosce Android in modo superficiale e non sa cosa sia un embedding.

L'esperimento è **multimodale**: testo, note vocali e foto nello stesso spazio. Titolo,
descrizione e apertura lo dicono subito; testo, audio e foto hanno ciascuno la sua sezione.

## Fonti (solo queste, niente numeri inventati)

- `docs/ISSUE-semantic-search.md` sul branch: perché, come, risultati, tabella riassuntiva.
- `docs/semantic-search-benchmark.png`: l'immagine riassuntiva, già in inglese.
- Il codice in `app/src/semantic/` per gli snippet (`SemanticEngine`, `SemanticIndex`,
  `SemanticIndexWorker`), semplificati e commentati.
- Le tre fonti esterne elencate nel documento (blog Google, Google Developers, MarkTechPost).

## File

- `content/android/2026-10-09-on-device-semantic-search-embeddinggemma-2-android.md`
  (data e slug da confermare).
- `public/assets/android/embeddinggemma-2/benchmark.webp`: l'immagine del branch, convertita.
- Nessun cambio al codice del sito, salvo che serva per mostrare l'immagine o le tabelle.

## Struttura dell'articolo

1. **Il problema**: la ricerca per parole (FTS) non trova "palestra" cercando "allenamento",
   né una nota vocale o una foto per quello che contiene.
2. **Embedding spiegati semplici**: la mappa dei punti, la somiglianza, Matryoshka (768 →
   256). Un glossario breve (modello, LiteRT-LM, vettore, indicizzare, CPU/GPU, WorkManager).
3. **Il setup**: una variante Gradle separata (`semantic`), il modello fuori dall'APK con
   `adb push`, la schermata "Lab". Perché così: non tocca l'app pubblicata.
4. **Passo 1, testo**: caricare il motore, indicizzare in background con WorkManager,
   cercare con il prodotto scalare. Snippet commentati. Risultati CPU vs GPU, 768 vs 256,
   esempi in italiano tradotti.
5. **Passo 2, foto e note vocali**: il modello completo, WAV 16 kHz mono, la domanda che
   decideva tutto (le parole dette). Risultati.
6. **La prova di carico**: 100 note vocali e 1000 foto, il rallentamento in background, Android
   che ferma il lavoro dopo ~10 minuti, il bug trovato e corretto (`isStopped`), la ripresa.
7. **Passo 3, ottimizzazioni**: cosa non ha funzionato (batch, thread, miniature) e cosa sì
   (70 riquadri, non ricalcolare le righe uguali). Confronto con Google AI Edge Gallery.
8. **Due problemi di build**: Hilt e Kotlin 2.4, regole R8 per il codice nativo.
9. **Telefoni potenti e telefoni vecchi**: soglie di RAM, prova breve all'attivazione,
   Play Asset Delivery.
10. **Cosa ho imparato** + limiti onesti (un telefono, voci sintetiche, foto derivate da tre).
11. **Riferimenti**.

Stile: come gli altri post (titoli numerati, box "Key Takeaway", codice commentato), ma con
spiegazioni più lente e un esempio concreto per ogni concetto.

## Verifica

- `npm run lint`, `npm run build`, controllo visivo del post nell'anteprima locale
  (tabelle, immagine, codice, mobile).

## Decisioni (2026-10-09)

- Pubblico, presentato come **esperimento**, non come funzione in arrivo.
- Data 2026-10-09.
- Modello solo testo: "157 MB" come nell'immagine (164.626.432 byte).
- Le tabelle si scrivono in HTML: la pipeline Markdown del sito non ha GFM, quindi le
  tabelle Markdown non verrebbero rese.

## Fuori scope

- Modifiche al branch o al codice di Tuttodì.
- L'hub dei corsi: scartato, le lezioni sono in italiano.

## Esito

Fatto: post `content/android/2026-10-09-on-device-multimodal-search-embeddinggemma-2-android.md`,
immagine `public/assets/android/embeddinggemma-2/benchmark.webp`. Lint e build verdi; 8 tabelle
e immagine controllate nel browser, niente scroll orizzontale su mobile.

Scostamenti dal piano:
- Struttura: "Telefoni potenti e vecchi" e "Cosa ho imparato" restano sezioni 10 e 11, i
  limiti stanno dentro la 11.
- Le frasi delle note vocali e le domande sono tradotte in inglese, con una nota che dice che
  gli originali erano in italiano.
- Tabelle in HTML (vedi Decisioni). Nessun cambio al codice del sito.
