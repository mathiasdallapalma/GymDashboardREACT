#Gym Dashboard REACT
  <p align="center">
    Progetto d'esame del corso di Progettazione di app REACT (2024/2025)
  <br>Università degli Studi di Verona - Prof. Graziano Pravadelli</a>
  </p>
</p>
<br>

## Table of contents
- [Descrizione](#descrizione)
- [Tecniche e Tecnologie Utilizzate](#tecniche-e-tecnologie-utilizzate) 
- [Installazione e Utilizzo](#installazione-e-utilizzo) 
- [Sviluppi Futuri](#sviluppi-futuri) 

## Descrizione

Il progetto ** Gym Dashboard ** ha l’obiettivo di fornire uno strumento digitale che permetta a medici con competenze di fisioterapia o personal trainer di definire, gestire e personalizzare i piani di allenamento dei propri pazienti/clienti.  

### Obiettivi del progetto
- Creare una piattaforma intuitiva per la gestione di piani di esercizi fisici.  
- Consentire una gestione centralizzata dei pazienti e delle loro schede di allenamento.  
- Rendere possibile la modifica, il salvataggio e il recupero dei dati in modo sicuro e scalabile.  

### Funzionalità sviluppate
1. **Autenticazione e autorizzazione**  
   - Login dell’utente.
   - Gestione delle autorizzazioni in base ai ruoli (es. admin, personal trainer, paziente), con accesso differenziato alle funzionalità. 

2. **Gestione dei pazienti**  
   - Creazione di nuovi pazienti/clienti con dati anagrafici e livello di attività fisica.  
   - Visualizzazione e selezione di un paziente per accedere al suo piano di esercizi.  

3. **Creazione e gestione del piano di esercizi**  
   - Ogni esercizio contiene nome, descrizione, ripetizioni/durata, livello di difficoltà e note.  
   - Organizzazione degli esercizi in base ai giorni della settimana.   
   - Possibilità di modifica e cancellazione degli esercizi.  

4. **Aggiunta di nuovi esercizi**  
   - Inserimento manuale di esercizi non presenti nel database, con parametri personalizzati (tipologia, ripetizioni, tempo, intensità).
   - 
## Tecniche e Tecnologie Utilizzate

- **Backend**: [FastAPI](https://fastapi.tiangolo.com/) (Python) per la creazione delle API REST.  
- **Database**: [Firestore](https://firebase.google.com/docs/firestore) (NoSQL, Google Cloud) per la gestione dei dati relativi a pazienti ed esercizi.  
- **Documentazione e integrazione frontend**: [hey-api](https://heyapi.dev/) per la generazione automatica della documentazione e degli hook di chiamata al backend.  
- **Frontend**: [React](https://react.dev/) con [TypeScript](https://www.typescriptlang.org/), sviluppato con **responsive design** (ottimizzato principalmente per mobile).  
- **Gestione dati asincroni**: [React Query](https://tanstack.com/query/latest) per fetch, caching e sincronizzazione con il backend.  
- **UI/UX**: [Chakra UI](https://chakra-ui.com/) per componenti reattivi e accessibili.   
- **Testing**: [Pytest](https://docs.pytest.org/) per test automatici del backend.   
- **Strumenti di sviluppo**: GitHub per versionamento

## Installazione e Utilizzo

### Requisiti
- [Node.js](https://nodejs.org/) e [npm](https://www.npmjs.com/)  
- [Python 3.10+](https://www.python.org/) e [venv](https://docs.python.org/3/library/venv.html)  
- Account e credenziali Firebase Firestore (chiave in formato `.json`)  
- File `.env` con le variabili d’ambiente necessarie  

---

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Il frontend sarà disponibile su http://localhost:5173 (o la porta configurata da Vite).
### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Linux/MacOS
.venv\Scripts\activate      # Windows

pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

### Variabili d’ambiente

Il progetto richiede:

Un file .env nella cartella backend/ contenente le variabili d’ambiente (es. configurazione Firestore, secret key, ecc.).

La chiave di accesso a Firestore in formato .json, da salvare in locale e referenziata all’interno del .env.

## Sviluppi Futuri

- **Analisi avanzata dei dati**: aggiungere statistiche e grafici basati sullo storico degli esercizi per fornire un quadro chiaro dei progressi dei pazienti.  
- **Miglioramento dell’esperienza utente**: completare le pagine attualmente presenti solo come mockup, al fine di aumentare il coinvolgimento dell'utente.  
- **CI/CD**: implementare pipeline di integrazione e distribuzione continua (es. GitHub Actions) per test, build e deploy automatizzati.  
- **Deploy in produzione**: rilascio dell’applicazione su servizi cloud (es. **Vercel** per il frontend, **Google Cloud Run** o **Heroku** per il backend) per consentire l’accesso al di fuori del localhost.  
- **Notifiche e reminder**: integrare un sistema di notifiche (email o push) per ricordare ai pazienti gli esercizi programmati.    
- **Multilingua e accessibilità**: rendere l’interfaccia utilizzabile in più lingue (es. italiano/inglese) e ottimizzata per utenti con disabilità.  
- **Integrazione con dispositivi wearable**: collegamento a smartwatch e fitness tracker per importare automaticamente i dati delle sessioni di allenamento.  



