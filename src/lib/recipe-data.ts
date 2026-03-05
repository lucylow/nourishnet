// Recipe Engine: Nutrition-first bundling from expiring inventory

export interface InventoryItem {
  id: string;
  name: string;
  emoji: string;
  quantityKg: number;
  expiryHours: number;
  priority: number; // 0-100
  category: "protein" | "carb" | "vegetable" | "dairy" | "fruit" | "grain" | "pantry";
  nutritionPer100g: { protein: number; carbs: number; fat: number; vitC: number; calories: number };
}

export interface RecipeBundle {
  id: string;
  name: string;
  emoji: string;
  description: string;
  servings: number;
  prepTimeMin: number;
  difficulty: "Easy" | "Medium" | "Hard";
  ingredients: { item: string; quantityKg: number; emoji: string }[];
  nutritionPerServing: { protein: number; carbs: number; fat: number; vitC: number; calories: number };
  nutritionScore: number; // 0-100
  tags: string[];
  instructions: string[];
  matchedShelter?: { name: string; gap: string; gapPercent: number; matchScore: number };
  status: "suggested" | "confirmed" | "dispatched" | "delivered";
  utilizationPercent: number;
  weather?: string;
  cultural?: string;
}

export interface ShelterNeed {
  id: string;
  name: string;
  beds: number;
  proteinGap: number;
  carbGap: number;
  vitCGap: number;
  calorieGap: number;
  preferences: string[];
  avoidances: string[];
  pickupRate: number;
}

// Mock expiring inventory
export const mockInventory: InventoryItem[] = [
  { id: "inv-1", name: "Chicken Breast", emoji: "🍗", quantityKg: 12, expiryHours: 4, priority: 95, category: "protein", nutritionPer100g: { protein: 31, carbs: 0, fat: 3.6, vitC: 0, calories: 165 } },
  { id: "inv-2", name: "Tomatoes", emoji: "🍅", quantityKg: 8, expiryHours: 24, priority: 78, category: "vegetable", nutritionPer100g: { protein: 0.9, carbs: 3.9, fat: 0.2, vitC: 14, calories: 18 } },
  { id: "inv-3", name: "Basmati Rice", emoji: "🍚", quantityKg: 15, expiryHours: 72, priority: 42, category: "grain", nutritionPer100g: { protein: 3.5, carbs: 28, fat: 0.3, vitC: 0, calories: 130 } },
  { id: "inv-4", name: "Sourdough Bread", emoji: "🍞", quantityKg: 8, expiryHours: 12, priority: 83, category: "carb", nutritionPer100g: { protein: 8.5, carbs: 51, fat: 1.7, vitC: 0, calories: 266 } },
  { id: "inv-5", name: "Apples", emoji: "🍎", quantityKg: 10, expiryHours: 48, priority: 55, category: "fruit", nutritionPer100g: { protein: 0.3, carbs: 14, fat: 0.2, vitC: 4.6, calories: 52 } },
  { id: "inv-6", name: "Greek Yogurt", emoji: "🥛", quantityKg: 6, expiryHours: 6, priority: 89, category: "dairy", nutritionPer100g: { protein: 10, carbs: 3.6, fat: 0.7, vitC: 0, calories: 59 } },
  { id: "inv-7", name: "Carrots", emoji: "🥕", quantityKg: 5, expiryHours: 36, priority: 62, category: "vegetable", nutritionPer100g: { protein: 0.9, carbs: 10, fat: 0.2, vitC: 5.9, calories: 41 } },
  { id: "inv-8", name: "Salmon Fillet", emoji: "🐟", quantityKg: 4.2, expiryHours: 3, priority: 97, category: "protein", nutritionPer100g: { protein: 20, carbs: 0, fat: 13, vitC: 0, calories: 208 } },
  { id: "inv-9", name: "Cheese Slices", emoji: "🧀", quantityKg: 3, expiryHours: 18, priority: 71, category: "dairy", nutritionPer100g: { protein: 25, carbs: 1.3, fat: 33, vitC: 0, calories: 402 } },
  { id: "inv-10", name: "Croissants", emoji: "🥐", quantityKg: 4, expiryHours: 8, priority: 86, category: "carb", nutritionPer100g: { protein: 8, carbs: 46, fat: 21, vitC: 0, calories: 406 } },
];

export const mockShelterNeeds: ShelterNeed[] = [
  { id: "s1", name: "Shelter A — Hackney", beds: 85, proteinGap: -43, carbGap: 12, vitCGap: -28, calorieGap: -15, preferences: ["chicken", "rice"], avoidances: ["fish"], pickupRate: 94 },
  { id: "s2", name: "Community Kitchen East", beds: 120, proteinGap: -12, carbGap: -31, vitCGap: -47, calorieGap: -22, preferences: ["soup", "stew"], avoidances: [], pickupRate: 89 },
  { id: "s3", name: "Food Bank North", beds: 60, proteinGap: -8, carbGap: -19, vitCGap: -15, calorieGap: -5, preferences: ["sandwiches", "cold meals"], avoidances: ["peanut"], pickupRate: 91 },
  { id: "s4", name: "Senior Centre West", beds: 45, proteinGap: -22, carbGap: 5, vitCGap: -52, calorieGap: -18, preferences: ["soft food", "soup"], avoidances: [], pickupRate: 87 },
];

