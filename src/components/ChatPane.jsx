import { useState, useRef, useEffect } from "react";
import "./chat.css";            // we’ll create in step 3

export default function ChatPane({ sendMessage }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "system", text: "👋 Hi! Log meals or workouts here. Try /summary." }
  ]);

  const listRef = useRef(null);

  useEffect(() => {
    // auto‑scroll to newest message
    listRef.current?.scrollTo(0, listRef.current.scrollHeight);
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", text: input.trim() };
    setMessages(m => [...m, userMsg]);

    // optional: send to server & push bot reply
    Promise.resolve(sendMessage?.(input.trim()) ?? "")
      .then(botReply => {
        if (botReply) setMessages(m => [...m, { role: "bot", text: botReply }]);
      });

    setInput("");
  };

  return (
    <div className="chat-wrapper">
      {/* commands sidebar */}
      <aside className="chat-commands">
        <h3 className="cmd-title">Commands</h3>
        <ul className="cmd-list">
          <li>/log meal 3 eggs and toast</li>
          <li>/log workout bench 3x10 135lbs</li>
          <li>/summary</li>
          <li>/parse log ← paste full day</li>
          <li>/parse log @YYYY‑MM‑DD ← log other date</li>
        </ul>
      </aside>

      {/* messages */}
      <section className="chat-messages" ref={listRef}>
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role}`}>
            {m.text}
          </div>
        ))}
      </section>

      {/* input bar */}
      <footer className="chat-input-bar">
        <input
          className="chat-input"
          placeholder="Type a command…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" ? handleSend() : null}
        />
        <button className="chat-send" onClick={handleSend}>Send</button>
      </footer>
    </div>
  );
}
