# Scanner Codici CSV

PWA (Progressive Web App) che legge codici a barre e QR code tramite la fotocamera del dispositivo e genera un elenco esportabile in CSV, con conteggio automatico delle quantità.

Nessun backend, nessuna dipendenza da installare: è un'unica pagina HTML che funziona interamente nel browser. L'unica libreria esterna è [ZXing-js](https://github.com/zxing-js/library) (per la decodifica dei codici), caricata da CDN.

## Funzionalità

- **Tre modalità di lettura**, selezionabili dall'interfaccia:
  - **Scanner** — ogni codice letto viene aggiunto (o la sua quantità incrementata di 1) subito; la fotocamera resta pronta per la lettura successiva (con un breve blocco anti-doppia-lettura).
  - **Manuale** — dopo la lettura la fotocamera si mette in pausa e propone un tastierino numerico per digitare la quantità da aggiungere; solo dopo la conferma la fotocamera torna pronta.
  - **Modifica** — attende la lettura di un codice già presente in elenco, poi permette di correggerne la quantità (tramite tastierino; non è consentito impostarla a 0) oppure di eliminarlo. Confermata la modifica, torna attiva la modalità precedente (Scanner o Manuale).
- **Interruttore lettura QR code**: un pulsante dedicato permette di disattivare/riattivare al volo il riconoscimento dei QR code, lasciando attivi solo i formati a barre.
- **Conteggio quantità**: se lo stesso codice viene letto più volte, non crea righe duplicate ma incrementa la quantità.
- **Inserimento manuale via testo**, per aggiungere un codice senza fotocamera.
- **Esportazione CSV** con colonne: `codice`, `quantita`, `formato`, `prima_lettura`, `ultima_lettura`.
- **Cambio fotocamera** (frontale/posteriore) e **torcia**, se supportate dal dispositivo.
- Interfaccia in stile iOS (colori chiari, angoli molto arrotondati, tastierino numerico circolare), con supporto al tema scuro di sistema.
- Installabile come app (PWA) su smartphone e desktop, con funzionamento offline di base grazie al service worker incluso.

## Struttura del progetto

```
.
├── index.html               # l'intera applicazione (markup, stile, logica)
├── manifest.webmanifest      # manifest PWA (nome, icone, colori)
├── sw.js                     # service worker (cache offline)
├── favicon.ico
└── icons/
    ├── icon-192.png
    ├── icon-512.png
    ├── icon-512-maskable.png
    └── apple-touch-icon.png
```

## Come pubblicarla (GitHub Pages)

1. Crea un repository su GitHub e carica il contenuto di questa cartella nella root (o in una sottocartella, adattando i percorsi relativi se necessario).
2. Nel repository vai su **Settings → Pages**.
3. In **Build and deployment**, scegli **Deploy from a branch**, seleziona il branch (es. `main`) e la cartella (`/root`).
4. Salva: dopo qualche minuto la pagina sarà raggiungibile su `https://<tuo-utente>.github.io/<nome-repo>/`.

> **Importante — HTTPS:** l'accesso alla fotocamera (`getUserMedia`) richiede un contesto sicuro. GitHub Pages serve tutto in HTTPS di default, quindi non serve alcuna configurazione aggiuntiva. In locale funziona anche su `http://localhost`.

### Provarla in locale

Basta un qualsiasi server statico, ad esempio:

```bash
python3 -m http.server 8000
# poi apri http://localhost:8000
```

Aprire il file `index.html` direttamente da filesystem (`file://`) **non funziona**: la fotocamera e il service worker richiedono un server HTTP.

## Installazione come app

Una volta pubblicata online:

- **Android (Chrome)**: menu ⋮ → "Aggiungi a schermata Home" / "Installa app".
- **iOS (Safari)**: pulsante Condividi → "Aggiungi alla schermata Home".
- **Desktop (Chrome/Edge)**: icona di installazione nella barra degli indirizzi.

## Privacy

Tutto avviene lato client: nessun codice letto, nessuna quantità e nessun file CSV vengono inviati a server esterni. L'unica richiesta di rete è il caricamento della libreria ZXing da CDN al primo avvio (poi messa in cache dal service worker).

## Personalizzazione

- **Colori/tema**: variabili CSS definite in cima a `index.html` (blocco `:root`).
- **Formati riconosciuti**: elenco `formats` nella funzione `startScanning()` in `index.html` (usa le costanti `ZXing.BarcodeFormat.*`).
- **Icone**: rigenerabili con qualunque editor grafico rispettando le dimensioni indicate nel manifest.

## Licenza

Distribuito con licenza MIT — vedi [LICENSE](LICENSE).