// Pre-generated recipe bundles
export const mockRecipeBundles: RecipeBundle[] = [
  {
    id: "rb-1",
    name: "Sesame Chicken Rice Bowls",
    emoji: "🥘",
    description: "Complete protein meal with aromatic rice and fresh tomato salsa",
    servings: 80,
    prepTimeMin: 45,
    difficulty: "Easy",
    ingredients: [
      { item: "Chicken Breast", quantityKg: 12, emoji: "🍗" },
      { item: "Basmati Rice", quantityKg: 10, emoji: "🍚" },
      { item: "Tomatoes", quantityKg: 4, emoji: "🍅" },
    ],
    nutritionPerServing: { protein: 28, carbs: 52, fat: 12, vitC: 8, calories: 428 },
    nutritionScore: 94,
    tags: ["High Protein", "Complete Meal", "Shelter Priority"],
    instructions: [
      "Batch cook rice in large pots (20 min)",
      "Season & stir-fry chicken in batches with soy, garlic, sesame oil (15 min per batch)",
      "Dice tomatoes for fresh salsa topping",
      "Assemble bowls: rice base, chicken, tomato salsa (5 min)",
    ],
    matchedShelter: { name: "Shelter A — Hackney", gap: "Protein", gapPercent: 43, matchScore: 94 },
    status: "suggested",
    utilizationPercent: 92,
  },
  {
    id: "rb-2",
    name: "Roasted Root Vegetable Soup",
    emoji: "🍲",
    description: "Vitamin C-rich warm soup — ideal for senior centres and cold weather",
    servings: 60,
    prepTimeMin: 55,
    difficulty: "Easy",
    ingredients: [
      { item: "Tomatoes", quantityKg: 4, emoji: "🍅" },
      { item: "Carrots", quantityKg: 5, emoji: "🥕" },
    ],
    nutritionPerServing: { protein: 2, carbs: 18, fat: 1, vitC: 22, calories: 89 },
    nutritionScore: 82,
    tags: ["Vitamin C Boost", "Senior-Friendly", "Warm Comfort"],
    instructions: [
      "Rough chop all vegetables",
      "Roast at 200°C for 25 min until caramelised",
      "Blend with stock in batches",
      "Season and serve in 2L portions",
    ],
    matchedShelter: { name: "Senior Centre West", gap: "Vitamin C", gapPercent: 52, matchScore: 91 },
    status: "suggested",
    utilizationPercent: 100,
    weather: "Rainy — warm comfort food",
  },
  {
    id: "rb-3",
    name: "Mini Apple Croissant Tarts",
    emoji: "🥐",
    description: "Quick assembly dessert — great for school meal boxes and events",
    servings: 120,
    prepTimeMin: 30,
    difficulty: "Easy",
    ingredients: [
      { item: "Croissants", quantityKg: 4, emoji: "🥐" },
      { item: "Apples", quantityKg: 5, emoji: "🍎" },
      { item: "Greek Yogurt", quantityKg: 2, emoji: "🥛" },
    ],
    nutritionPerServing: { protein: 4, carbs: 32, fat: 8, vitC: 3, calories: 212 },
    nutritionScore: 71,
    tags: ["Kid-Friendly", "No Cooking", "School Meal"],
    instructions: [
      "Slice croissants in half horizontally",
      "Core and thin-slice apples",
      "Layer: croissant base, yogurt, apple slices",
      "Box individually for grab-and-go",
    ],
    matchedShelter: { name: "Community Kitchen East", gap: "Carbs", gapPercent: 31, matchScore: 85 },
    status: "suggested",
    utilizationPercent: 88,
  },
  {
    id: "rb-4",
    name: "Salmon & Bread Bowl Platters",
    emoji: "🐟",
    description: "Premium omega-3 rich meal — high-value rescue with sourdough",
    servings: 40,
    prepTimeMin: 35,
    difficulty: "Medium",
    ingredients: [
      { item: "Salmon Fillet", quantityKg: 4.2, emoji: "🐟" },
      { item: "Sourdough Bread", quantityKg: 4, emoji: "🍞" },
      { item: "Greek Yogurt", quantityKg: 2, emoji: "🥛" },
    ],
    nutritionPerServing: { protein: 24, carbs: 38, fat: 16, vitC: 0, calories: 392 },
    nutritionScore: 89,
    tags: ["Omega-3 Rich", "Premium", "High Protein"],
    instructions: [
      "Season salmon fillets with lemon, dill, salt",
      "Bake at 180°C for 18 min",
      "Slice sourdough, toast lightly",
      "Serve: salmon fillet, bread, yogurt-dill sauce",
    ],
    matchedShelter: { name: "Food Bank North", gap: "Protein", gapPercent: 8, matchScore: 78 },
    status: "suggested",
    utilizationPercent: 95,
  },
  {
    id: "rb-5",
    name: "Cheese & Apple Box Lunches",
    emoji: "🧀",
    description: "No-cook grab-and-go boxes — peanut-free, kid-approved",
    servings: 200,
    prepTimeMin: 20,
    difficulty: "Easy",
    ingredients: [
      { item: "Cheese Slices", quantityKg: 3, emoji: "🧀" },
      { item: "Apples", quantityKg: 5, emoji: "🍎" },
      { item: "Sourdough Bread", quantityKg: 4, emoji: "🍞" },
    ],
    nutritionPerServing: { protein: 8, carbs: 22, fat: 10, vitC: 3, calories: 210 },
    nutritionScore: 76,
    tags: ["No Cooking", "Peanut-Free", "Kid-Friendly", "Shelf-Stable 24h"],
    instructions: [
      "Slice bread into sandwich portions",
      "Cut cheese to fit bread slices",
      "Quarter and core apples",
      "Box: 2 cheese sandwiches + apple quarters per box",
    ],
    matchedShelter: { name: "Community Kitchen East", gap: "Carbs", gapPercent: 31, matchScore: 82 },
    status: "suggested",
    utilizationPercent: 100,
  },
  {
    id: "rb-6",
    name: "Chicken Bone Broth + Shredded Bowls",
    emoji: "🍖",
    description: "Zero-waste: thighs for bowls, bones for broth — 100% utilisation",
    servings: 120,
    prepTimeMin: 90,
    difficulty: "Medium",
    ingredients: [
      { item: "Chicken Breast", quantityKg: 12, emoji: "🍗" },
      { item: "Carrots", quantityKg: 5, emoji: "🥕" },
      { item: "Basmati Rice", quantityKg: 5, emoji: "🍚" },
    ],
    nutritionPerServing: { protein: 18, carbs: 24, fat: 6, vitC: 4, calories: 222 },
    nutritionScore: 88,
    tags: ["Zero Waste", "100% Utilisation", "Bone Broth", "High Protein"],
    instructions: [
      "Separate chicken — breast for shredding, trimmings for stock",
      "Simmer bones + carrots for broth (60 min)",
      "Shred cooked chicken, cook rice",
      "Serve: shredded chicken + rice in broth bowls",
    ],
    matchedShelter: { name: "Shelter A — Hackney", gap: "Protein", gapPercent: 43, matchScore: 96 },
    status: "suggested",
    utilizationPercent: 100,
    weather: "Cold — warming broth perfect",
  },
];

