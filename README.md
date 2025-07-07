# 🌿 GreenOps AI

**GreenOps AI** è una piattaforma intelligente per la gestione predittiva e sostenibile del verde aziendale. Combina sensori IoT, Intelligenza Artificiale (LLM), una dashboard web e un'app mobile per ottimizzare interventi come irrigazione, potatura e manutenzione ordinaria.

---

## 🚀 Architettura del Sistema

- **Frontend Web**: Dashboard per Facility Manager con mappe, report, AI assistant, gestione utenti e attività.  
- **Backend API**: Server Node.js/Express che gestisce sensori, autenticazione, AI, notifiche, irrigazione.  
- **Mobile App**: App cross-platform per manutentori e dipendenti sviluppata con Expo/React Native.  
- **LLM Locale**: Modello AI (es. Mistral 7B) in esecuzione tramite [Ollama](https://ollama.com/) per risposte predittive offline.  
- **Hardware IoT**: Sensori ambientali collegati ad Arduino.

---

## 📦 Requisiti

- Node.js ≥ 18  
- MongoDB  
- Expo CLI  
- Python 3 (solo per Ollama/AI locale)  
- [Ollama](https://ollama.com/) installato e configurato  
- `.env` per backend e frontend configurati correttamente

---

## 🖥️ Avvio del Progetto

Per avviare il progetto GreenOps AI è necessario eseguire separatamente i tre moduli principali: backend, frontend e applicazione mobile.

Per avviare il backend, spostarsi nella cartella `backend/server`, installare le dipendenze con `npm install` ed eseguire il server con `npm run dev`.

Per avviare il frontend web, spostarsi nella cartella `apps/web-dashboard`, installare le dipendenze con `npm install` ed eseguire l’applicazione con `npm run dev`.

Per avviare l’app mobile, spostarsi nella cartella `apps/mobile-app`, installare le dipendenze con `npm install` ed eseguire l’app con `npx expo start`.

Assicurarsi che il backend sia attivo e accessibile dalla rete locale per permettere la corretta comunicazione con frontend e mobile.

---

## 🔌 Integrazione Arduino/Sensori

I sensori ambientali collegati ad Arduino raccolgono in tempo reale:

- Temperatura  
- Umidità dell’aria  
- Umidità del suolo (soil moisture)  
- Luminosità ambientale  

I dati vengono inviati via seriale al server backend, che li elabora, li memorizza e li utilizza per analisi AI, visualizzazione in dashboard, attivazione di alert e automazioni come l’irrigazione.

---

## 🧠 AI: Funzionalità Avanzate

L’intelligenza artificiale integrata nel sistema è in grado di:

- Analizzare i dati ambientali, le previsioni meteo e lo storico per decidere se attivare l’irrigazione.  
- Generare suggerimenti personalizzati su potatura, fertilizzazione e trattamenti.  
- Valutare automaticamente le segnalazioni degli utenti e decidere se approvarle.  
- Classificare ogni stazione come `healthy`, `warning` o `critical` e attivare irrigazione automatica in caso di criticità.  
- Rispondere a richieste via dashboard o app mobile come assistente virtuale.

---

## 👥 Ruoli del Sistema

- **Admin**: approva i manager, gestisce il sistema centrale.  
- **Facility Manager**: supervisiona le stazioni, assegna attività, monitora i dati.  
- **Manutentore**: riceve attività operative via app e fornisce feedback.  
- **Dipendente**: può segnalare problemi o anomalie ambientali tramite app.  
- **AI**: suggerisce, valuta, automatizza e supporta decisioni operative.

---

## ⚙️ Altre Funzionalità

- Login e registrazione con verifica email  
- Autenticazione OAuth (Google, GitHub)  
- 2FA (autenticazione a due fattori) per una maggiore sicurezza  
- Inviti via token JWT con attivazione diretta  
- Dashboard dinamica con filtri, grafici e mappe  
- Notifiche in tempo reale tramite Socket.IO  
- Upload immagini e report tramite mobile  
- Sistema di attività programmabili e tracciamento degli interventi  
- Storico irrigazioni e gestione automatica via AI

---

## 🙌 Credits

Progetto sviluppato per il corso di **Digital Business** del Politecnico di Bari.

**Team GreenOps AI:**

- 👤 Giovanni Nardelli – Ingegnere Informatico  
- 👤 Sonia Marina Caselli – Ingegnere Gestionale  
- 👤 Francesco Marzano – Ingegnere Gestionale  
- 👤 Luca Lorusso – Ingegnere Gestionale  

Anno Accademico 2025–2026

---
