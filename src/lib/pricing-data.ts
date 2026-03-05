// Dynamic pricing mock data & engine

export interface PricingTier {
  name: string;
  recipientType: "shelter" | "ebt" | "consumer";
  price: number;
  originalPrice: number;
  discount: number;
  available: number;
  claimed: number;
  color: string;
  bgColor: string;
  accessWindow: string;
  emoji: string;
}

export interface PricedListing {
  id: string;
  item: string;
  emoji: string;
  quantityKg: number;
  baseValue: number;
  expiryHours: number;
  business: string;
  tiers: PricingTier[];
  rescueRate: number;
  b2bFee: number;
  foodTokens: number;
  status: "active" | "rescued" | "expired";
  createdAt: Date;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  rescueRate: number;
  monthlyRevenue: number;
  mealsRescued: number;
  isYou: boolean;
}

export interface ImpactBundle {
  id: string;
  name: string;
  emoji: string;
  items: string[];
  price: number;
  retailValue: number;
  mealsProvided: number;
  shelterMealsFunded: number;
  co2Saved: number;
  quantityKg: number;
  expiryHours: number;
  available: number;
  claimed: number;
  nutritionHighlight: string;
}

// Wasteless-inspired decay algorithm
export function calculatePrice(baseValue: number, expiryHours: number, recipientType: string): number {
  if (recipientType === "shelter") return 0;
  
  let decay: number;
  if (expiryHours <= 2) decay = 0;
  else if (expiryHours <= 6) decay = 0.85 - (expiryHours - 2) * 0.05;
  else if (expiryHours <= 12) decay = 0.55 - (expiryHours - 6) * 0.05;
  else decay = Math.max(0.10, 0.35 - (expiryHours - 12) * 0.025);

  const multipliers: Record<string, number> = { shelter: 0, ebt: 0.20, consumer: 1.0 };
  const urgency = multipliers[recipientType] ?? 1.0;

  return Math.max(0.50, baseValue * decay * urgency);
}

export function generateTiers(baseValue: number, expiryHours: number): PricingTier[] {
  const shelterPrice = 0;
  const ebtPrice = calculatePrice(baseValue, Math.max(expiryHours, 3), "ebt");
  const consumerPrice = calculatePrice(baseValue, Math.max(expiryHours, 7), "consumer");

  return [
    {
      name: "Shelter Priority",
      recipientType: "shelter",
      price: shelterPrice,
      originalPrice: baseValue,
      discount: 100,
      available: 1,
      claimed: Math.random() > 0.3 ? 1 : 0,
      color: "text-primary",
      bgColor: "bg-primary/10",
      accessWindow: "0-2 hours",
      emoji: "🟢",
    },
    {
      name: "EBT Impact",
      recipientType: "ebt",
      price: +ebtPrice.toFixed(2),
      originalPrice: baseValue,
      discount: Math.round((1 - ebtPrice / baseValue) * 100),
      available: 10,
      claimed: Math.floor(Math.random() * 8 + 1),
      color: "text-accent",
      bgColor: "bg-accent/10",
      accessWindow: "2-6 hours",
      emoji: "🟡",
    },
    {
      name: "Consumer Dynamic",
      recipientType: "consumer",
      price: +consumerPrice.toFixed(2),
      originalPrice: baseValue,
      discount: Math.round((1 - consumerPrice / baseValue) * 100),
      available: 50,
      claimed: Math.floor(Math.random() * 15),
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      accessWindow: "6-24 hours",
      emoji: "🔴",
    },
  ];
}

