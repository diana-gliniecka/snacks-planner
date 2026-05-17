# Planer Imprezy

Mobilna aplikacja webowa do planowania jedzenia na imprezy. Podaj szczegóły imprezy, wybierz dania z bazy przepisów i otrzymaj gotową listę zakupów.

## Wymagania

- Python 3.11+
- Node.js 18+

## Uruchomienie

### Backend

```bash
cd backend
pip install -r requirements.txt
python seed.py
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Otwórz http://localhost:5173

## Struktura projektu

```
party-planner/
├── backend/
│   ├── main.py          # FastAPI – endpointy API
│   ├── database.py      # Silnik SQLAlchemy + sesja
│   ├── models.py        # Modele tabel (ORM)
│   ├── schemas.py       # Modele Pydantic (walidacja)
│   ├── seed.py          # Wypełnienie bazy 10 przepisami
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx            # Wizard 3-krokowy
│       ├── api.js             # Funkcje fetch do backendu
│       ├── index.css          # Mobilne style (bez frameworka)
│       └── components/
│           ├── StepPartyDetails.jsx   # Krok 1: formularz
│           ├── StepSuggestions.jsx    # Krok 2: wybór dań
│           └── StepShoppingList.jsx   # Krok 3: lista zakupów
└── README.md
```

## Endpointy API

| Metoda | Ścieżka | Opis |
|--------|---------|------|
| `GET` | `/` | Health check |
| `GET` | `/recipes` | Wszystkie przepisy (debug) |
| `POST` | `/suggest` | Propozycje dań wg kryteriów |
| `POST` | `/shopping-list` | Scalona lista zakupów |
