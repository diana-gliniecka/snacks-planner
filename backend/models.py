from sqlalchemy import Column, Integer, Text, Float, Boolean, ForeignKey
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(Text, nullable=False)
    party_types = Column(Text, nullable=False)
    diet_tags = Column(Text, nullable=False)
    effort_level = Column(Integer, nullable=False)
    prep_time_minutes = Column(Integer, nullable=False, default=0)
    cost_per_person = Column(Float, nullable=False)
    base_servings = Column(Integer, nullable=False)
    notes = Column(Text)
    instructions = Column(Text)
    group_name = Column(Text)
    is_universal = Column(Boolean, default=False)

    recipe_ingredients = relationship("RecipeIngredient", back_populates="recipe")


class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(Text, nullable=False, unique=True)
    category = Column(Text, nullable=False)
    default_unit = Column(Text, nullable=False)

    recipe_ingredients = relationship("RecipeIngredient", back_populates="ingredient")
    shopping_list_items = relationship("ShoppingListItem", back_populates="ingredient")


class RecipeIngredient(Base):
    __tablename__ = "recipe_ingredients"

    id = Column(Integer, primary_key=True, autoincrement=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"), nullable=False)
    quantity = Column(Float)
    unit = Column(Text)
    quantity_type = Column(Text, nullable=False)
    display_note = Column(Text)

    recipe = relationship("Recipe", back_populates="recipe_ingredients")
    ingredient = relationship("Ingredient", back_populates="recipe_ingredients")


class ShoppingListItem(Base):
    __tablename__ = "shopping_list_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(Text, nullable=False)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"), nullable=False)
    total_quantity = Column(Float)
    unit = Column(Text)
    display_note = Column(Text)

    ingredient = relationship("Ingredient", back_populates="shopping_list_items")
