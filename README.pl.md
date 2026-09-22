# Snacks Planner

[English](README.md) · **Polski**

Mobilna aplikacja webowa do planowania jedzenia na imprezy. Podaj szczegóły imprezy, wybierz dania z bazy przepisów i otrzymaj gotową listę zakupów.

**Demo:** https://diana-gliniecka.github.io/snacks-planner/

## Dlaczego to zbudowałam

Z dwóch powodów. Chciałam sprawdzić, czy dam radę, i miałam realny termin: urodziny dla około 20 osób, przy których potrzebowałam pomocy w policzeniu, ile jedzenia naprawdę kupić.

I na tym polega problem. Organizacja imprezy to cztery pytania naraz — co podać, ile kupić, ile to zajmie i ile będzie kosztować. Strony z przepisami przeliczają pojedynczy przepis. Żadna nie układa całego menu i nie zamienia go w jedną listę zakupów.

## Podejście

- **Trzy kroki, w każdym jedno pytanie:** szczegóły imprezy → propozycja menu → lista zakupów. Nikt nie musi planować wszystkiego naraz.
- **Mobile-first:** z listy zakupów korzysta się w sklepie, na telefonie.
- **Małe iteracje:** około 10 małych pull requestów w 9 dni, a potem zmiany wynikające z realnego używania — koszty przepisów zaktualizowane do cen sklepowych, kukurydza przeliczona na 1 kolbę na osobę, bo pół kolby to za mało.
- **AI jako pair programmer:** zbudowane z Claude Code. Decyzje produktowe były moje — model menu, reguły diet, matematyka porcji — a AI pozwoliło szybko przejść od decyzji do działającej funkcji. Na tym polega zmiana: PM może dziś zbudować produkt, a nie tylko go opisać.

## Kluczowe decyzje

- **Sześć dań jako bazowe menu.** Budżet na osobę dzieli się na 6 dań. Więcej dań zmniejsza porcje (`min(1, 6 / liczba dań)`), więc łączna ilość jedzenia pozostaje realistyczna.
- **Nakład pracy mierzony czasem.** Ludzie myślą "mam godzinę", a nie "średni poziom trudności". Trzy poziomy ograniczają czas przygotowania jednego dania: 10 min, 20 min lub bez limitu.
- **Diety się zazębiają.** Danie wegańskie pasuje też wegetarianom, a menu rybne przyjmuje dania wegetariańskie. Część dań jest oznaczona jako uniwersalne i pasuje do każdej diety.
- **"Mega głodni" (+30%)** to jeden przełącznik zamiast zgadywania porcji.
- **Ilości zaokrąglane w górę.** Lepiej, żeby zostało, niż żeby zabrakło w połowie imprezy.
- **Lista ułożona jak sklep** — warzywa, mięso, nabiał, pieczywo — a składniki "do smaku" mają osobną sekcję.

## Czego nauczyło mnie używanie aplikacji

Pierwszy realny problem w ogóle nie był na mojej liście rzeczy do zbudowania. Liczbę gości ustawiało się klikaniem plusa — przy moich urodzinach 21 razy. Przy 4 osobach spoko, przy 21 chce się rzucić telefonem. Dziś licznik ma pole, w które można wpisać liczbę, a przyciski zostały do drobnych korekt. Testowanie na 3 wymyślonych gościach tego nie pokaże; jedna prawdziwa impreza owszem.

## Jak to jest zbudowane

**React (Vite) + FastAPI + SQLAlchemy (SQLite/Postgres).** Wersja full-stack ma tag [`v1-fullstack`](https://github.com/diana-gliniecka/snacks-planner/tree/v1-fullstack), a jej kod nadal jest w katalogu `backend/`. Ponieważ aplikacja nigdy nic nie zapisuje do bazy, publiczne demo działa jako strona statyczna: dane przepisów są eksportowane do `frontend/src/data/recipes.json`, a logika endpointów z `backend/main.py` jest przeniesiona 1:1 do `frontend/src/planner.js` i zweryfikowana wobec oryginału w Pythonie na 1120 wygenerowanych przypadkach.

Jak zamodelowane są dane:

- **`recipes` ↔ `recipe_ingredients` ↔ `ingredients`** (relacja wiele-do-wielu). Jeden rekord składnika jest współdzielony przez wszystkie dania, więc pomidory z trzech przepisów sumują się do jednej pozycji na liście zakupów.
- **`quantity_type`: `exact` / `to_taste` / `descriptive`.** Prawdziwe przepisy nie zawsze mają liczby ("kilka gałązek koperku"). Tylko dokładne ilości są przeliczane i sumowane; pozostałe dwa typy przenoszą swój opis bez zmian.
- **`base_servings` + `cost_per_person`** pozwalają przeliczyć każdy przepis na dowolną liczbę gości i filtrować po budżecie.
- **`group_name`** łączy warianty tego samego dania — sałatka Cezar z kurczakiem i z kurczakiem wegetariańskim. Menu pokazuje wariant najlepiej pasujący do wybranej diety; przy diecie mieszanej zostają wszystkie warianty, żeby dało się je wymieniać.
- **`category` składnika to dział w sklepie**, i to właśnie porządkuje listę zakupów.
- **Kompromis:** tagi diet i typy imprez to tekst rozdzielony przecinkami, a nie osobne tabele. Przy ~40 przepisach jest to proste w utrzymaniu i byłoby pierwszą rzeczą do znormalizowania przy większej ilości danych.

## Co dalej

- Więcej przepisów i większa różnorodność dla każdego typu imprezy.
- Bogatsze oznaczenia diet i alergenów, żeby filtrowanie obejmowało więcej realnych przypadków.

## Uruchomienie lokalnie

Wymagane: Node.js 18+ (oraz Python 3.11+ do backendu).

```bash
cd frontend
npm install
npm run dev
```

Otwórz http://localhost:5173 — to wersja statyczna, backend nie jest potrzebny.

Oryginalny backend jest opcjonalny:

```bash
cd backend
pip install -r requirements.txt
python seed.py
uvicorn main:app --reload
```

`backend/seed.py` to jedyne źródło prawdy dla danych o przepisach. Po jego zmianie uruchom `python backend/export_json.py`, żeby odświeżyć JSON używany przez frontend. Każdy push na `main` automatycznie publikuje demo (`.github/workflows/deploy.yml`).

<details>
<summary>Struktura projektu i endpointy API</summary>

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
├── README.md            # English
└── README.pl.md         # Polski
```

| Metoda | Ścieżka | Opis |
|--------|---------|------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/recipes` | Wszystkie przepisy (debug) |
| `GET` | `/api/recipe/{id}` | Szczegóły przepisu (opcjonalnie `?guests=`) |
| `POST` | `/api/suggest` | Propozycje dań wg kryteriów |
| `POST` | `/api/shopping-list` | Scalona lista zakupów |

</details>
