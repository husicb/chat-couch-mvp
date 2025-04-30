# Chat-Coach MVP 🏋️🍳

*A chat-first meal & workout tracker built in public in **7 days***  

---

## 🚀 Product Promise

For people who already talk to AI about their meals and workouts, **Chat-Coach** is a lightweight web app that feels like texting your personal assistant.  
Type one line to log a meal or workout and get instant macros, KPIs, and a daily summary—no spreadsheets, no clunky UI.

---

## 🛠 Day-7 Launch Features

| # | Feature | Example Command |
|---|---------|------------------|
| 1 | Log a meal | `/log meal 3 eggs and toast` |
| 2 | Log a workout | `/log workout bench 5x5 185` |
| 3 | Get daily KPIs | `/summary` |
| 4 | View dashboard | Toggle → "Today" |
| 5 | Parse full-day log | `/parse log 4 eggs. Chipotle bowl. Protein shake` |

---

## 📊 Tech Stack

| Layer | Tool | Why |
|-------|------|-----|
| Chat UI | React + Vite | Fast, fluid UX |
| AI | OpenAI Assistants API | Handles natural inputs |
| Nutrition | Spoonacular API | Parses ingredients into macros |
| Storage | Replit DB | Simple, persistent key-value store |
| PDF (coming soon) | jsPDF + html2canvas | Export daily logs (v1.1) |

---

## 🧪 Run Locally

```bash
# 1. clone & install
git clone https://github.com/husicb/chat-coach-mvp.git
cd chat-coach-mvp && npm install

# 2. add secrets
cp .env.example .env  # fill in OPENAI_API_KEY, SPOONACULAR_KEY, REPLIT_DB_URL

# 3. run dev server
npm run dev
```  

## 📓 Build Logs
Day 4 – 2025-04-29

✅ Closed Issue #5 — built mini dashboard with daily/weekly/monthly toggle

✅ Closed Issue #6 — created /parse log endpoint to handle full-day meal inputs

✅ Updated Chat UI to render multi-line responses and show total macros

✅ Refactored logMeal() to return macro data for reuse

✅ Reorganized frontend state flow for toggles + chat integration



## License

MIT © 2025 Belmin Husic
