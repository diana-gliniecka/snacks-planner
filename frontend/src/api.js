const BASE = "/api";

// Map design-form brief → backend PartyInput
function briefToInput(brief) {
  const dietMap = { mieszana: "mieszane", weg: "wegetarianskie", "wegańska": "weganskie" };
  const effortMap = [1, 2, 3];

  return {
    guests: brief.guests,
    diet: dietMap[brief.diet] ?? "mieszane",
    effort_level: effortMap[brief.effort ?? 2],
    budget_per_person: brief.budgetPP,
  };
}

// Guess a visual category from the recipe name (backend has no category field)
function guessCategory(name) {
  const n = name.toLowerCase();
  if (/sałat|caprese|bruschett|bliny|tatar|tartink|jajk|koreczk|arbuz|roladk|carpaccio/.test(n)) return "na zimno";
  if (/burger|szaszłyk|kolb|grilla|skrzydełk|karkówk|udka|falafel|tarta|portobello|pasztec/.test(n)) return "na ciepło";
  if (/hummus|guacamol|deska|bryndzówk|tapenad|makaronow/.test(n)) return "do dzielenia";
  return "do dzielenia";
}

// Map backend RecipeSuggestion → design-style dish object
function toDish(r) {
  const dietTagMap = {
    miesne: "mięsna",
    wegetarianskie: "weg",
    weganskie: "wegańska",
    rybne: "rybna",
    mieszane: "mieszana",
  };
  const tags = r.diet_tags.split(",").map((t) => dietTagMap[t.trim()] ?? t.trim());
  return {
    id: String(r.id),
    name: r.name,
    category: guessCategory(r.name),
    desc: "",
    diet: tags,
    allergens: [],
    effort: Math.max(0, (r.effort_level ?? 1) - 1),
    time: r.prep_time_minutes ?? 0,
    costPP: r.cost_per_person,
    scaledCost: r.scaled_cost,
    emoji: "🍽️",
    tag: r.diet_tags.split(",")[0],
    isUniversal: r.is_universal,
  };
}

export async function getRecipeDetail(id, guests) {
  const url = guests
    ? `${BASE}/recipe/${Number(id)}?guests=${Number(guests)}`
    : `${BASE}/recipe/${Number(id)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Nie udało się pobrać przepisu.");
  return res.json();
}

export async function getSuggestions(brief) {
  const body = briefToInput(brief);
  const res = await fetch(`${BASE}/suggest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Błąd podczas pobierania propozycji dań.");
  const data = await res.json();
  return data.map(toDish);
}

export async function getShoppingList(recipeIds, guests, numDishes, hungry) {
  const res = await fetch(`${BASE}/shopping-list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipe_ids: recipeIds.map(Number),
      guests,
      num_dishes: numDishes ?? 6,
      hungry: hungry ?? false,
    }),
  });
  if (!res.ok) throw new Error("Błąd podczas generowania listy zakupów.");
  const items = await res.json();

  // Group by category, separate to_taste items
  const AISLE_ORDER = [
    "Warzywa i owoce",
    "Mięso i ryby",
    "Ryby",
    "Nabiał",
    "Pieczywo",
    "Suche produkty",
    "Alternatywy mięsa",
    "Przyprawy i sosy",
    "Inne",
  ];

  const byCategory = {};
  const toTaste = [];

  for (const item of items) {
    if (item.total_quantity == null && item.display_note == null) {
      toTaste.push(item);
    } else {
      const cat = item.category;
      (byCategory[cat] ||= []).push(item);
    }
  }

  const aisles = AISLE_ORDER
    .filter((cat) => byCategory[cat]?.length)
    .map((cat, i) => ({
      id: cat,
      name: cat,
      items: byCategory[cat].map((item) => ({
        name: item.ingredient_name,
        qty: formatQty(item),
        cost: 0,
      })),
    }));

  if (toTaste.length) {
    aisles.push({
      id: "do-smaku",
      name: "Do smaku / według potrzeb",
      items: toTaste.map((item) => ({
        name: item.ingredient_name,
        qty: item.display_note ?? "",
        cost: 0,
      })),
    });
  }

  return aisles;
}

function formatQty(item) {
  if (item.display_note) return item.display_note;
  if (item.total_quantity == null) return "";
  let qty;
  if (item.unit === "szt") {
    qty = Math.ceil(item.total_quantity);
  } else if (item.unit === "g") {
    qty = Math.ceil(item.total_quantity / 10) * 10;
  } else {
    qty = Number.isInteger(item.total_quantity)
      ? item.total_quantity
      : parseFloat(item.total_quantity.toFixed(1));
  }
  return item.unit ? `${qty} ${item.unit}` : String(qty);
}
