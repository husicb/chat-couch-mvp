import useDay from "../hooks/useDay";

export default function DailyTable({ date }) {
  const { data, error, loading } = useDay(date);

  if (loading) return <p className="p-4">Loading …</p>;
  if (error)   return <p className="p-4 text-red-500">⚠️ {error.message}</p>;

  const Row = ({ c1, c2, c3 }) => (
    <tr className="border-b last:border-none">
      <td className="px-2 py-1 whitespace-nowrap">{c1}</td>
      <td className="px-2 py-1">{c2}</td>
      <td className="px-2 py-1 text-sm text-gray-500">{c3}</td>
    </tr>
  );

  return (
    <div className="p-4 space-y-6">
      <section>
        <h2 className="text-lg font-semibold mb-2">Meals</h2>
        <table className="w-full text-left">
          <thead><tr className="border-b"><th>#</th><th>Meal</th><th>Macros</th></tr></thead>
          <tbody>
            {(data.meals || []).map((m,i) =>
              <Row key={i}
                   c1={i+1}
                   c2={m.raw}
                   c3={`P ${m.macros.protein}g / C ${m.macros.carbs}g / F ${m.macros.fat}g`} />)}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Workouts</h2>
        <table className="w-full text-left">
          <thead><tr className="border-b"><th>#</th><th>Lift</th><th>Volume</th></tr></thead>
          <tbody>
            {(data.workouts || []).map((w,i) =>
              <Row key={i}
                   c1={i+1}
                   c2={`${w.exercise} ${w.sets}×${w.reps}@${w.weight}lb`}
                   c3={`${w.sets*w.reps*w.weight} lb`} />)}
          </tbody>
        </table>
      </section>
    </div>
  );
}
