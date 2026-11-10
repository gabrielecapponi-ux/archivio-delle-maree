# Versione 5 — verifica del 10 novembre 2026

- Quattro PNG generati con GPT Image 2.6 via Higgsfield: 2160×3840 ciascuno, verificati leggendo i file. Quattro richieste, preventivo totale 17 crediti autorizzato dall’utente. Nessuna rigenerazione a pagamento.
- Copie WebP alla stessa risoluzione: circa 2,1–2,7 MB ciascuna. Nessun ricampionamento. Originali e hash in `fondali-4k-provenienza.json`.
- Nuove composizioni usate in verticale; in orizzontale rimangono le composizioni precedenti. Coordinate di meccanismi, oggetti e astucci adattate alle immagini verticali.
- Marcellus e Source Sans 3 locali; icone SVG coordinate; atlante illustrato; quattro deduzioni opzionali con salvataggio compatibile con le partite precedenti.
- 44 test logici superati. 16 scenari browser Chrome superati, con ripetizione dei 6 scenari interessati dagli ultimi ritocchi.
- 9 scenari iPhone/verticale superati: due capitoli completi in WebKit, nuova deduzione in WebKit, fondali nativi e controlli touch, Full HD, 4K e ripresa offline in WebKit e Chrome.
- L’offline WebKit viene verificato spegnendo il server di un’origine locale dedicata: `setOffline(true)` provoca un errore interno nel simulatore, coerente con [Playwright #42775](https://github.com/microsoft/playwright/issues/42775). La prova a server spento passa e raccoglie ulteriori oggetti dopo il riavvio.
- Un’esecuzione del capitolo I è stata interrotta dal ricaricamento Vite durante una modifica; ripetuta senza modifiche simultanee, passa.
- Esaminati screenshot di titolo, esplorazione, ricerca, atlante e deduzioni a 390 px. Corretti sovrapposizione titolo/chiusura, selezione dell’immagine durante il trascinamento e inquadratura rispetto ai comandi inferiori.
- Build Vite e file autonomo completi; copia offline di 27 risorse, circa 14 MB oltre al file autonomo di circa 19 MB. Avviso di bundle JavaScript maggiore di 500 KB dovuto anche all’ispezione Three.js; non blocca la build.

Le verifiche sono eseguite su Mac, in emulazione, senza un iPhone fisico. La risoluzione del pannello del telefono rimane quella del dispositivo. Il progetto è un’avventura browser 2.5D originale; “AAA” è una direzione estetica richiesta, non una classificazione produttiva attestata.
