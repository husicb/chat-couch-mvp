// src/components/DailyTable.jsx
import useDay from "../hooks/useDay";

export default function DailyTable({ date }) {
  const { data, error, loading } = useDay(date);

  if (loading) return <p className="p-6 text-gray-500">Loading…</p>;
  if (error)   return <p className="p-6 text-red-500">⚠️ {error.message}</p>;

  return (
    <main className="mx-auto max-w-2xl space-y-8 p-6">
      <h1 className="text-2xl font-bold">{date || "Today"}</h1>

      <Section title="Meals" cols={["#", "Meal", "Macros"]}
        rows={data.meals.map((m,i)=>[
          i+1,
          m.raw,
          `P ${m.macros.protein}g · C ${m.macros.carbs}g · F ${m.macros.fat}g`
        ])} />

      <Section title="Workouts" cols={["#", "Lift", "Volume"]}
        rows={data.workouts.map((w,i)=>[
          i+1,
          w.exercise,
          `${w.sets}×${w.reps}@${w.weight}lb = ${w.sets*w.reps*w.weight}lb`
        ])} />
    </main>
  );
}

/* helpers */
function Section({ title, cols, rows }) {
  return (
    <section className="space-y-2">
      <h2 className="font-medium">{title}</h2>
      <table className="w-full text-sm table-auto border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b">
            {cols.map(c => (
              <th key={c}
                  className="px-3 py-1 text-left font-semibold tracking-wide">
                {c}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={cols.length}
                  className="px-3 py-3 text-gray-400 italic">
                No data.
              </td>
            </tr>
          ) : (
            rows.map((r, i) => (
              <tr key={i}
                  className={i % 2 ? "bg-gray-50/50" : undefined}>
                {r.map((cell, j) => (
                  <td key={j}
                      className={`px-3 py-1 ${
                        j === 0 ? "w-10 text-center font-mono" : ""
                      }`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

    </section>
  );
}
