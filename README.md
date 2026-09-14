# Planer Imprezy

Mobilna aplikacja webowa do planowania jedzenia na imprezy. Podaj szczegóły imprezy, wybierz dania z bazy przepisów i otrzymaj gotową listę zakupów.

**Demo:** https://diana-gliniecka.github.io/snacks-planner/

## Architektura

Aplikacja powstała jako full-stack: **React (Vite) + FastAPI + SQLAlchemy (SQLite/Postgres)**. Kod backendu nadal jest w katalogu `backend/`, a wersja full-stack jest oznaczona tagiem [`v1-fullstack`](https://github.com/diana-gliniecka/snacks-planner/tree/v1-fullstack).

Publiczne demo działa jako statyczna strona na GitHub Pages (bez kosztów hostingu serwera i bazy):

- dane przepisów są eksportowane z `backend/seed.py` do `frontend/src/data/recipes.json` (`python backend/export_json.py`),
- logika endpointów z `backend/main.py` (propozycje dań, skalowanie przepisów, lista zakupów) jest przeniesiona 1:1 do `frontend/src/planner.js` i działa w przeglądarce.

Po zmianie przepisów w `seed.py` uruchom ponownie `export_json.py`. Każdy push na `main` automatycznie publikuje demo (`.github/workflows/deploy.yml`).

## Wymagania

- Node.js 18+
- Python 3.11+ (tylko do backendu / eksportu danych)

## Uruchomienie

### Frontend (wersja statyczna)

```bash
cd frontend
npm install
npm run dev
```

Otwórz http://localhost:5173

### Backend (opcjonalnie)

```bash
cd backend
pip install -r requirements.txt
python seed.py
uvicorn main:app --reload
```

## Struktura projektu

```
party-planner/
├── .github/workflows/deploy.yml   # Build + deploy na GitHub Pages
├── backend/
│   ├── main.py          # FastAPI – endpointy API
│   ├── database.py      # Silnik SQLAlchemy + sesja
│   ├── models.py        # Modele tabel (ORM)
│   ├── schemas.py       # Modele Pydantic (walidacja)
│   ├── seed.py          # Wypełnienie bazy przepisami
│   ├── export_json.py   # Eksport przepisów do JSON dla frontendu
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx            # Wizard 3-krokowy
│       ├── api.js             # Warstwa danych (mapowanie na komponenty)
│       ├── planner.js         # Logika z backendu działająca w przeglądarce
│       ├── data/recipes.json  # Przepisy wyeksportowane z seed.py
│       ├── index.css          # Mobilne style (bez frameworka)
│       └── components/
│           ├── StepPartyDetails.jsx   # Krok 1: formularz
│           ├── StepSuggestions.jsx    # Krok 2: wybór dań
│           └── StepShoppingList.jsx   # Krok 3: lista zakupów
└── README.md
```

## Endpointy API (backend)

| Metoda | Ścieżka | Opis |
|--------|---------|------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/recipes` | Wszystkie przepisy (debug) |
| `GET` | `/api/recipe/{id}` | Szczegóły przepisu (opcjonalnie `?guests=`) |
| `POST` | `/api/suggest` | Propozycje dań wg kryteriów |
| `POST` | `/api/shopping-list` | Scalona lista zakupów |
