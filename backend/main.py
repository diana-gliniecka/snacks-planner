import os
import re as _re

from fastapi import FastAPI, APIRouter, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from collections import defaultdict

from database import get_db, init_db, SessionLocal
from models import Recipe, RecipeIngredient, Ingredient
from schemas import PartyInput, RecipeSuggestion, ShoppingItem, ShoppingListRequest

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter(prefix="/api")


@app.on_event("startup")
def on_startup():
    init_db()
    db = SessionLocal()
    try:
        needs_seed = db.query(Recipe).count() == 0
        # If schema was just migrated (column freshly added), all rows have prep_time_minutes=0
        # — re-seed to populate real values.
        if not needs_seed and db.query(Recipe).filter(Recipe.prep_time_minutes == 0).count() == db.query(Recipe).count():
            needs_seed = True
        if needs_seed:
            from seed import seed
            seed()
    finally:
        db.close()


@router.get("/health")
def health_check():
    return {"status": "ok"}


@router.get("/recipes")
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


@router.get("/recipe/{recipe_id}")
def get_recipe_detail(recipe_id: int, guests: int | None = None, db: Session = Depends(get_db)):
    r = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Przepis nie znaleziony")
    scale = (guests / r.base_servings) if guests and r.base_servings else 1.0
    ingredients = []
    for ri in r.recipe_ingredients:
        ing = ri.ingredient
        if ri.quantity_type == "to_taste":
            qty_str = "do smaku"
        elif ri.quantity_type == "descriptive":
            qty_str = ri.display_note or "wg potrzeb"
        else:
            if ri.quantity is not None:
                raw = float(ri.quantity) * scale
                if ri.unit == "szt":
                    q = max(1, round(raw))
                elif ri.unit == "g":
                    q = int(round(raw / 10.0) * 10)
                else:
                    q = int(raw) if raw == int(raw) else round(raw, 1)
                qty_str = f"{q} {ri.unit}" if ri.unit else str(q)
                if ri.display_note:
                    qty_str += f" ({ri.display_note})"
            else:
                qty_str = ri.display_note or ""
        ingredients.append({"name": ing.name, "qty": qty_str})
    steps = []
    if r.instructions:
        for line in r.instructions.split("\n"):
            line = line.strip()
            if line:
                steps.append(_re.sub(r"^\d+\.\s*", "", line))
    return {
        "id": r.id,
        "name": r.name,
        "notes": r.notes or "",
        "steps": steps,
        "effort_level": r.effort_level,
        "cost_per_person": r.cost_per_person,
        "base_servings": r.base_servings,
        "ingredients": ingredients,
    }


@router.post("/suggest", response_model=list[RecipeSuggestion])
def suggest_recipes(body: PartyInput, db: Session = Depends(get_db)):
    recipes = db.query(Recipe).all()

    if body.party_type:
        recipes = [r for r in recipes if body.party_type in r.party_types.split(",")]

    diet = body.diet
    if diet == "miesne":
        allowed = {"miesne"}
    elif diet == "wegetarianskie":
        allowed = {"wegetarianskie", "weganskie"}
    elif diet == "weganskie":
        allowed = {"weganskie"}
    elif diet == "rybne":
        allowed = {"rybne", "wegetarianskie", "weganskie"}
    else:
        allowed = None

    if allowed is not None:
        def passes_diet(r):
            if r.is_universal:
                return True
            tags = set(r.diet_tags.split(","))
            return bool(tags & allowed)
        recipes = [r for r in recipes if passes_diet(r)]

    # effort_level 1 → max 10 min/danie (6 dań × 10 = 60 min = "do 1h")
    # effort_level 2 → max 20 min/danie (6 × 20 = 120 min = "do 2h")
    # effort_level 3 → brak limitu
    _time_limit = {1: 10, 2: 20, 3: None}.get(body.effort_level)
    if _time_limit is not None:
        recipes = [r for r in recipes if r.prep_time_minutes <= _time_limit]
    per_dish_budget = body.budget_per_person / 6
    recipes = [r for r in recipes if r.cost_per_person <= per_dish_budget]

    # Deduplicate by group_name — keep the variant that best matches the requested diet.
    # For "mieszane" skip deduplication so all variants are available in the swap/add pool.
    if diet != "mieszane":
        diet_priority = {
            "miesne":         ["miesne", "rybne", "wegetarianskie", "weganskie"],
            "wegetarianskie": ["wegetarianskie", "weganskie"],
            "weganskie":      ["weganskie"],
            "rybne":          ["rybne", "wegetarianskie", "weganskie"],
        }
        priority = diet_priority.get(diet, [])

        seen_groups: dict[str, Recipe] = {}
        for r in recipes:
            key = r.group_name if r.group_name else str(r.id)
            if key not in seen_groups:
                seen_groups[key] = r
            else:
                existing = seen_groups[key]
                ex_score = min((priority.index(t) for t in existing.diet_tags.split(",") if t in priority), default=999)
                cur_score = min((priority.index(t) for t in r.diet_tags.split(",") if t in priority), default=999)
                if cur_score < ex_score:
                    seen_groups[key] = r
        recipes = list(seen_groups.values())

    return [
        RecipeSuggestion(
            id=r.id,
            name=r.name,
            diet_tags=r.diet_tags,
            effort_level=r.effort_level,
            prep_time_minutes=r.prep_time_minutes,
            cost_per_person=r.cost_per_person,
            scaled_cost=round(r.cost_per_person * body.guests, 2),
            is_universal=r.is_universal,
        )
        for r in recipes
    ]


@router.post("/shopping-list", response_model=list[ShoppingItem])
def get_shopping_list(body: ShoppingListRequest, db: Session = Depends(get_db)):
    guests = body.guests

    exact_totals: dict[int, dict] = {}
    special_items: dict[int, dict] = {}

    portion_factor = min(1.0, 6.0 / body.num_dishes) if body.num_dishes > 0 else 1.0
    hungry_factor = 1.3 if body.hungry else 1.0
    total_factor = portion_factor * hungry_factor

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
                scaled = ri.quantity * (guests / recipe.base_servings) * total_factor
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
                if ri.ingredient_id not in special_items:
                    special_items[ri.ingredient_id] = {
                        "ingredient_name": ing.name,
                        "category": ing.category,
                        "total_quantity": None,
                        "unit": None,
                        "display_note": ri.display_note,
                    }

    all_items: list[dict] = list(exact_totals.values()) + list(special_items.values())
    all_items.sort(key=lambda x: (x["category"], x["ingredient_name"]))

    return [ShoppingItem(**item) for item in all_items]


app.include_router(router)

# Serve React build in production
_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.isdir(_dist):
    from fastapi.staticfiles import StaticFiles
    app.mount("/", StaticFiles(directory=_dist, html=True), name="static")
