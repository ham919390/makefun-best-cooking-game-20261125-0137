// Ingredients and recipes for Simmer & Serve.
//
// Every ingredient is either served as it comes from its bin, or it needs
// one prep step first: chop it on the board, grill it, or boil it in the pot.
// A prepared ingredient is named "<prep> <base>", e.g. "patty:grilled".
// A recipe is a multiset of prepared ingredient ids; the plate must match it
// exactly before the order can be served.

export const INGREDIENTS = {
  bun:     { id: 'bun',     name: 'Bun',     color: '#e8a94e', dark: '#b97f2e', shape: 'bun',     prep: null,    key: '1' },
  patty:   { id: 'patty',   name: 'Patty',   color: '#8a5a33', dark: '#5f3a1e', shape: 'patty',   prep: 'grill', key: '2' },
  lettuce: { id: 'lettuce', name: 'Lettuce', color: '#7bc043', dark: '#4e8f2a', shape: 'leaf',    prep: 'chop',  key: '3' },
  tomato:  { id: 'tomato',  name: 'Tomato',  color: '#e63946', dark: '#a11f2b', shape: 'slice',   prep: 'chop',  key: '4' },
  cheese:  { id: 'cheese',  name: 'Cheese',  color: '#f4d35e', dark: '#d9a92c', shape: 'wedge',   prep: null,    key: '5' },
  pasta:   { id: 'pasta',   name: 'Pasta',   color: '#f2c14e', dark: '#c08a1e', shape: 'pasta',   prep: 'pot',   key: '6' },
  sauce:   { id: 'sauce',   name: 'Sauce',   color: '#c0392b', dark: '#7e2318', shape: 'dollop',  prep: null,    key: '7' },
  onion:   { id: 'onion',   name: 'Onion',   color: '#c9a0dc', dark: '#8e6bb0', shape: 'rings',   prep: 'chop',  key: '8' },
};

// How long each prep step takes, in seconds of game time.
export const PREP_TIME = { grill: 5, pot: 4 };
export const CHOPS_NEEDED = 3;
// A cooked item left too long on its station burns.
export const BURN_AFTER = 6;

// The verb shown on a station while it works on an ingredient.
export const PREP_VERB = { chop: 'Chopping', grill: 'Grilling', pot: 'Boiling' };

// Turn a raw ingredient id into the id of its prepared form.
export function preparedId(rawId) {
  const ing = INGREDIENTS[rawId];
  if (!ing || !ing.prep) return rawId;
  if (ing.prep === 'grill') return rawId + ':grilled';
  if (ing.prep === 'pot') return rawId + ':boiled';
  return rawId + ':chopped';
}

// A readable name for a prepared (or raw) ingredient id.
export function displayName(itemId) {
  const [raw, prep] = itemId.split(':');
  const ing = INGREDIENTS[raw];
  if (!ing) return itemId;
  if (!prep) return ing.name;
  if (prep === 'grilled') return 'Grilled ' + ing.name;
  if (prep === 'boiled') return 'Boiled ' + ing.name;
  return 'Chopped ' + ing.name;
}

// The base ingredient behind a prepared id.
export function baseOf(itemId) {
  return itemId.split(':')[0];
}

export const RECIPES = [
  {
    id: 'burger',
    name: 'Classic Burger',
    price: 12,
    needs: ['bun', 'patty:grilled', 'lettuce:chopped', 'tomato:chopped'],
  },
  {
    id: 'pasta',
    name: 'Cheesy Pasta',
    price: 11,
    needs: ['pasta:boiled', 'sauce', 'cheese'],
  },
  {
    id: 'salad',
    name: 'Garden Salad',
    price: 9,
    needs: ['lettuce:chopped', 'tomato:chopped', 'onion:chopped', 'cheese'],
  },
  {
    id: 'melt',
    name: 'Patty Melt',
    price: 13,
    needs: ['bun', 'patty:grilled', 'cheese', 'sauce'],
  },
];

export function recipeById(id) {
  return RECIPES.find((r) => r.id === id) || null;
}

// Do the plate's contents match a recipe exactly, as a multiset?
export function plateMatchesRecipe(plate, recipe) {
  if (plate.length !== recipe.needs.length) return false;
  const have = plate.slice().sort();
  const want = recipe.needs.slice().sort();
  for (let i = 0; i < want.length; i++) {
    if (have[i] !== want[i]) return false;
  }
  return true;
}

// Find the order whose recipe the plate currently completes, if any.
export function matchingOrder(plate, orders) {
  for (const order of orders) {
    if (plateMatchesRecipe(plate, order.recipe)) return order;
  }
  return null;
}
