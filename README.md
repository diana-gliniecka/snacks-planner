# Snacks Planner

**English** · [Polski](README.pl.md)

A mobile-first web app for planning party food. Enter the party details, pick dishes from the recipe database and get a ready-made shopping list.

**Demo:** https://diana-gliniecka.github.io/snacks-planner/

> The app UI is in Polish.

## Architecture

The app was built as a full-stack project: **React (Vite) + FastAPI + SQLAlchemy (SQLite/Postgres)**. The backend code still lives in `backend/`, and the full-stack version is tagged [`v1-fullstack`](https://github.com/diana-gliniecka/snacks-planner/tree/v1-fullstack).

The public demo runs as a static site on GitHub Pages:

- recipe data is exported from `backend/seed.py` to `frontend/src/data/recipes.json` (`python backend/export_json.py`),
- the endpoint logic from `backend/main.py` (dish suggestions, recipe scaling, shopping list) is ported 1:1 to `frontend/src/planner.js` and runs in the browser.

After changing recipes in `seed.py`, re-run `export_json.py`. Every push to `main` automatically publishes the demo (`.github/workflows/deploy.yml`).

## Requirements

- Node.js 18+
- Python 3.11+ (only for the backend / data export)

## Getting started

### Frontend (static version)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

### Backend (optional)

```bash
cd backend
pip install -r requirements.txt
python seed.py
uvicorn main:app --reload
```

## Project structure

```
party-planner/
├── .github/workflows/deploy.yml   # Build + deploy to GitHub Pages
├── backend/
│   ├── main.py          # FastAPI – API endpoints
│   ├── database.py      # SQLAlchemy engine + session
│   ├── models.py        # Table models (ORM)
│   ├── schemas.py       # Pydantic models (validation)
│   ├── seed.py          # Seeds the database with recipes
│   ├── export_json.py   # Exports recipes to JSON for the frontend
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx            # 3-step wizard
│       ├── api.js             # Data layer (maps data to component shapes)
│       ├── planner.js         # Backend logic running in the browser
│       ├── data/recipes.json  # Recipes exported from seed.py
│       ├── index.css          # Mobile styles (no framework)
│       └── components/
│           ├── StepPartyDetails.jsx   # Step 1: party details form
│           ├── StepSuggestions.jsx    # Step 2: dish selection
│           └── StepShoppingList.jsx   # Step 3: shopping list
├── README.md            # English
└── README.pl.md         # Polish
```

## API endpoints (backend)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/recipes` | All recipes (debug) |
| `GET` | `/api/recipe/{id}` | Recipe details (optional `?guests=`) |
| `POST` | `/api/suggest` | Dish suggestions matching the criteria |
| `POST` | `/api/shopping-list` | Merged shopping list |
