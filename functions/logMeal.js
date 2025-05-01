import axios from "axios";
import { db, read } from "../src/utils/db.js";

const API = "https://api.spoonacular.com/recipes/parseIngredients";

export async function logMeal({ raw, date }) {
  const form = new URLSearchParams({
    ingredientList: raw,
    servings: 1,
    includeNutrition: true,
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
    carbs: pick("Carbohydrates"),
    fat: pick("Fat"),
    kcal: pick("Calories"),
  };

  const key = new Date(date).toISOString().slice(0, 10);
  let meals = await read(key);
  if (!Array.isArray(meals)) meals = [];

  meals.push({ raw, macros });
  await db.set(key, meals);

  return {
    confirmation: `✅ Logged “${raw}” for ${key}`,
    macros,
  };
}