// functions/logMeal.js
import Database from "@replit/database";
import axios    from "axios";

const db = new Database();
const API = "https://api.spoonacular.com/recipes/parseIngredients";

export async function logMeal({ raw, date }) {
  /* 1️⃣  call Spoonacular – POST form-urlencoded */
  const form = new URLSearchParams({
    ingredientList: raw,
    servings: 1,
    includeNutrition: true
  });

  const { data } = await axios.post(
    `${API}?apiKey=${process.env.SPOONACULAR_KEY}`,
    form.toString(),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  const n = data[0].nutrition.nutrients;
  const pick = name => n.find(x => x.name === name)?.amount || 0;

  const macros = {
    protein: pick("Protein"),
    carbs:   pick("Carbohydrates"),
    fat:     pick("Fat"),
    kcal:    pick("Calories")
  };

  /* 2️⃣  persist to Replit DB */
  const key = date;                       // ✏️ use server-supplied date now
  let meals = await db.get(key);
  if (!Array.isArray(meals)) meals = [];

  meals.push({ raw, macros });
  await db.set(key, meals);

  /* 3️⃣  return confirmation */
  return {
    confirmation:
      `✅ Logged “${raw}” → P ${macros.protein} g / ` +
      `C ${macros.carbs} g / F ${macros.fat} g (${macros.kcal} kcal)`
  };
}
