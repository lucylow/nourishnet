// Mock data for waste detection, shelter nutrition, and business dashboard

export interface WasteDetection {
  id: string;
  item: string;
  emoji: string;
  quantityKg: number;
  retailValue: number;
  wasteRisk: number;
  expiryHours: number;
  business: string;
  timestamp: Date;
}

export interface ShelterNutritionGap {
  id: string;
  name: string;
  protein: number; // -43 means 43% shortfall
  vitC: number;
  carbs: number;
  calories: number;
  beds: number;
}

export interface PriorityMatch {
  id: string;
  business: string;
  items: string[];
  quantityKg: number;
  meals: number;
  nutritionScore: number;
  retailValue: number;
  driverEta: number;
  status: "available" | "claimed" | "en-route" | "delivered";
}

export interface RescueEvent {
  id: string;
  timestamp: Date;
  business: string;
  shelter: string;
  meals: number;
  co2Kg: number;
  value: number;
  type: "cv-detection" | "predicted" | "manual";
}

export const mockDetections: WasteDetection[] = [
  { id: "d1", item: "Atlantic Salmon Fillet", emoji: "🐟", quantityKg: 4.2, retailValue: 127, wasteRisk: 92, expiryHours: 3.5, business: "Sunrise Bakery", timestamp: new Date() },
  { id: "d2", item: "Croissants (batch)", emoji: "🥐", quantityKg: 2.8, retailValue: 56, wasteRisk: 87, expiryHours: 6, business: "Patisserie Valerie", timestamp: new Date(Date.now() - 300000) },
  { id: "d3", item: "Mixed Salad Bowls", emoji: "🥗", quantityKg: 5.1, retailValue: 89, wasteRisk: 78, expiryHours: 8, business: "Green Grocer", timestamp: new Date(Date.now() - 600000) },
  { id: "d4", item: "Chicken Breast (6-pack)", emoji: "🍗", quantityKg: 3.6, retailValue: 94, wasteRisk: 95, expiryHours: 2.1, business: "Express Mart", timestamp: new Date(Date.now() - 900000) },
  { id: "d5", item: "Artisan Bread Loaves", emoji: "🍞", quantityKg: 1.9, retailValue: 38, wasteRisk: 71, expiryHours: 12, business: "Corner Café", timestamp: new Date(Date.now() - 1200000) },
];

export const mockShelters: ShelterNutritionGap[] = [
  { id: "s1", name: "Community Kitchen East", protein: -43, vitC: -28, carbs: 12, calories: -15, beds: 87 },
  { id: "s2", name: "Shelter A — Hackney", protein: -31, vitC: -52, carbs: 5, calories: -8, beds: 124 },
  { id: "s3", name: "Food Bank North", protein: -18, vitC: -12, carbs: 28, calories: 3, beds: 45 },
];

export const mockMatches: PriorityMatch[] = [
  { id: "m1", business: "Express Mart", items: ["Chicken Breast x6", "Mixed Salad Bowls"], quantityKg: 8.7, meals: 24, nutritionScore: 96, retailValue: 183, driverEta: 12, status: "available" },
  { id: "m2", business: "Sunrise Bakery", items: ["Atlantic Salmon Fillet"], quantityKg: 4.2, meals: 14, nutritionScore: 91, retailValue: 127, driverEta: 18, status: "en-route" },
  { id: "m3", business: "Corner Café", items: ["Artisan Bread Loaves", "Pastries"], quantityKg: 3.4, meals: 11, nutritionScore: 73, retailValue: 68, driverEta: 25, status: "available" },
  { id: "m4", business: "Patisserie Valerie", items: ["Croissants batch"], quantityKg: 2.8, meals: 9, nutritionScore: 62, retailValue: 56, driverEta: 30, status: "claimed" },
];

export const mockRescueTimeline: RescueEvent[] = [
  { id: "r1", timestamp: new Date(Date.now() - 60000), business: "Express Mart", shelter: "Community Kitchen East", meals: 24, co2Kg: 8.7, value: 183, type: "cv-detection" },
  { id: "r2", timestamp: new Date(Date.now() - 3600000), business: "Sunrise Bakery", shelter: "Shelter A — Hackney", meals: 14, co2Kg: 4.2, value: 127, type: "predicted" },
  { id: "r3", timestamp: new Date(Date.now() - 7200000), business: "Green Grocer", shelter: "Food Bank North", meals: 18, co2Kg: 5.1, value: 89, type: "manual" },
  { id: "r4", timestamp: new Date(Date.now() - 14400000), business: "Corner Café", shelter: "Community Kitchen East", meals: 11, co2Kg: 3.4, value: 68, type: "cv-detection" },
  { id: "r5", timestamp: new Date(Date.now() - 28800000), business: "Patisserie Valerie", shelter: "Shelter A — Hackney", meals: 9, co2Kg: 2.8, value: 56, type: "predicted" },
];

// Waste prediction chart data
export const wastePredictionData = [
  { day: "Mon", predicted: 12.4, actual: 11.8, prevented: 8.2 },
  { day: "Tue", predicted: 18.7, actual: 17.2, prevented: 14.1 },
  { day: "Wed", predicted: 9.3, actual: 10.1, prevented: 7.8 },
  { day: "Thu", predicted: 15.1, actual: 14.6, prevented: 11.3 },
  { day: "Fri", predicted: 22.8, actual: 21.4, prevented: 18.9 },
  { day: "Sat", predicted: 28.3, actual: null, prevented: null },
  { day: "Sun", predicted: 14.6, actual: null, prevented: null },
];

export const businessSavingsData = [
  { month: "Jan", waste: 847, savings: 1203 },
  { month: "Feb", waste: 723, savings: 1456 },
  { month: "Mar", waste: 612, savings: 1689 },
  { month: "Apr", waste: 489, savings: 1847 },
  { month: "May", waste: 356, savings: 2134 },
  { month: "Jun", waste: 278, savings: 2456 },
];
