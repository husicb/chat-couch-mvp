# Chat-Coach MVP 🏋️🍳

*A chat-first meal & workout tracker built in public in **7 days***  

---

## Product Promise

For people who already talk to AI about their meals and workouts, **Chat-Coach** is a lightweight web app that feels exactly like texting your own assistant.  
Type one line to log a meal or workout and get instant macros, KPIs, and a daily PDF summary—no spreadsheets, no clunky fitness UI.

---

## Day-7 Launch Must-Haves 🚀

| # | User story | Example slash-command |
|---|------------|-----------------------|
| 1 | **Log a meal** | `/log meal 3 eggs and oatmeal` |
| 2 | **Log a workout** | `/log workout bench 5x5 185` |
| 3 | **Ask today’s progress** | `/summary today` |
| 4 | **Download daily report** | One-click PDF export |

Everything else is ice-cream for v1.1.

---

## Tech Stack (MVP)

| Layer | Choice | Why |
|-------|--------|-----|
| Chat UI | React + Vite | Fast & light |
| AI brain | OpenAI Assistants API | Handles chat history + function calls |
| Data store | Replit DB | Zero-config key-value for early stage |
| Nutrition | Spoonacular REST | Quick macros lookup |
| PDF | jsPDF + html2canvas | Client-side export |

---

## Run Locally (dev)

```bash
# 1. clone & install
git clone https://github.com/husicb/chat-coach-mvp.git
cd chat-coach-mvp && npm install

# 2. add secrets
cp .env.example .env  # then fill OPENAI_API_KEY, SPOONACULAR_KEY, REPLIT_DB_URL

# 3. start dev server
npm run dev
```

## Build Logs

**Day 0 (2025-04-26):** Repl scaffolded, GitHub repo live, Issues board with 4 MVP cards.  
Tweet → https://x.com/your-tweet-url

(daily updates will be appended here)

## License

MIT © 2025 Belmin Husic
