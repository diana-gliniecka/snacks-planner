from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from collections import defaultdict

from database import get_db, init_db
from models import Recipe, RecipeIngredient, Ingredient
from schemas import PartyInput, RecipeSuggestion, ShoppingItem, ShoppingListRequest

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/")
def health_check():
    return {"status": "ok"}


@app.get("/recipes")
def get_all_recipes(db: Session = Depends(get_db)):
    recipes = db.query(Recipe).all()
    return [
        {
            "id": r.id,
            "name": r.name,
            "party_types": r.party_types,
            "diet_tags": r.diet_tags,
            "effort_level": r.effort_level,
            "cost_per_person": r.cost_per_person,
            "base_servings": r.base_servings,
            "notes": r.notes,
        }
        for r in recipes
    ]


@app.post("/suggest", response_model=list[RecipeSuggestion])
def suggest_recipes(body: PartyInput, db: Session = Depends(get_db)):
    recipes = db.query(Recipe).all()

    # 1. Filter by party_type
    recipes = [r for r in recipes if body.party_type in r.party_types.split(",")]

    # 2. Filter by diet
    diet = body.diet
    if diet == "miesne":
        allowed = {"miesne"}
    elif diet == "wegetarianskie":
        allowed = {"wegetarianskie", "weganskie"}
    elif diet == "weganskie":
        allowed = {"weganskie"}
    elif diet == "rybne":
        allowed = {"rybne", "wegetarianskie", "weganskie"}
    else:  # mieszane
        allowed = None

    if allowed is not None:
        def has_allowed_tag(r):
            tags = set(r.diet_tags.split(","))
            return bool(tags & allowed)
        recipes = [r for r in recipes if has_allowed_tag(r)]

    # 3. Filter by effort_level
    recipes = [r for r in recipes if r.effort_level <= body.effort_level]

    # 4. Filter by budget_per_person
    recipes = [r for r in recipes if r.cost_per_person <= body.budget_per_person]

    return [
        RecipeSuggestion(
            id=r.id,
            name=r.name,
            diet_tags=r.diet_tags,
            effort_level=r.effort_level,
            cost_per_person=r.cost_per_person,
            scaled_cost=round(r.cost_per_person * body.guests, 2),
        )
        for r in recipes
    ]


@app.post("/shopping-list", response_model=list[ShoppingItem])
def get_shopping_list(body: ShoppingListRequest, db: Session = Depends(get_db)):
    guests = body.guests

    # ingredient_id -> {quantity, unit, category, name}
    exact_totals: dict[int, dict] = {}
    # ingredient_id -> ShoppingItem (non-summable)
    special_items: dict[int, dict] = {}

    for recipe_id in body.recipe_ids:
        recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
        if not recipe:
            continue
        ris = db.query(RecipeIngredient).filter(
            RecipeIngredient.recipe_id == recipe_id
        ).all()
        for ri in ris:
            ing: Ingredient = ri.ingredient
            if ri.quantity_type == "exact":
                scaled = ri.quantity * (guests / recipe.base_servings)
                if ri.ingredient_id in exact_totals:
                    exact_totals[ri.ingredient_id]["total_quantity"] += scaled
                else:
                    exact_totals[ri.ingredient_id] = {
                        "ingredient_name": ing.name,
                        "category": ing.category,
                        "total_quantity": scaled,
                        "unit": ri.unit,
                        "display_note": None,
                    }
            else:
                # to_taste or descriptive — deduplicate by ingredient_id
                if ri.ingredient_id not in special_items:
                    special_items[ri.ingredient_id] = {
                        "ingredient_name": ing.name,
                        "category": ing.category,
                        "total_quantity": None,
                        "unit": None,
                        "display_note": ri.display_note,
                    }

    # Merge: exact items first, then special
    all_items: list[dict] = list(exact_totals.values()) + list(special_items.values())

    # Sort: by category then name
    all_items.sort(key=lambda x: (x["category"], x["ingredient_name"]))

    return [ShoppingItem(**item) for item in all_items]
