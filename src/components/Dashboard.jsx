import { useState, useEffect } from "react";

export default function Dashboard() {
  const [range, setRange] = useState("day");
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const r = await fetch(`/api/dashboard?range=${range}`);
      const j = await r.json();
      setData(j);
    };
    fetchData();
  }, [range]);

  const Button = ({ value }) => (
    <button
      className={`px-3 py-1 rounded border 
        ${range === value ? "bg-blue-600 text-white" : "bg-gray-200"}`}
      onClick={() => setRange(value)}
    >
      {value.charAt(0).toUpperCase() + value.slice(1)}
    </button>
  );

  if (!data) return <p className="p-4">Loading dashboard...</p>;

  return (
    <div className="p-4 space-y-6">
      <div className="space-x-2">
        <Button value="day" />
        <Button value="week" />
        <Button value="month" />
      </div>

      {data.days.map((d, i) => (
        <div key={i} className="border p-3 rounded bg-white shadow-sm">
          <h2 className="font-semibold text-lg mb-2">{d.date}</h2>

          {/* Meals Table */}
          <table className="w-full text-sm mb-3">
            <thead><tr><th>#</th><th>Meal</th><th>Macros</th></tr></thead>
            <tbody>
              {d.meals.length === 0 ? (
                <tr><td colSpan="3" className="text-gray-400 italic py-2">No meals logged for this day.</td></tr>
              ) : (
                d.meals.map((m, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{m.raw}</td>
                    <td>P {m.macros.protein}g / C {m.macros.carbs}g / F {m.macros.fat}g</td>
                  </tr>
                ))
              )}
            </tbody>

          </table>

          {/* Workouts Table */}
          <table className="w-full text-sm">
            <thead><tr><th>#</th><th>Workout</th><th>Volume</th></tr></thead>
            <tbody>
              {d.workouts.length === 0 ? (
                <tr><td colSpan="3" className="text-gray-400 italic py-2">No workouts logged.</td></tr>
              ) : (
                d.workouts.map((w, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{w.exercise}</td>
                    <td>{w.sets}×{w.reps} @ {w.weight} = {w.sets * w.reps * w.weight} lbs</td>
                  </tr>
                ))
              )}
            </tbody>

          </table>

          {/* Per-Day Totals */}
          <div className="text-sm mt-2 text-gray-800">
            <strong>Totals:</strong><br />
            Protein: {d.kpis.protein}g{" "}
            {d.kpis.proteinHit ? "✅ Hit goal" : "❌ Missed"}<br />
            Calories: {d.kpis.kcal} kcal<br />
            Volume Lifted: {d.kpis.volume} lbs
          </div>
        </div>
      ))}


      <div className="mt-4 text-sm text-gray-700">
        <strong>Totals:</strong> <br />
        Protein: {data.totals.protein}g, Calories: {data.totals.kcal} kcal <br />
        Volume Lifted: {data.totals.volume} lbs
      </div>
    </div>
  );
}
