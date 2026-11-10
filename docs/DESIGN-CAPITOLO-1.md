# Capitolo I — Il respiro della luce

Questo documento contiene le soluzioni.

## Fantasia e criteri

Essere una restauratrice che rende nuovamente leggibili strumenti dimenticati. Tre scelte di progetto: osservazione prima dell’azione, oggetti con una funzione narrativa, ricompensa visibile dopo ogni scoperta. Sono intenzioni di design; il gradimento richiede ancora una prova con giocatori esterni.

## Mappa e percorso

```text
     finestra     porta / archivio      finestra
  cofanetto                              materiali
  libreria        macchina centrale
  scrittoio                              lanternario
                     ingresso
```

Percorso critico: lettera → chiave → cofanetto → lente → lanternario → carta → macchina → sigillo → porta → finale.

Gli oggetti sono sempre ispezionabili. Le interazioni che modificano gli enigmi richiedono i relativi prerequisiti. Visitare gli oggetti fuori ordine dà un’indicazione utile e non blocca la partita.

## Enigmi e transizioni

| Fase | Input del giocatore | Condizione | Premio e feedback |
|---|---|---|---|
| Lettera | Leggere e raccogliere | Nessuna | Chiave di rame e nota nel taccuino. |
| Cofanetto | Inserire chiave, ruotare tre quadranti 0–5 | Onde 3, luna 1, lampi 4 | Coperchio aperto, lente nell’inventario. |
| Lanternario | Attivare lente; ruotare prismi tra N/E/S/O | Ovest, Est, Sud | Proiezione accesa e carta celeste. |
| Macchina | Ruotare tre orbite tra sei simboli | Esterno Faro, mediano Onda, interno Luna | Movimento della macchina e sigillo. |
| Porta | Inserire il sigillo | Macchina completata | Porta aperta, luce, conclusione narrativa. |

La lente rivela la soluzione del lanternario ma non è una penalità obbligatoria: chi deduce o prova l’orientamento corretto può procedere. La carta è richiesta prima di manipolare le orbite. Gli oggetti consumabili non vengono duplicati; le azioni già completate sono idempotenti.

## Ritmo

Arrivo breve → lettera personale → piccolo problema numerico → nuova modalità di osservazione → orientamento dei prismi → composizione delle orbite → ritorno alla porta e rivelazione. Tutta l’esperienza si svolge nella stessa sala. Non ci sono combattimenti, morte, tempo limite o punizioni per gli indizi.

## Narrazione originale

Vespera, 17 novembre 1912. Nora Valenti torna all’isola su richiesta del fratello Elia. Il faro è spento e l’osservatorio abbandonato. Il suo percorso rimette in moto un antico apparato che Elia dichiara di aver trovato sotto il mare. Dopo l’ultimo enigma, una voce registrata la avverte che riaccendere la luce ha rivelato la sua presenza. Il primo capitolo si chiude sulla scala verso l’archivio sommerso; la scala ora conduce al secondo capitolo giocabile, «I nomi che il mare ricorda».

## Audio e accessibilità

Ambiente sonoro originale sintetizzato nel browser: rumore filtrato, bordone leggero, piccoli toni di interazione e accordo di conferma. Nessun suono è necessario per risolvere un enigma. Audio inizialmente spento. Testi sempre visibili, navigazione da tastiera, dettagli scorrevoli, indicazioni testuali oltre al colore, movimento decorativo ridotto quando richiesto dal sistema. In assenza di WebGL gli enigmi restano accessibili attraverso la barra degli oggetti, con un avviso sulla vista 3D.

## Aspetto

Palette: abisso `#10232c`, pietra marina `#122a34`, vetro `#8fc2c0`, ottone `#d3b67e`, carta `#e8dfcc`. Cormorant Garamond per storia e titoli, Manrope per i comandi. La scena occupa lo schermo; i dettagli si aprono lateralmente, preservando il contesto dell’oggetto. Su schermi stretti il dettaglio diventa quasi a tutta larghezza.

## Limiti e prossime prove

Validati i percorsi funzionali in Chrome desktop e nel viewport mobile. Non provati su un telefono fisico, altri browser o dispositivi con GPU diverse. La soluzione è un capitolo breve e autonomo; non pretende di ricostruire l’intero primo capitolo del video. La durata e la difficoltà percepita vanno misurate con persone che non conoscono le soluzioni.
