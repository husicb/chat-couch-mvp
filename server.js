// server.js (root of project)
import express    from "express";
import bodyParser from "body-parser";
import { openai, assistantId } from "./openai/assistant.js";
import { logMeal }             from "./functions/logMeal.js";
import Database from "@replit/database"; 
import logWorkout from "./functions/logWorkout.js";
const db = new Database();                

const app = express();
app.use(bodyParser.json());

// ─── dashboard route ──────────────────────────────────────
app.get("/api/day", async (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10);   // yyyy-mm-dd
  console.log('Fetching data for date:', date);

  let meals    = await db.get(date);
  let workouts = await db.get(`${date}:w`);
  console.log('Retrieved meals:', meals);

  // Handle Replit DB response format
  meals = (meals && meals.value) || [];
  workouts = (workouts && workouts.value) || [];

  // ⬇️ guarantee they're arrays
  if (!Array.isArray(meals))    meals    = [];
  if (!Array.isArray(workouts)) workouts = [];

  console.log('Sending data:', { meals, workouts });
  const totalMacros = meals.reduce(
    (acc, m) => {
      acc.protein += m.macros.protein || 0;
      acc.carbs   += m.macros.carbs || 0;
      acc.fat     += m.macros.fat || 0;
      acc.kcal    += m.macros.kcal || 0;
      return acc;
    },
    { protein: 0, carbs: 0, fat: 0, kcal: 0 }
  );

  const totalVolume = workouts.reduce(
    (acc, w) => acc + (w.sets * w.reps * w.weight), 0
  );

  const caloriesBurned = Math.round(totalVolume * 0.1);  // rough estimate

  const kpiSummary = {
    proteinGoal: 160,
    proteinHit: totalMacros.protein >= 160
  };

  const summary = `
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

// ---------- POST  /api/message ---------------------------------
app.post("/api/message", async (req, res) => {
  const { text = "" } = req.body;

  /* 1. Handle slash-commands directly ------------------------- */
  if (text.toLowerCase().startsWith("/log meal")) {
    const raw  = text.replace(/^\/log meal\s*/i, "").trim();
    const date = new Date().toISOString().slice(0,10);        
    try {
      const out = await logMeal({ raw, date });                
      return res.json({ reply: out.confirmation });         
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message || "logMeal failed" });
    }
  }

  if (text.toLowerCase().startsWith("/log workout")) {
    const raw = text.replace(/^\/log workout\s*/i, "").trim();
    const date = new Date().toISOString().slice(0,10);
    try {
      const confirmation = await logWorkout({ raw, date });              
      return res.json({ reply: confirmation });                
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message || "logWorkout failed" });
    }
  }

  /* 2. Otherwise → pass through Assistant -------------------- */
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

    const msgs  = await openai.beta.threads.messages.list(thread.id);
    const reply = msgs.data[0].content[0].text.value;
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "assistant error" });
  }
});
// ----------------------------------------------------------------

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("API listening on", PORT));
