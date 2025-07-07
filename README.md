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
