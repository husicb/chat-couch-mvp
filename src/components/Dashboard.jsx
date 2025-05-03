// src/components/Dashboard.jsx
import { useState, useEffect } from "react";

export default function Dashboard() {
  const [range, setRange] = useState("day");
  const [data,  setData ] = useState(null);

  useEffect(() => {
    fetch(`/api/dashboard?range=${range}`)
      .then(r => r.json())
      .then(setData)
      .catch(console.error);
  }, [range]);

  const RANGES = ["day", "week", "month"];

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        Loading dashboard…
      </div>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* range buttons */}
      <div className="flex gap-2">
        {RANGES.map(r => (
          <button key={r}
            onClick={() => setRange(r)}
            className={`rounded px-3 py-1 text-sm font-semibold
              ${range === r
                ? "bg-blue-600 text-white shadow"
                : "bg-gray-100 hover:bg-gray-200"}`}>
            {r[0].toUpperCase() + r.slice(1)}
          </button>
        ))}
      </div>

      {/* day cards */}
      {data.days.map(day => (
        <section key={day.date}
          className="rounded-xl border bg-white/70 p-5 shadow-sm backdrop-blur">
          <h2 className="mb-4 text-xl font-bold tracking-tight">{day.date}</h2>

          <DataTable
            title="Meals"
            headers={["#", "Meal", "Macros"]}
            rows={day.meals.map((m,i) => [
              i+1,
              m.raw,
              `P ${m.macros.protein}g · C ${m.macros.carbs}g · F ${m.macros.fat}g`
            ])}
            empty="No meals logged."
          />

          <div className="my-4 border-t" />

          <DataTable
            title="Workouts"
            headers={["#", "Lift", "Volume"]}
            rows={day.workouts.map((w,i) => [
              i+1,
              w.exercise,
              `${w.sets}×${w.reps} @ ${w.weight} lb  = ${w.sets*w.reps*w.weight} lb`
            ])}
            empty="No workouts logged."
          />

          <Stats day={day.kpis} />
        </section>
      ))}

      {/* overall totals */}
      <footer className="rounded-xl border bg-white/70 p-4 text-sm shadow-sm">
        <strong>Totals (range: {range})</strong> – Protein {data.totals.protein} g ·
        Calories {data.totals.kcal} kcal · Volume {data.totals.volume} lb
      </footer>
    </main>
  );
}

/* ---------- sub‑components ---------- */

function DataTable({ title, headers, rows, empty }) {
  return (
    <div className="space-y-2">
      <h3 className="font-medium">{title}</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            {headers.map(h => (
              <th key={h} className="px-2 py-1 text-left font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={headers.length}
                    className="px-2 py-3 text-gray-400 italic">{empty}</td></tr>
          ) : (
            rows.map((cells,i) => (
              <tr key={i}
                  className={i % 2 ? "bg-gray-50/40" : undefined}>
                {cells.map((c,j) => (
                  <td key={j} className="px-2 py-1 align-top">{c}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function Stats({ day }) {
  return (
    <div className="mt-4 grid grid-cols-3 gap-4 text-xs text-gray-600">
      <Stat label="Protein" value={`${day.protein} g`}
            hit={day.proteinHit} />
      <Stat label="Calories" value={`${day.kcal} kcal`} />
      <Stat label="Volume"   value={`${day.volume} lb`} />
    </div>
  );
}
function Stat({ label, value, hit }) {
  return (
    <div className="flex flex-col rounded border p-2">
      <span className="text-[10px] uppercase tracking-wide">{label}</span>
      <span className="font-semibold">
        {value} {hit!==undefined && (hit ? "✅" : "❌")}
      </span>
    </div>
  );
}
