# Analisi del riferimento e ricostruzione originale

Data: 9 novembre 2026. Richiesta: analizzare il video indicato e costruire il primo capitolo giocabile cambiando stile e storia, in italiano.

## Fonte e perimetro

[The House of Da Vinci | Complete Gameplay Walkthrough - Full Game | No Commentary — Adventure Vault](https://www.youtube.com/watch?v=ndrXJBAHLbI).

La pagina YouTube aperta direttamente nel browser identifica titolo e canale e mostra una durata di 2:20:33. La verifica riguarda campioni dell’apertura, non l’intera partita. È un’analisi comportamentale e visiva da registrazione, non una decompilazione.

La skill `reverse-engineer-anything` è stata letta e applicata per separare osservazioni, deduzioni e scelte implementative. In questa sessione non erano disponibili né strumenti MCP REA né un comando `rea` installato. Il materiale fornito è un video, non un eseguibile: non è stato installato un motore di analisi binaria e non sono stati generati o inventati Evidence ID REA.

## Registro delle osservazioni

| Riferimento locale | Fonte osservata | Fatto visibile | Limite |
|---|---|---|---|
| OBS-01 | Pagina YouTube, titolo e controlli | Il video è un walkthrough di The House of Da Vinci, canale Adventure Vault, durata 2:20:33. | Metadati della pagina, non identificazione del codice del gioco. |
| OBS-02 | Fotogramma a 2:17 | Primo piano di un oggetto ligneo con serratura e parti metalliche; elementi dell’inventario a sinistra e testo tutorial sull’uso della chiave. | Un fotogramma non documenta tutti i gesti o gli stati intermedi. |
| OBS-03 | Fotogramma a 4:45 | Interno storico con vetrata, leggio con foglio, porta, oggetto circolare laterale e inventario. | Architettura, materiali e composizione visibili; regole interne non accessibili. |

I riferimenti OBS sono etichette di questo documento, non record REA. La registrazione è stata aperta con il browser e campionata tramite i controlli di YouTube.

## Risultato automatico scartato

È stata richiesta anche l’analisi video al connettore Higgsfield, job `ef6ab1f9-77cf-4b0b-afbf-00a21052f898`. Il risultato descrive uno spot di 26 secondi su una macchina da espresso: è in contrasto con titolo, durata e fotogrammi verificati. Non è stato usato come evidenza né per progettare il gioco.

## Deduzioni delimitate

Dai campioni è ragionevole usare come riferimento un ciclo di esplorazione ravvicinata, lettura di indizi, raccolta di oggetti e azionamento di serrature o meccanismi. Non si può dedurre dal materiale osservato il codice, il motore, la fisica, la struttura di salvataggio o l’intero grafo degli enigmi del gioco originale.

## Trasformazione creativa implementata

| Aspetto | Nuova implementazione |
|---|---|
| Storia | Nora cerca il fratello Elia in un osservatorio costiero nel 1912. |
| Identità visiva | Diorama 3D con pietra marina, rame ossidato, luce lunare e dettagli nautici. |
| Enigmi | Filastrocca numerica 3-1-4; orientamento di tre prismi O-E-S; allineamento delle orbite Faro-Onda-Luna. |
| Oggetto rivelatore | Lente di marea che svela una nuova incisione narrativa. |
| Finale | Il faro si riaccende, un sigillo apre l’archivio e la registrazione di Elia rivela una minaccia. |
| Realizzazione | Codice scritto da zero, modelli e texture procedurali, font locali, audio Web Audio sintetizzato. |

Questi sono elementi di progetto originali, non fatti attribuiti al video. Nessun modello, texture, testo narrativo, musica o codice del gioco di riferimento è stato estratto o riutilizzato.

## Checklist finale

- Identificare il riferimento: risolto tramite pagina e fotogrammi.
- Ricostruire il ciclo d’interazione dell’apertura: parziale, limitato ai campioni indicati.
- Recuperare il codice del gioco originale: non disponibile e non necessario alla nuova implementazione.
- Cambiare stile, storia e testi: realizzato.
- Costruire un primo capitolo con inizio e fine: realizzato.
- Verificare progressione, ripristino e percorso giocabile: test logici e browser disponibili nella cartella `tests`.

## Skill applicate

`reverse-engineer-anything`: metodo basato su evidenze e distinzione dei limiti. `game-design-skill`: percorso critico, condizioni di sblocco e verifica del prototipo, adattati alla richiesta di un capitolo finito. `frontend-design`: identità visiva, gerarchia, stati e critica attraverso schermate. `studio-threejs-fundamentals`: ciclo di rendering, ridimensionamento e rilascio delle risorse. `playwright-cli`: procedure di verifica browser, applicate attraverso l’API Playwright e il controllo browser disponibile.

Fonti tecniche consultate: [Three.js](https://threejs.org/docs/) e [Vite](https://vite.dev/guide/). Nessuna affermazione sulla gradevolezza o sulla durata è stata validata con giocatori esterni.
