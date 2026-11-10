# Revisione visiva e ampliamento — 9 novembre 2026

L’obiettivo è passare dal modello schematico dell’osservatorio a un’avventura di esplorazione con ambienti credibili e un’interfaccia che lasci spazio alla scena.

## Direzione

- Pietra, noce, ottone invecchiato, vetro e carta del 1912; illuminazione ambra e luce marina.
- Colori: inchiostro `#080d10`, pietra chiara `#f2e9d5`, ottone `#cbaa69`, riflesso marino `#8dc9c4`, legno scuro `#3f3528`.
- Cormorant Garamond per titoli e documenti, Manrope per comandi e informazioni brevi.
- La stanza occupa l’intera finestra. I punti interattivi rivelano il nome al passaggio, alla selezione da tastiera o usando «Oggetti». Inventario e strumenti restano ai bordi. L’elenco completo è nella mappa.
- I meccanismi si esaminano in primo piano: superficie manipolabile a sinistra, istruzioni e azioni a destra. Sul telefono gli elementi sono impilati e scorrevoli.

## Architettura grafica effettiva

Quattro ambienti originali prerenderizzati e una texture di bronzo, generati con il tool integrato imagegen, in `src/assets/`. Si tratta di un’avventura **2.5D a punti di osservazione**, con spostamento orizzontale sui dispositivi stretti, ingrandimento durante l’ispezione, particelle leggere e luce riflessa. Non è un ambiente 3D a movimento libero. I vecchi renderer delle stanze sono conservati ma non caricati; nella revisione 4.0 Three.js viene usato per l’ispezione degli utensili nell’inventario, con modelli originali, materiali metallici e illuminazione d’ambiente.

Le immagini originali PNG sono conservate. Le copie JPEG alla stessa risoluzione, ottimizzate per la distribuzione, sono incorporate nel file autonomo. Nessuna immagine, font o suono richiede una connessione durante il gioco. I primi piani interattivi sono disegnati con HTML, CSS e SVG e rimangono accessibili anche senza WebGL. Riduzione del movimento, modalità leggera e interruzione delle particelle in schede nascoste sono disponibili.

## Nuova struttura

Ogni capitolo conta nove scoperte necessarie. Il primo aggiunge diario di Ada, regolatore a due riduzioni, costellazione del ritorno, previsione della marea e discesa dall’officina. Il secondo aggiunge ordinamento dei custodi, pressione a valvole accoppiate, frammenti del fonografo e apertura della campana prima della scelta finale.

La revisione 4.0 introduce una ricerca di sei oggetti in ogni stanza. Gli oggetti sono illustrati in SVG con palette di ottone, legno, vetro e carta; non hanno indicatori permanenti nella ricerca. Ogni astuccio nasconde un componente. Dopo aver trovato tutte le tracce, due pezzi diventano un utensile da ispezionare e montare sul meccanismo. Le altre quattro prove arricchiscono il taccuino. Il pannello inferiore presenta nomi e avanzamento; l’indizio evidenzia un oggetto e lo porta nell’inquadratura. L’ispezione 3D include rotazione, zoom e comandi da tastiera, e viene dismessa quando si chiude il pannello.

Le partite precedenti incomplete conservano gli enigmi già risolti e proseguono nelle nuove stanze. Le partite già completate mantengono il finale; per giocare tutti i nuovi passaggi si può ricominciare il singolo capitolo dal menu, lasciando intatto l’altro.

## Asset e provenienza

Generazione: tool integrato imagegen; nessun asset estratto dal video di riferimento. Prompt completi in `docs/IMAGE-PROMPTS.json` e `docs/BRONZE-PROMPT.txt`.

- `src/assets/observatory.png`: sala delle maree.
- `src/assets/workshop.png`: officina astronomica.
- `src/assets/archive.png`: galleria sommersa.
- `src/assets/vault.png`: camera dei ricordi.
- `src/assets/bronze.png`: materiale dei meccanismi.
- `src/assets/*.jpg`: copie di distribuzione utilizzate dal gioco.

Il riferimento video guida il ritmo di osservazione, la presenza degli strumenti storici e la ricchezza dei materiali. Storia, nomi, ambienti e meccanismi sono originali.
