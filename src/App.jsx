import { useState } from "react";
import Dashboard from "./components/Dashboard";  // 🆕 import DailyTable
import "./App.css";

export default function App() {
  const [input, setInput]       = useState("");
  const [messages, setMessages] = useState([]);
  const [showTable, setShow]     = useState(false);  // 🆕 toggle for table

  const send = async () => {
    if (!input.trim()) return;

    setMessages(m => [...m, { from: "you", text: input }]);

    if (input.trim().toLowerCase() === "/summary") {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const r = await fetch(`/api/day?date=${today}`);
        const j = await r.json();

        setMessages(m => [
          ...m,
          { from: "bot", text: j.summary || "⚠️ No summary available" }
        ]);
      } catch (err) {
        console.error(err);
        setMessages(m => [...m, { from: "bot", text: "⚠️ Error fetching summary" }]);
      }

      setInput("");
      return;
    }
    if (input.trim().toLowerCase().startsWith("/parse log")) {
      const rawText = input.replace(/^\/parse log\s*/i, "").trim();
      try {
        const r = await fetch("/api/parse-log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: rawText })
        });
        const data = await r.json();

        const lines = data.results.map(m =>
          m.error
            ? `❌ ${m.raw} – ${m.error}`
            : `✅ ${m.raw} → P ${m.macros.protein}g / C ${m.macros.carbs}g / F ${m.macros.fat}g (${m.macros.kcal} kcal)`
        ).join("\n");

        const totalLine =
          `\n**Total:** ${data.total.protein}g P • ${data.total.carbs}g C • ${data.total.fat}g F (${data.total.kcal} kcal)`;

        setMessages(m => [
          ...m,
          { from: "bot", text: `${lines}${totalLine}`.split("\n") }
        ]);

      } catch (err) {
        console.error(err);
        setMessages(m => [...m, { from: "bot", text: "⚠️ Error parsing log" }]);
      }

      setInput("");
      return;
    }


    // Fallback to normal POST /api/message
    try {
      const r = await fetch("/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input })
      });
      const data = await r.json();

      setMessages(m => [
        ...m,
        { from: "bot", text: data.reply || `⚠️ ${data.error}` }
      ]);
    } catch (err) {
      setMessages(m => [...m, { from: "bot", text: "⚠️ network error" }]);
      console.error(err);
    }

    setInput("");
  };


  const ChatUI = (
    <div className="chat">
      <div className="msgs">
        {messages.map((m, i) => (
          <div key={i} className={m.from}>
            <b>{m.from}:</b>{" "}
            {Array.isArray(m.text)
              ? m.text.map((line, j) => <div key={j}>{line}</div>)
              : m.text}
          </div>
        ))}

      </div>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="/log meal 2 eggs"
        onKeyDown={e => e.key === "Enter" && send()}
      />
      <button onClick={send}>Send</button>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setShow(!showTable)}
        className="absolute top-2 right-2 px-3 py-1 bg-slate-800 text-white rounded"
      >
        {showTable ? "Chat" : "Today"}
      </button>

      {showTable
        ? <Dashboard />
        : ChatUI}
    </>
  );
}
