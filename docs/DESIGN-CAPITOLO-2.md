# Capitolo II — I nomi che il mare ricorda

## Continuità e obiettivo

Fatto di progetto: Nora ha riattivato il faro, ottenuto il sigillo e aperto il passaggio dell’osservatorio. La voce registrata di Elia la attende oltre la soglia.

Nuovo progetto: l’archivio si trova trentadue metri sotto la scogliera. Ada Valenti, madre di Nora ed Elia, ne fu una custode. Elia ha cercato la voce di Ada e rischia di diventare egli stesso un ricordo. Nora deve riportarlo alla realtà e decidere il destino delle voci raccolte.

Il capitolo è accessibile dal finale del primo e dalla selezione dei capitoli. L’accesso diretto include un riepilogo; non modifica né simula il completamento del primo capitolo.

## Spazio e aspetto

```text
       nicchie     oblò sull’oceano     nicchie
       pompe                         mosaico
                   cuore
     registro                       carillon
       scala        passerella
```

Pietra blu, vetro verde e rame pallido. L’oblò, le volte e le nicchie definiscono uno spazio diverso dall’osservatorio. L’acqua si ritira al completamento della compensazione; il cuore si illumina e la figura di Elia compare alla conclusione. Le scene sono costruite con geometrie e texture procedurali.

Palette: abisso `#071e2b`, pietra `#173e48`, rame `#b6a16b`, luce del vetro `#99f1dc`, carta `#e2dec3`. La tipografia del primo capitolo viene mantenuta per continuità; testi dei comandi e aree da toccare sono più grandi.

## Percorso critico e soluzioni

1. **Registro.** Leggi Elia e raccogli la lamina. La lente rivela una nota facoltativa di Ada, trascrivibile nel taccuino.
2. **Compensazione.** I serbatoi hanno capacità 8, 5 e 3. Stato iniziale `[8,0,0]`, obiettivo `[4,4,0]`. Un travaso muove `min(acqua_sorgente, capacità_destinazione − acqua_destinazione)`. Nessuna misura si perde. Una soluzione è `8→5, 5→3, 3→8, 5→3, 8→5, 5→3, 3→8`. Il pulsante finale controlla l’equilibrio. Si ottiene il diapason e il carillon diventa utilizzabile.
3. **Carillon.** La sequenza è Faro, Conchiglia, Onda, Abisso, Conchiglia. La riproduzione fornisce un simbolo e un testo oltre al suono. La trascrizione è disponibile, il ritmo di input è libero. Un errore azzera solo la sequenza; non revoca i progressi. Il ricordo di Ada sblocca il mosaico.
4. **Mosaico.** Ruota tubi su una griglia 3×3. La sorgente entra dal lato sinistro della cella in alto a sinistra; il ricevitore è sul lato destro della cella centrale destra. Il percorso valido è `1→2→5→4→7→8→9→6`. La cella 3 è pietra. Il controllo segue la connettività effettiva e rifiuta perdite sui bordi o raccordi mancanti: non confronta un codice arbitrario. Si ottiene il cilindro di Elia.
5. **Cuore.** Una scelta esplicita salva Elia e decide il destino dell’archivio. «Custodisci le voci» conclude con Nora ed Elia come custodi di un rifugio accessibile. «Restituisci le voci all’isola» conclude con i ricordi trasmessi attraverso il faro. Entrambi i finali sono scritti e implementati. La nota segreta cambia una frase della conclusione.

## Stati, salvataggi e bordi

- Cinque scoperte obbligatorie. La nota di Ada è separata e non impedisce il finale.
- I premi sono idempotenti. Gli oggetti necessari si ottengono solo dopo i prerequisiti.
- I travasi non possono produrre valori negativi, eccedere le capacità o perdere acqua. Ogni stato raggiungibile viene verificato nei test.
- Il carillon cancella la riproduzione se si chiude o cambia il pannello; i suoi timer non possono alterare il pannello successivo.
- Il salvataggio della campagna ha versione 2. Il vecchio salvataggio del primo capitolo viene importato e mantenuto. Ogni capitolo conserva stato, indizi e interazioni parziali.
- Ricominciare un capitolo non cancella l’altro o le preferenze.
- I dati di ripristino vengono normalizzati; i prerequisiti invalidi annullano i progressi dipendenti.

## Miglioramenti comuni

Riflessi ambientali sui materiali, selezione dei capitoli, transizione dal primo finale, aree dei comandi più grandi, focus nei pannelli, controllo del volume, audio sospeso quando la pagina non è visibile, qualità grafica leggera, riduzione del movimento e schermo intero. Il salvataggio e il gioco offline coprono entrambi i capitoli.

## Metodo e limiti

Le skill `game-design-skill`, `frontend-design` e `studio-threejs-fundamentals` hanno guidato percorso critico, gerarchie visive, lifecycle e verifica. Le prove browser usano Playwright. Non è stata ripetuta l’analisi del video: questo capitolo continua il progetto originale, senza nuovi asset o contenuti estratti dal riferimento.

La completezza funzionale è verificabile tramite test. La durata percepita, la difficoltà e il gradimento non sono stati misurati con giocatori esterni. La vista mobile è stata provata in Chrome a 390×844; non è un test su dispositivo fisico.