export const mockListings: PricedListing[] = [
  {
    id: "pl-1", item: "Free-Range Chicken Breast (6-pack)", emoji: "🍗",
    quantityKg: 3.6, baseValue: 94, expiryHours: 4.2, business: "Sunrise Bakery",
    tiers: generateTiers(94, 4.2), rescueRate: 91, b2bFee: 25, foodTokens: 250,
    status: "active", createdAt: new Date(Date.now() - 1200000),
  },
  {
    id: "pl-2", item: "Atlantic Salmon Fillets", emoji: "🐟",
    quantityKg: 4.2, baseValue: 127, expiryHours: 3.5, business: "Express Mart",
    tiers: generateTiers(127, 3.5), rescueRate: 97, b2bFee: 32, foodTokens: 320,
    status: "active", createdAt: new Date(Date.now() - 2400000),
  },
  {
    id: "pl-3", item: "Artisan Croissants (batch 12)", emoji: "🥐",
    quantityKg: 2.8, baseValue: 56, expiryHours: 6, business: "Patisserie Valerie",
    tiers: generateTiers(56, 6), rescueRate: 84, b2bFee: 14, foodTokens: 140,
    status: "active", createdAt: new Date(Date.now() - 3600000),
  },
  {
    id: "pl-4", item: "Greek Yogurt Containers (8-pack)", emoji: "🥛",
    quantityKg: 2.4, baseValue: 62, expiryHours: 8, business: "Green Grocer",
    tiers: generateTiers(62, 8), rescueRate: 78, b2bFee: 16, foodTokens: 160,
    status: "active", createdAt: new Date(Date.now() - 5400000),
  },
];

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: "Sunrise Bakery", rescueRate: 97, monthlyRevenue: 3247, mealsRescued: 1847, isYou: false },
  { rank: 2, name: "Express Mart", rescueRate: 94, monthlyRevenue: 2956, mealsRescued: 1623, isYou: false },
  { rank: 3, name: "Your Business", rescueRate: 91, monthlyRevenue: 2847, mealsRescued: 1489, isYou: true },
  { rank: 4, name: "Green Grocer", rescueRate: 87, monthlyRevenue: 2134, mealsRescued: 1156, isYou: false },
  { rank: 5, name: "Patisserie Valerie", rescueRate: 84, monthlyRevenue: 1892, mealsRescued: 978, isYou: false },
  { rank: 6, name: "Corner Café", rescueRate: 79, monthlyRevenue: 1567, mealsRescued: 834, isYou: false },
];

export const mockBundles: ImpactBundle[] = [
  { id: "b-1", name: "Protein Power Pack", emoji: "🍗", items: ["Chicken Breast x2", "Greek Yogurt x4", "Eggs x6"], price: 1.87, retailValue: 24.50, mealsProvided: 4, shelterMealsFunded: 12, co2Saved: 3.2, quantityKg: 2.8, expiryHours: 5.2, available: 10, claimed: 6, nutritionHighlight: "High protein (84g)" },
  { id: "b-2", name: "Family Fresh Box", emoji: "🥗", items: ["Salad Mix x3", "Bread Loaf", "Fruit Bowl", "Cheese x2"], price: 2.49, retailValue: 31.00, mealsProvided: 6, shelterMealsFunded: 18, co2Saved: 4.1, quantityKg: 3.5, expiryHours: 8, available: 8, claimed: 3, nutritionHighlight: "Balanced nutrition" },
  { id: "b-3", name: "Bakery Rescue", emoji: "🥐", items: ["Croissants x6", "Sourdough Loaf", "Danish Pastry x4"], price: 1.29, retailValue: 18.75, mealsProvided: 3, shelterMealsFunded: 9, co2Saved: 1.8, quantityKg: 1.9, expiryHours: 4, available: 12, claimed: 9, nutritionHighlight: "Carb energy boost" },
  { id: "b-4", name: "Seafood Saver", emoji: "🐟", items: ["Salmon Fillet x2", "Sushi Pack (12pc)"], price: 4.99, retailValue: 45.00, mealsProvided: 5, shelterMealsFunded: 15, co2Saved: 5.7, quantityKg: 3.2, expiryHours: 3, available: 5, claimed: 2, nutritionHighlight: "Omega-3 rich" },
  { id: "b-5", name: "Veggie Delight", emoji: "🥦", items: ["Mixed Veg Box", "Hummus x3", "Falafel Pack"], price: 1.49, retailValue: 19.00, mealsProvided: 4, shelterMealsFunded: 12, co2Saved: 2.4, quantityKg: 2.6, expiryHours: 6, available: 15, claimed: 7, nutritionHighlight: "Plant-based fiber" },
];
