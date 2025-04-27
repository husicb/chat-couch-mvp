// server.js  (root of project)
import express    from "express";
import bodyParser from "body-parser";
import { openai, assistantId } from "./openai/assistant.js";
import { logMeal }             from "./functions/logMeal.js";

const app = express();
app.use(bodyParser.json());

// ---------- POST  /api/message ---------------------------------
app.post("/api/message", async (req, res) => {
  const { text = "" } = req.body;

  /* 1. Handle slash-command directly ------------------------- */
  if (text.toLowerCase().startsWith("/log meal")) {
    const raw = text.replace(/^\/log meal\s*/i, "").trim(); // strip command
    try {
      const out = await logMeal({ raw });                   // call DB + Spoonacular
      return res.json({ reply: out.confirmation });         // 200
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message || "logMeal failed" });
    }
  }

  /* 2. Otherwise → pass through Assistant -------------------- */
  try {
    const thread = await openai.beta.threads.create();
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: text,
    });

    let run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
    });

    // poll until completed or function call required
    while (run.status === "in_progress") {
      await new Promise(r => setTimeout(r, 700));
      run = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    // (add other functions later, e.g., logWorkout)
    if (run.status === "requires_action") {
      // if future tools are added, handle them here
      return res.status(501).json({ error: "tool not implemented yet" });
    }

    // finished: send assistant reply
    const msgs  = await openai.beta.threads.messages.list(thread.id);
    const reply = msgs.data[0].content[0].text.value;
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "assistant error" });
  }
});
// ----------------------------------------------------------------

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("API listening on", PORT));