// Compute nutrition score from ingredients
export function computeNutritionScore(recipe: RecipeBundle): number {
  const n = recipe.nutritionPerServing;
  let score = 0;
  if (n.protein >= 20) score += 30; else if (n.protein >= 10) score += 20; else score += 10;
  if (n.carbs >= 30) score += 20; else if (n.carbs >= 15) score += 15; else score += 8;
  if (n.vitC >= 10) score += 20; else if (n.vitC >= 5) score += 12; else score += 5;
  if (n.calories >= 300 && n.calories <= 600) score += 15; else score += 8;
  if (n.fat <= 20) score += 15; else score += 8;
  return Math.min(100, score);
}

// Match recipe to best shelter
export function matchRecipeToShelter(recipe: RecipeBundle, shelters: ShelterNeed[]): ShelterNeed | null {
  let best: ShelterNeed | null = null;
  let bestScore = -1;

  for (const s of shelters) {
    let score = 0;
    const n = recipe.nutritionPerServing;
    if (n.protein >= 15 && s.proteinGap < -20) score += 40;
    if (n.vitC >= 10 && s.vitCGap < -20) score += 35;
    if (n.carbs >= 25 && s.carbGap < -15) score += 25;
    score += s.pickupRate * 0.2;
    // Preference bonus
    const recipeName = recipe.name.toLowerCase();
    for (const pref of s.preferences) {
      if (recipeName.includes(pref)) score += 15;
    }
    for (const avoid of s.avoidances) {
      if (recipeName.includes(avoid)) score -= 50;
    }
    if (score > bestScore) { bestScore = score; best = s; }
  }
  return best;
}

// Weather-based recipe suggestions
export function getWeatherTag(): { label: string; emoji: string } {
  const hour = new Date().getHours();
  const month = new Date().getMonth();
  if (month >= 10 || month <= 2) return { label: "Cold weather — warm meals preferred", emoji: "❄️" };
  if (month >= 6 && month <= 8) return { label: "Summer — fresh & light meals", emoji: "☀️" };
  if (hour >= 17) return { label: "Evening — hearty dinner portions", emoji: "🌙" };
  return { label: "Moderate — balanced meals", emoji: "🌤️" };
}
