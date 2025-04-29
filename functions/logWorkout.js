// functions/logWorkout.js
import Database from "@replit/database";
const db = new Database();

/*  Bench press 3x10 135lbs  → {exercise, sets, reps, weight}  */
function parseWorkout(raw) {
  const m = raw.match(/^(.+?)\s+(\d+)x(\d+)\s+(\d+)\s*lbs?$/i);
  if (!m) throw new Error(
      "❌ Use: “Bench press 3x10 135lbs” (exercise setsxreps weightlbs)");
  return { exercise: m[1].trim(), sets:+m[2], reps:+m[3], weight:+m[4] };
}

export default async function logWorkout({ raw, date }) {
  const w  = { ...parseWorkout(raw), loggedAt:new Date().toISOString() };

  const key = `${date}:w`;                 // workouts share the :w suffix
  let workouts = await db.get(key) || [];
  if (!Array.isArray(workouts)) workouts = [];

  workouts.push(w);
  await db.set(key, workouts);

  return `✅ Logged ${w.exercise} ${w.sets}×${w.reps} @ ${w.weight} lb`;
}
