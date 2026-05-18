from pydantic import BaseModel


class PartyInput(BaseModel):
    guests: int
    party_type: str
    diet: str
    effort_level: int
    budget_per_person: float


class RecipeSuggestion(BaseModel):
    id: int
    name: str
    diet_tags: str
    effort_level: int
    cost_per_person: float
    scaled_cost: float
    is_universal: bool

    model_config = {"from_attributes": True}


class ShoppingItem(BaseModel):
    ingredient_name: str
    category: str
    total_quantity: float | None
    unit: str | None
    display_note: str | None


class ShoppingListRequest(BaseModel):
    recipe_ids: list[int]
    guests: int
    num_dishes: int = 6
    hungry: bool = False
