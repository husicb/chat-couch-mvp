// src/App.jsx
import React, { useState } from "react";
import Dashboard from "./components/Dashboard.jsx";
import ChatPane  from "./components/ChatPane.jsx";

export default function App() {
  // state toggles Dashboard ↔ Chat
  const [showTable, setShowTable] = useState(true);

  // send a single‑line command to your API and return its reply
  async function sendCommand(text) {
    try {
      const res = await fetch("/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      return data.reply || data.text || "";
    } catch (err) {
      console.error(err);
      return "⚠️ network error";
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800">
      {/* toggle button */}
      <button
        onClick={() => setShowTable(!showTable)}
        className="fixed top-3 right-3 z-10 rounded bg-blue-600 px-3 py-1
                   text-sm font-semibold text-white shadow hover:bg-blue-700">
        {showTable ? "Chat" : "Today"}
      </button>

      {/* main view */}
      {showTable
        ? <Dashboard />
        : <ChatPane sendMessage={sendCommand} />}
    </div>
  );
}

