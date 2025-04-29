import { useState } from "react";
import DailyTable from "./components/DailyTable";  // 🆕 import DailyTable
import "./App.css";

export default function App() {
  const [input, setInput]       = useState("");
  const [messages, setMessages] = useState([]);
  const [showTable, setShow]     = useState(false);  // 🆕 toggle for table

  const send = async () => {
    if (!input.trim()) return;

    // show your own message immediately
    setMessages(m => [...m, { from: "you", text: input }]);

    try {
      const r = await fetch("/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input })
      });
      const data = await r.json(); // always JSON

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
            <b>{m.from}:</b> {m.text}
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
        ? <DailyTable />
        : ChatUI}
    </>
  );
}
