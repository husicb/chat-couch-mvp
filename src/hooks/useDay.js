import { useEffect, useState } from "react";

export default function useDay(date) {
  const [data,   setData] = useState(null);
  const [error,  setErr ] = useState(null);

  useEffect(() => {
    let ignore = false;
    setData(null); setErr(null);

    const q = date ? `?date=${encodeURIComponent(date)}` : "";
    fetch(`/api/day${q}`)
      .then(async r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(j => { if (!ignore) setData(j); })
      .catch(e => { if (!ignore) setErr(e); });

    return () => { ignore = true };
  }, [date]);

  return { data, error, loading: !data && !error };
}
