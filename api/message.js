// api/message.js  ← this file must sit in a top-level “api” folder, NOT inside src/
//
// POST  /message
// Body: { "text": "<user text>" }
// Returns: { "reply": "<assistant reply>" }  OR  { "error": "<msg>" }

import { openai, assistantId } from "../openai/assistant.js";
import { logMeal }            from "../functions/logMeal.js";

export default async (req, res) => {
  try {
    /* ---------- 1. read user text ---------- */
    const { text } = await req.json();          // { text: "..." }

    /* ---------- 2. create thread + user msg ---------- */
    const thread = await openai.beta.threads.create();
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: text
    });

    /* ---------- 3. run assistant ---------- */
    let run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId
    });

    while (run.status === "in_progress") {
      await new Promise(r => setTimeout(r, 800));
      run = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    /* ---------- 4. handle function call ---------- */
    if (run.status === "requires_action") {
      const call = run.required_action.submit_tool_outputs.tool_calls[0];

      if (call.function.name === "logMeal") {
        const result = await logMeal(
          JSON.parse(call.function.arguments)    // { raw: "3 eggs ..." }
        );

        await openai.beta.threads.runs.submitToolOutputs(thread.id, run.id, {
          tool_outputs: [
            { tool_call_id: call.id, output: JSON.stringify(result) }
          ]
        });
      }
    }

    /* ---------- 5. send assistant’s reply ---------- */
    const msgs  = await openai.beta.threads.messages.list(thread.id);
    const reply = msgs.data[0].content[0].text.value;

    return res.json({ reply });                 // 200
  } catch (err) {
    console.error("API ERROR:", err);
    return res.status(500).json({ error: err.message || "server error" });
  }
};
