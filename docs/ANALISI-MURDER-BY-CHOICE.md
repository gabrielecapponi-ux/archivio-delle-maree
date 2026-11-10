# Ricerca di oggetti e investigazione — revisione 4.0

9 novembre 2026. Richiesta: introdurre oggetti da trovare, raccolta, combinazioni ed enigmi ispirati a giochi come *Murder by Choice*, unendo gli elementi interattivi della prima versione agli ambienti della revisione cinematografica. La grafia «Murder Coiche» è stata interpretata come *Murder by Choice*.

## Metodo e limiti

È un’analisi del funzionamento descritto da fonti pubbliche, tradotta in un’implementazione originale. Non sono stati forniti eseguibili o un’installazione del gioco commerciale. REA non era disponibile nella sessione; non sono stati effettuati disassemblaggio, decompilazione, estrazione di risorse, intercettazione del traffico o accesso al codice originale. Non è stata condotta una partita del riferimento e non sono stati misurati difficoltà o tempi di completamento. Le quantità, le ricette e i controlli qui sotto sono scelte di progetto per Nora, non dettagli attribuiti al gioco Nordcurrent.

## Fonti primarie e ciò che sostengono

- [Nordcurrent — Murder by Choice](https://nordcurrent.com/games/murder-by-choice/): investigazione, ricerca di oggetti nascosti, esplorazione, interazione con personaggi, minigiochi e scelte narrative.
- [Scheda ufficiale Google Play, editore Nordcurrent](https://play.google.com/store/apps/details?id=com.nordcurrent.murderisland&hl=it): la ricerca di indizi e oggetti è integrata con il mistero, gli enigmi e le scelte del giocatore.
- [Nordcurrent — Murder in the Alps](https://nordcurrent.com/games/murder-in-the-alps/): ulteriore riferimento dello stesso editore per avventura narrativa, ambienti da esplorare, oggetti nascosti e minigiochi.

Le pagine sostengono il ciclo generale. Non stabiliscono che il riferimento richieda sei oggetti per scena, ricette di due componenti o ispezioni 3D: questi sono elementi originali di questa revisione.

## Traduzione nel gioco di Nora

| Funzione | Implementazione |
| --- | --- |
| Cercare attivamente nella scena | Quattro ricerche con sei oggetti ciascuna; oggetti cliccabili senza etichette permanenti, elenco dei nomi, ingrandimento e spostamento della scena. |
| Esplorare prima di raccogliere | Un astuccio apribile in ogni ricerca nasconde un componente; l’oggetto non è raccoglibile finché il coperchio è chiuso. |
| Collegare ricerca ed enigmi | Due componenti diventano un utensile. Il dispositivo resta bloccato finché Nora lo monta. |
| Rendere gli oggetti significativi | Sedici prove narrative vengono annotate nel taccuino, con tracce di Elia e del passato di Ada. |
| Recuperare la manipolazione della prima versione | Chiave, manovella, valvola e bobina sono modelli 3D ruotabili e ingrandibili nell’inventario. |
| Conservare l’ultima direzione visiva | Quattro ambienti cinematografici, materiali d’epoca, luce marina, interfaccia ai margini e meccanismi in primo piano. |
| Accompagnare senza penalizzare | Indizio che raggiunge l’oggetto fuori campo, salvataggio parziale, nessuna perdita per abbinamenti o utilizzi sbagliati. |
| Mantenere la scelta narrativa | I due finali già presenti decidono il destino delle voci dell’archivio. Non sono stati aggiunti dialoghi ramificati con nuovi personaggi. |

## Quattro nuove sequenze

1. **I segreti dello scrittoio.** Asta e pettine della chiave, bussola, orologio, penna di airone e sigillo. Nora ricompone la chiave e la usa sul cofanetto, dopo aver letto la lettera. L’orologio e la cera suggeriscono che qualcuno ha preceduto il suo arrivo.
2. **Il banco della custode.** Braccio e impugnatura della manovella, calibro, ruota dentata, oliatore e medaglia. Il diario di Ada permette di montare la manovella sul regolatore. La dedica sulla medaglia lega la riparazione al ritorno di Nora.
3. **Le tracce sotto l’acqua.** Corona e mozzo della valvola, conchiglia, ampolla, ancora e targhetta. Dopo il registro, Nora ricostruisce la valvola e riattiva le pompe per affrontare l’enigma dei travasi.
4. **Gli oggetti che ricordano.** Nucleo e cappuccio della bobina, fotografia, nastro, diapason e medaglione. Una volta stabilizzata la pressione, la bobina restaurata si monta nel fonografo e sblocca la ricomposizione della voce.

Il ciclo è: **esplora → trova sei tracce → combina due componenti → esamina l’utensile → usalo sul dispositivo → risolvi l’enigma → prosegui nella storia**. Le diciotto scoperte principali rimangono; le ricerche aggiungono passaggi necessari senza alterare il conteggio dei capitoli. La ricerca non rimuove eventuali oggetti decorativi simili presenti nei fondali prerenderizzati: i ventiquattro raccoglibili sono livelli interattivi separati.

## Affidabilità e compatibilità

Lo stato distingue oggetti trovati, contenitori aperti, utensili ricomposti e utensili montati. Ricette e uso verificano capitolo, stanza, componenti e prerequisiti. Un errore non consuma nulla. La voce narrativa «Cilindro di Elia» ha un’identità distinta dalla bobina utilizzabile, per evitare collisioni nell’inventario.

I salvataggi precedenti mantengono i meccanismi già superati: la migrazione considera già completata la ricerca associata. Per vivere tutte le nuove sequenze di un vecchio salvataggio completato si può ricominciare il singolo capitolo. Oggetti e astucci delle ricerche nuove vengono conservati anche dopo una chiusura a metà.

Tutte le azioni restano disponibili senza WebGL; solo l’anteprima tridimensionale viene sostituita da un messaggio. Modelli, illustrazioni, font e fondali sono locali e inclusi nel file autonomo. Non vengono chiamati servizi esterni durante il gioco.

Verifiche: 39 test logici e 14 percorsi browser in Chrome, compresi entrambi i finali, mobile a 390×844, tastiera, ripresa delle ricerche, uso errato e file offline. L’automazione verifica il funzionamento e non sostituisce una prova di difficoltà con giocatori. Schermate delle quattro ricerche e delle ispezioni sono in `artifacts/`.
