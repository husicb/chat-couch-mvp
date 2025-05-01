// server.js (root of project)
import { extractDatePrefixed } from "./src/utils/extractDate.js";
import express from "express";
import bodyParser from "body-parser";
import { openai, assistantId } from "./openai/assistant.js";
import { logMeal } from "./functions/logMeal.js";
import logWorkout from "./functions/logWorkout.js";
import { db, read } from "./src/utils/db.js";

const app = express();
app.use(bodyParser.json());

// ─── dashboard route ──────────────────────────────────────
app.get("/api/day", async (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  console.log('Fetching data for date:', date);

  let meals = await read(date);
  let workouts = await read(`${date}:w`);
  console.log('Retrieved meals:', meals);

  console.log('Sending data:', { meals, workouts });
  const totalMacros = meals.reduce(
    (acc, m) => {
      acc.protein += m.macros.protein || 0;
      acc.carbs += m.macros.carbs || 0;
      acc.fat += m.macros.fat || 0;
      acc.kcal += m.macros.kcal || 0;
      return acc;
    },
    { protein: 0, carbs: 0, fat: 0, kcal: 0 }
  );

  const totalVolume = workouts.reduce(
    (acc, w) => acc + (w.sets * w.reps * w.weight), 0
  );

  const caloriesBurned = Math.round(totalVolume * 0.1);
  const kpiSummary = {
    proteinGoal: 160,
    proteinHit: totalMacros.protein >= 160
  };

  const mealList = meals.length
    ? meals.map(m => `- ${m.raw}`).join("\n")
    : "No meals logged.";

  const summary = `
  📋 Meals:
  ${mealList}

  🥗 Macros: ${totalMacros.protein}g P, ${totalMacros.carbs}g C, ${totalMacros.fat}g F (${totalMacros.kcal} kcal)
  🏋️ Volume: ${totalVolume} lbs lifted (~${caloriesBurned} kcal burned)
  🎯 Protein goal: ${kpiSummary.proteinHit ? "✅ Hit" : "❌ Missed"}
  `;

  res.json({
    meals,
    workouts,
    totals: { macros: totalMacros, caloriesBurned, volume: totalVolume },
    kpis: kpiSummary,
    summary
  });
});

app.post("/api/message", async (req, res) => {
  const { text = "" } = req.body;

  if (text.toLowerCase().startsWith("/log meal")) {
    const { date, cleaned } = extractDatePrefixed(
      text.replace(/^\/log meal\s*/i, "")
    );

    try {
      const out = await logMeal({ raw: cleaned, date });
      return res.json({ reply: out.confirmation });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message || "logMeal failed" });
    }
  }

  if (text.toLowerCase().startsWith("/log workout")) {
    const { date, cleaned } = extractDatePrefixed(
      text.replace(/^\/log workout\s*/i, "")
    );

    try {
      const confirmation = await logWorkout({ raw: cleaned, date });
      return res.json({ reply: confirmation });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message || "logWorkout failed" });
    }
  }

  try {
    const thread = await openai.beta.threads.create();
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: text,
    });

    let run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
    });

    while (run.status === "in_progress") {
      await new Promise(r => setTimeout(r, 700));
      run = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    if (run.status === "requires_action") {
      return res.status(501).json({ error: "tool not implemented yet" });
    }

    const msgs = await openai.beta.threads.messages.list(thread.id);
    const reply = msgs.data[0].content[0].text.value;
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "assistant error" });
  }
});

app.post("/api/parse-log", async (req, res) => {
  const { text = "" } = req.body;
  const date = new Date().toISOString().slice(0, 10);

  const lines = text
    .split(/[\n.]+/)
    .map(line => line.trim())
    .filter(Boolean);

  const results = [];
  let total = { protein: 0, carbs: 0, fat: 0, kcal: 0 };

  for (const line of lines) {
    try {
      const out = await logMeal({ raw: line, date });
      total.protein += out.macros.protein || 0;
      total.carbs += out.macros.carbs || 0;
      total.fat += out.macros.fat || 0;
      total.kcal += out.macros.kcal || 0;
      results.push({ raw: line, macros: out.macros });
    } catch (err) {
      results.push({ raw: line, error: err.message || "Failed to parse" });
    }
  }

  res.json({ results, total });
});

app.get("/api/dashboard", async (req, res) => {
  const range = req.query.range || "day";
  const today = new Date();
  const dbKeys = [];

  if (range === "day") {
    dbKeys.push(today.toISOString().slice(0, 10));
  }
  if (range === "week") {
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      dbKeys.push(d.toISOString().slice(0, 10));
    }
  }
  if (range === "month") {
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      dbKeys.push(d.toISOString().slice(0, 10));
    }
  }

  const days = [];
  let totalProtein = 0, totalKcal = 0, totalVolume = 0;

  for (const key of dbKeys) {
    let meals = await read(key);
    let workouts = await read(`${key}:w`);

    const protein = meals.reduce((a, m) => a + (m.macros.protein || 0), 0);
    const kcal = meals.reduce((a, m) => a + (m.macros.kcal || 0), 0);
    const volume = workouts.reduce((a, w) => a + (w.sets * w.reps * w.weight), 0);

    totalProtein += protein;
    totalKcal += kcal;
    totalVolume += volume;

    days.push({
      date: key,
      meals,
      workouts,
      kpis: {
        protein,
        kcal,
        volume,
        proteinHit: protein >= 160
      }
    });
  }

  res.json({
    days,
    totals: {
      protein: totalProtein,
      kcal: totalKcal,
      volume: totalVolume
    }
  });
});

app.get("/api/debug-db", async (req, res) => {
  const keysRes = await fetch(`${process.env.REPLIT_DB_URL}?prefix=`);
  const keysRaw = await keysRes.text();
  const keys = keysRaw.split("\n").filter(Boolean);

  const dbDump = {};
  for (const key of keys) {
    const valueRes = await fetch(`${process.env.REPLIT_DB_URL}/${key}`);
    const valRaw = await valueRes.text();
    try {
      dbDump[key] = JSON.parse(valRaw);
    } catch (e) {
      dbDump[key] = valRaw;
    }
  }

  res.json({ keys: keys.length, data: dbDump });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("API listening on", PORT));