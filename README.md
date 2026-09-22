# Snacks Planner

**English** · [Polski](README.pl.md)

A mobile-first web app for planning party food. Enter the party details, pick dishes from the recipe database and get a ready-made shopping list.

**Demo:** https://diana-gliniecka.github.io/snacks-planner/ · *(the app UI is in Polish)*

## Why I built it

Two reasons. I wanted to find out whether I could, and I had a real deadline: a birthday party for about 20 people, where I needed help working out how much food to actually buy.

That's the problem in a nutshell. Hosting a party means answering four questions at once — what to serve, how much to buy, how long it will take, and what it will cost. Recipe sites scale a single recipe. None of them plans a whole menu and turns it into one shopping list.

## Approach

- **Three steps, one question each:** party details → suggested menu → shopping list. Nobody has to plan everything at once.
- **Mobile-first:** the shopping list gets used in the shop, on a phone.
- **Small iterations:** around 10 small pull requests over 9 days, then changes driven by real use — recipe costs updated to real shop prices, corn changed to one cob per person because half a cob wasn't enough.
- **AI as a pair programmer:** built with Claude Code. I made the product calls — the menu model, the diet rules, the portion maths — and used AI to get from decision to working feature fast. That's the shift: a PM can build the thing now, not just specify it.

## Key decisions

- **Six dishes as the baseline menu.** The per-person budget is split across 6 dishes. Adding more dishes shrinks each portion (`min(1, 6 / dishes)`), so the total amount of food stays realistic.
- **Effort measured in time.** People think "I have an hour", not "medium difficulty". The three levels cap prep time per dish: 10 min, 20 min, or no limit.
- **Diets overlap.** A vegan dish also suits vegetarians; a pescatarian menu also takes vegetarian dishes. Some dishes are marked universal and fit every diet.
- **"Very hungry" guests (+30%)** is a single switch instead of asking people to guess portions.
- **Quantities round up.** Leftovers beat running out halfway through the party.
- **The list follows the shop layout** — vegetables, meat, dairy, bread — and "to taste" items get their own section.

## What using it taught me

The first real problem wasn't on my list of things to build. Setting the guest count meant tapping a plus button — 21 times for my own party. Fine for 4 guests, infuriating for 21. The counter now has a field you can type into, with the buttons kept for small adjustments. Testing with 3 imaginary guests never surfaces that; one real party does.

## How it's built

**React (Vite) + FastAPI + SQLAlchemy (SQLite/Postgres).** The full-stack version is tagged [`v1-fullstack`](https://github.com/diana-gliniecka/snacks-planner/tree/v1-fullstack) and its code still lives in `backend/`. Because nothing in the app is ever written back to the database, the public demo runs as a static site instead: the recipe data is exported to `frontend/src/data/recipes.json`, and the endpoint logic from `backend/main.py` is ported 1:1 to `frontend/src/planner.js`, verified against the Python original on 1120 generated cases.

How the data is modelled:

- **`recipes` ↔ `recipe_ingredients` ↔ `ingredients`** (many-to-many). One ingredient row is shared by every dish, so tomatoes from three recipes add up to a single line on the shopping list.
- **`quantity_type`: `exact` / `to_taste` / `descriptive`.** Real recipes don't always carry numbers ("a few sprigs of dill"). Only exact amounts are scaled and summed; the other two pass their text through untouched.
- **`base_servings` + `cost_per_person`** let every recipe scale to any guest count and be filtered by budget.
- **`group_name`** links variants of the same dish — Caesar salad with chicken and with vegetarian chicken. The menu shows the variant that best fits the chosen diet; the mixed setting keeps all variants so they can be swapped.
- **An ingredient's `category` is its shop aisle**, which is what gives the shopping list its order.
- **Trade-off:** diet tags and party types are comma-separated text rather than separate tables. Simple to seed for ~40 recipes, and the first thing I'd normalise as the data grows.

## What's next

- More recipes, and more variety per party type.
- Richer diet and allergen labelling, so filtering handles more real-world cases.

## Running it locally

Requires Node.js 18+ (and Python 3.11+ for the backend).

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — this runs the static version, no backend needed.

The original backend is optional:

```bash
cd backend
pip install -r requirements.txt
python seed.py
uvicorn main:app --reload
```

`backend/seed.py` is the single source of truth for recipe data. After changing it, run `python backend/export_json.py` to refresh the JSON the frontend uses. Every push to `main` publishes the demo automatically (`.github/workflows/deploy.yml`).

<details>
<summary>Project structure and API endpoints</summary>

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

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/recipes` | All recipes (debug) |
| `GET` | `/api/recipe/{id}` | Recipe details (optional `?guests=`) |
| `POST` | `/api/suggest` | Dish suggestions matching the criteria |
| `POST` | `/api/shopping-list` | Merged shopping list |

</details>
