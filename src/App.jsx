import { useState } from "react";
import "./App.css";

function App() {
  const [input, setInput]       = useState("");
  const [messages, setMessages] = useState([]);

  const send = async () => {
  if (!input.trim()) return;

  // show your own message
  setMessages(m => [...m, { from: "you", text: input }]);

  try {
    // 🚀 make the POST request
    const r = await fetch("/api/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input })
    });
    const data = await r.json();                   // always JSON
    // show bot reply OR error
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


  return (
    <div className="chat">
      <div className="msgs">
        {messages.map((m,i) => (
          <div key={i} className={m.from}>
            <b>{m.from}:</b> {m.text}
          </div>
        ))}
      </div>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="/log meal 2 eggs"
        onKeyDown={e => e.key==="Enter" && send()}
      />
      <button onClick={send}>Send</button>
    </div>
  );
}

export default App;
