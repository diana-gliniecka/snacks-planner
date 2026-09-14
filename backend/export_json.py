"""Export seed data to frontend/src/data/recipes.json for the static (backend-less) build.

Run after changing seed.py:  python backend/export_json.py
"""
import json
import os
import sys
import tempfile

_tmp = tempfile.mkdtemp()
os.environ["DATABASE_URL"] = f"sqlite:///{os.path.join(_tmp, 'export.db')}"
sys.path.insert(0, os.path.dirname(__file__))

from seed import seed, _make_session  # noqa: E402
from models import Recipe  # noqa: E402

OUT = os.path.join(os.path.dirname(__file__), "..", "frontend", "src", "data", "recipes.json")


def main():
    seed()
    engine, db = _make_session()
    recipes = []
    for r in db.query(Recipe).order_by(Recipe.id).all():
        recipes.append({
            "id": r.id,
            "name": r.name,
            "party_types": r.party_types,
            "diet_tags": r.diet_tags,
            "effort_level": r.effort_level,
            "prep_time_minutes": r.prep_time_minutes,
            "cost_per_person": r.cost_per_person,
            "base_servings": r.base_servings,
            "notes": r.notes,
            "instructions": r.instructions,
            "group_name": r.group_name,
            "is_universal": bool(r.is_universal),
            "ingredients": [
                {
                    "ingredient_id": ri.ingredient_id,
                    "name": ri.ingredient.name,
                    "category": ri.ingredient.category,
                    "quantity": ri.quantity,
                    "unit": ri.unit,
                    "quantity_type": ri.quantity_type,
                    "display_note": ri.display_note,
                }
                for ri in sorted(r.recipe_ingredients, key=lambda x: x.id)
            ],
        })
    db.close()
    engine.dispose()

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(recipes, f, ensure_ascii=False, indent=1)
    print(f"Exported {len(recipes)} recipes to {os.path.normpath(OUT)}")


if __name__ == "__main__":
    main()
