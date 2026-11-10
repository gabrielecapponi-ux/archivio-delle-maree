# L’Archivio delle Maree

Un’avventura enigmistica originale in italiano, con **due capitoli giocabili, quattro ambienti, diciotto scoperte principali, ventiquattro oggetti da cercare e quattro deduzioni giocabili**.

## Gioca

[Apri il gioco su GitHub Pages](https://gabrielecapponi-ux.github.io/archivio-delle-maree/).

**Su iPhone:** apri il link in Safari, tocca Condividi → Aggiungi alla schermata Home e, se presente, attiva «Apri come app web». Avvia dall’icona **Le Maree** e tieni il telefono in verticale. I comandi rispettano fotocamera e barra Home. Nel menu, attendi «Pronto anche senza connessione» prima di giocare offline. Il primo caricamento richiede una connessione; il Mac può essere spento.

Il gioco usa la densità nativa del display per testo, illustrazioni vettoriali e oggetti 3D. Il limite del rendering è un fotogramma 4K; verificati anche i formati verticali 1080×1920 e 2160×3840. La versione 5 aggiunge quattro fondali verticali nativi da **2160×3840 pixel**. Le immagini originali PNG sono conservate in `src/assets/4k/`; le copie WebP caricate dal gioco hanno le stesse dimensioni, senza ingrandimenti artificiali. In orizzontale restano le precedenti vedute da 1672×941. Il browser adatta le immagini alla risoluzione fisica del dispositivo. I progressi sono salvati sul singolo dispositivo/browser; non c’è sincronizzazione fra Mac e iPhone. La disponibilità della copia offline dipende dallo spazio conservato dal browser.

Apri `dist/GIOCA.html` nel browser. Il gioco completo, i font, la grafica e i suoni sono inclusi: funziona senza connessione e senza installazione.

Durante lo sviluppo:

- Capitolo I: http://localhost:5173/#capitolo-1
- Capitolo II: http://localhost:5173/#capitolo-2

Il menu «Scegli un capitolo» permette di iniziare dal secondo capitolo, con un breve riepilogo, oppure proseguire direttamente dal finale del primo.

## La storia

**I — Il respiro della luce.** Nora Valenti torna nell’osservatorio di Vespera per cercare il fratello Elia. Dopo la sala delle maree, esplora l’officina astronomica di Ada: ripara il regolatore, ricostruisce una costellazione e calcola la marea per scendere sotto la scogliera.

**II — I nomi che il mare ricorda.** Nell’Archivio Sommerso, Nora scopre il passato della madre Ada e il destino di Elia. Travasi, carillon e mosaico aprono la camera dei ricordi. Nora deve poi riordinare gli schedari, stabilizzare la pressione, ricomporre una voce e aprire la campana di Elia prima della scelta con due finali. Una nota segreta approfondisce la storia.

## Comandi e comfort

- **Cerca oggetti** apre la ricerca della stanza: trova le sei tracce nell’immagine, apri l’astuccio e usa ingrandimento o indizio se necessario. Sul telefono puoi trascinare la scena.
- I componenti finiscono nell’inventario. Aprine uno e scegli **Combina con un altro pezzo**. Dopo aver completato la ricerca puoi ricostruire l’utensile e ispezionarlo in 3D, trascinando o usando le frecce e lo zoom.
- Scegli **Usa nella stanza**, poi tocca il meccanismo giusto, anche dalla mappa. Una scelta sbagliata conserva l’oggetto. Le altre prove vengono annotate nel taccuino con i ricordi di Nora, Elia e Ada.
- Clicca o tocca gli indicatori sugli oggetti. «Oggetti» mostra i nomi; «Mappa» raccoglie tutte le destinazioni accessibili.
- Sui dispositivi stretti trascina la scena per esplorarne i lati. L’inquadratura si avvicina quando esamini un oggetto. La freccia sul lato destro cambia stanza quando il passaggio è sbloccato.
- Nel **Taccuino**, dopo ogni ricerca completa, collega due prove per risolvere una deduzione. Le quattro piste approfondiscono Ada, Elia e il ritorno di Nora. Puoi sbagliare senza perdere oggetti. La mappa illustrata mostra la posizione corrente e i passaggi accessibili.
- **T** apre il taccuino; **L** attiva la lente; **Esc** chiude i dettagli.
- **Tab / Maiusc+Tab / Invio** per la tastiera. Nei controlli di volume usa le frecce.
- Il pulsante con l’altoparlante attiva l’audio; inizialmente è spento. Il carillon include immagini e trascrizione, quindi l’udito non è necessario.
- Il menu regola volume, qualità grafica e movimento decorativo. Il pulsante schermo intero apre lo schermo intero quando supportato.
- Gli indizi sono progressivi, senza penalità. Non ci sono scadenze o stati di morte.

I due capitoli conservano i propri progressi, inclusi oggetti trovati e astucci aperti nelle ricerche incomplete. I vecchi salvataggi vengono importati automaticamente: i meccanismi già superati conservano i propri utensili come montati. «Ricomincia questo capitolo» azzera soltanto il capitolo attivo, dopo conferma. Impostazioni e progressi dell’altro rimangono. Per giocare tutte le nuove ricerche di un capitolo già completato scegli «Ricomincia questo capitolo».

Salvataggi e preferenze sono locali al browser e all’indirizzo. `localhost`, `127.0.0.1` e il file sul disco possono avere salvataggi diversi. Se il browser impedisce il salvataggio compare un avviso e si può comunque giocare.

## Realizzazione e verifiche

Quattro nuove composizioni verticali generate con GPT Image 2.6 su Higgsfield, oltre alle precedenti vedute orizzontali create con imagegen, con pietra, noce e ottone invecchiato, luce marina e lampade d’epoca. La presentazione unisce **ambienti 2.5D e utensili realmente tridimensionali**: fondali prerenderizzati, oggetti originali disegnati in SVG, ingrandimenti, particelle, primi piani interattivi e ispezione Three.js dei quattro utensili ricomposti. Non è un ambiente 3D a movimento libero. Se WebGL non è disponibile, raccolta, combinazioni e uso continuano a funzionare. Audio originale sintetizzato. Nessun asset è stato estratto dal video o dai giochi di riferimento.

La revisione riprende il ciclo di ricerca, investigazione e minigiochi descritto pubblicamente da Nordcurrent per *Murder by Choice*. L’analisi e la traduzione in meccaniche originali sono in `docs/ANALISI-MURDER-BY-CHOICE.md`; non si tratta di decompilazione del gioco commerciale.

La modalità «Leggera» disattiva particelle e luce decorativa. La riduzione dei movimenti rispetta anche le preferenze di sistema. Il file autonomo contiene immagini, font e suoni.

Sono disponibili 44 test logici, 16 prove browser in Chrome e 9 verifiche aggiuntive: i due capitoli completi con WebKit in emulazione iPhone, touch e spazi sicuri, formato verticale Full HD/4K e ripresa della ricerca offline dal sito. Sono prove automatizzate su Mac, non su un iPhone fisico. Le verifiche controllano il funzionamento, non promettono un numero di fotogrammi al secondo sui diversi telefoni.

```sh
npm install
npm run dev
npm test
npm run build
npm run test:browser
```

Le prove browser richiedono Chrome installato e il server sulla porta 5173. La build produce il sito e il file autonomo `dist/GIOCA.html`.

La configurazione `playwright.iphone.config.js` aggiunge WebKit e le verifiche della build servita sotto `/archivio-delle-maree/`; `MAREE_PUBLIC_URL` permette di controllare lo stesso percorso sul sito pubblicato. Le icone e il manifest sono in `public/`. `scripts/pwa.mjs` prepara la cache offline con una versione derivata dal contenuto della build.

## Pubblicazione

Il ramo principale contiene i sorgenti. GitHub Pages pubblica la radice del ramo `gh-pages`; sono inclusi solo i file della build. Dopo le modifiche, verifica il gioco, registra i sorgenti e usa `npm run build` seguito da `node scripts/deploy.mjs`. Lo script pubblica senza modificare il checkout o usare aggiornamenti forzati. Serve accesso Git al repository `gabrielecapponi-ux/archivio-delle-maree`.

## File principali

- `src/game.js`: logica del primo capitolo.
- `src/chapter2.js`: logica, inventario e indizi del secondo.
- `src/campaign.js`: selezione capitoli, migrazione e preferenze.
- `src/cinematic-world.js` / `src/assets/`: i quattro ambienti attuali.
- `src/expansion.js` / `src/expansion-ui.js`: nuovi enigmi, stanze e indizi.
- `src/investigation.js`: 24 oggetti, ricette, uso degli utensili e migrazione delle ricerche.
- `src/search-scene.js` / `src/search.css`: ricerca interattiva, astucci, ingrandimento e indizi.
- `src/object-art.js`: illustrazioni originali degli oggetti.
- `src/item-viewer.js` / `src/item-viewer.css`: ispezione 3D, controlli e alternativa senza WebGL.
- `src/cinematic.css` / `src/premium.css`: interfaccia, primi piani e nuova direzione visiva.
- `src/portrait-scenes.js`: fondali verticali e coordinate delle interazioni.
- `src/atlas.js`: mappa illustrata dei quattro luoghi.
- `src/deductions.js` / `src/deductions-ui.js`: quattro deduzioni e relativi pannelli.
- `src/ui-icons.js`: icone vettoriali coordinate.
- `docs/fondali-4k-provenienza.json`: prompt, identificativi, hash e dimensioni verificati dei nuovi asset.
- `src/world.js` / `src/archive-world.js`: renderer precedenti conservati, non caricati dal gioco.
- `src/main.js` / `src/chapter2-ui.js`: interfaccia e interazioni.
- `src/audio.js`: suoni, volume e ambiente per capitolo.
- `tests/`: logica e percorsi browser.
- `artifacts/`: schermate delle verifiche.
- `docs/ART-DIRECTION.md`: direzione visiva, architettura e provenienza delle immagini.
- `docs/IMAGE-PROMPTS.json`: prompt originali dei quattro ambienti.
- `docs/ANALISI-RIFERIMENTO.md`: analisi iniziale e limiti delle osservazioni.
- `docs/ANALISI-MURDER-BY-CHOICE.md`: analisi dei giochi a oggetti nascosti e revisione 4.0.
- `docs/DESIGN-CAPITOLO-2.md`: struttura e soluzioni del nuovo capitolo; contiene spoiler.

Le licenze di Three.js, Marcellus e Source Sans 3 sono incluse in `dist/LICENZE.txt` e nel file autonomo.
