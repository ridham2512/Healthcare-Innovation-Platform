# 🎤 Interview Prep — LifeSync Healthcare AI Project

---

## 🚀 Your 30-Second Elevator Pitch

> "I built **LifeSync**, an AI-powered personal healthcare management web app. Users can log in securely, create medical record folders, upload their medical reports or scans, and the app uses **Google Gemini AI** to analyze the document and generate a personalized treatment plan. That treatment plan is then automatically converted into an interactive **Kanban board** so users can track their health tasks step by step. The whole app is serverless — no traditional backend — using a cloud Postgres database directly from the frontend."

---

## 🧠 Tech Choices — "Why did you use X?"

### ❓ Why React + Vite?
> "React gives me a component-based structure that's perfect for a dashboard app with many reusable parts like cards, modals, and the Kanban board. I used Vite instead of Create React App because it's significantly faster — near-instant dev server startup and hot module replacement."

### ❓ Why Privy for authentication?
> "Privy is an auth provider built for Web3 apps. It supports traditional social/email login but also automatically creates an **embedded crypto wallet** for users who don't have one. This makes the app Web3-ready without forcing users to install MetaMask. It's plug-and-play — I just wrap the app in `<PrivyProvider>` and get `user`, `authenticated`, `login()`, `logout()` instantly."

### ❓ Why Neon + Drizzle ORM instead of Firebase or Supabase?
> "Neon is a **serverless PostgreSQL** database — it scales to zero when not in use and connects over HTTP, which means I can query it directly from the browser without spinning up a backend server. Drizzle ORM gives me **type-safe queries in plain JavaScript** — it feels like writing SQL but with autocomplete. I defined the schema in code and used `drizzle-kit push` to apply it to the database."

### ❓ Why Google Gemini instead of OpenAI?
> "Gemini 1.5 Pro supports **multimodal input** — it can accept both text and images/files in the same API call. Since my app analyzes medical reports and scans (images), Gemini was the natural choice. OpenAI's GPT-4V does the same but Gemini's API was more straightforward to integrate for inline Base64 image data."

### ❓ Why React Context instead of Redux?
> "The app's global state is relatively simple — just the current user, their records list, and a handful of DB operations. Redux adds a lot of boilerplate for that. React Context with `useContext` was clean and sufficient. I wrapped the whole app in a `StateContextProvider` and every component can access the state via the `useStateContext()` hook."

### ❓ Why @dnd-kit for the Kanban board?
> "I chose `@dnd-kit` over react-beautiful-dnd because it's more actively maintained, has better accessibility support, and works without any deprecated APIs. It gives me full control over drag sensors, collision detection, and the drag overlay animation."

---

## 🔄 How The App Works — Feature by Feature

### 🔐 Authentication Flow
1. App loads → Privy checks if user is authenticated
2. If **not authenticated** → Privy login modal opens automatically
3. If **authenticated but new user** (no DB record) → redirected to `/onboarding`
4. User fills name, age, location → saved to Neon DB → redirected to dashboard
5. On every login, the app fetches the user's records from DB

### 📁 Medical Records
- User creates a "record folder" (like a named container for one health condition)
- Each record is a row in the `records` table in PostgreSQL
- Records list is fetched filtered by the user's email address

### 🤖 AI Diagnosis (The Core Feature)
1. User opens a record and clicks **"Upload Reports"**
2. Selects a medical image or document
3. Frontend converts file to **Base64** using `FileReader` API
4. Sends Base64 data + a diagnosis prompt to **Gemini 1.5 Pro**
5. Gemini returns a detailed treatment plan as **Markdown text**
6. Result is displayed using `react-markdown` and saved to DB

### 📋 Treatment Plan → Kanban
1. User clicks **"View Treatment Plan"**
2. A second Gemini call takes the treatment text and asks it to structure tasks as JSON:
   - Columns: `Todo`, `Work in Progress`, `Done`
   - Each task has an `id`, `columnId`, and `content`
3. The JSON is saved to DB and user is navigated to the Kanban page
4. The **Kanban board** renders with drag-and-drop functionality

---

## 🗄️ Database Design — "Explain your schema"

> "I have two tables. The `users` table stores profile info — username, age, location, and the email as the identifier (since Privy gives us the email). The `records` table stores each medical record folder, linked to a user by `userId`. Each record has `analysisResult` (the AI-generated diagnosis text) and `kanbanRecords` (the AI-generated task JSON stored as a string). Both tables use a serial primary key."

---

## 🏗️ Architecture — "How is the app structured?"

> "It's a single-page React app with client-side routing. There's no dedicated backend server — the frontend connects directly to a serverless Neon Postgres database using Drizzle ORM's HTTP driver. All global state and database operations live in a React Context provider. The AI calls go directly from the browser to the Google Gemini API. It's deployed as a static bundle to Thirdweb's IPFS hosting."

```
Browser → Privy (auth) → React App
                              ↓           ↓
                        Neon DB      Google Gemini AI
```

---

## 🌊 Data Flow — "Walk me through a user request"

> "When a user uploads a medical file, the file is read as Base64 in the browser. That Base64 string along with a medical analysis prompt is sent to the Gemini API. Gemini responds with a treatment plan. We then update the corresponding record row in Neon DB with that analysis text. When the user clicks 'View Treatment Plan', we make another Gemini call with the treatment text, asking for a structured JSON of tasks. We parse that JSON, save it to the DB, and navigate to the Kanban page passing the data via React Router's location state."

---

## 💪 Challenges & How You Solved Them

### Challenge 1 — Handling File Upload for AI
> "The Gemini API accepts images as Base64-encoded strings with a MIME type. I used the browser's built-in `FileReader` API to convert the file to a data URL, then split it to extract just the Base64 part. No file storage service needed."

### Challenge 2 — Making AI Output Parseable
> "Gemini's response for the Kanban tasks needed to be valid JSON. I crafted a very explicit prompt specifying the exact JSON structure I wanted, with no extra text or quotes around it. Then I used `JSON.parse()` on the response. This kind of prompt engineering is important when working with LLMs."

### Challenge 3 — Serverless DB without a Backend
> "Neon's serverless PostgreSQL works over HTTP, so I can use it from the browser. Drizzle ORM's `neon-http` driver makes this seamless. The tradeoff is the DB credentials are in the client — for production, this would need to be behind an API route."

### Challenge 4 — Drag and Drop Between Columns
> "With `@dnd-kit`, I needed to handle three events: `onDragStart`, `onDragOver`, and `onDragEnd`. The tricky part was detecting when a task is dragged from one column to another vs. reordered within the same column. I solved this by comparing `columnId` before and after the move."

---

## ❓ Likely Interview Questions + Quick Answers

| Question | Answer |
|---|---|
| **What does this project do?** | AI-powered healthcare app — upload medical reports → get AI diagnosis → manage treatment as Kanban tasks |
| **What's the most complex feature?** | The AI pipeline — Base64 file encoding → Gemini multimodal call → markdown display → second Gemini call for structured Kanban JSON |
| **How do you handle auth?** | Privy wraps the app, checks `authenticated` state, auto-redirects to login or onboarding |
| **Why no backend?** | Neon serverless PG supports HTTP queries from browser; Gemini is a REST API — no server needed for this scale |
| **How do you manage state?** | React Context with a single provider — exposes user, records, and all CRUD functions |
| **What would you improve?** | Move DB connection to a serverless API route (Next.js API or Express), add proper error boundaries, add user-level encryption for medical data |
| **Is this secure?** | For a demo, no — DB URL is hardcoded. In production, I'd proxy all DB calls through a backend API and use environment secrets server-side |
| **How does Gemini AI work here?** | It's a multimodal model — I send it image data + text prompt in one API call, it returns analysis text. For Kanban, I send text-only with a structured output prompt |
| **What is Drizzle ORM?** | A lightweight TypeScript/JS ORM for SQL databases. Schema is defined in code, `drizzle-kit push` applies it. Queries feel like SQL but are type-safe |
| **What is Privy?** | An auth SDK that supports email, social, and crypto wallet logins. It creates embedded wallets for Web3 apps automatically |

---

## 🎯 Key Phrases to Sound Confident

- *"I used a serverless architecture — no traditional Express/Node backend"*
- *"The AI pipeline is fully client-side — Base64 encoding, Gemini API call, JSON parsing"*
- *"I did prompt engineering to ensure Gemini returned parseable JSON for the Kanban board"*
- *"Drizzle ORM gave me type-safe database queries with a schema-first approach"*
- *"Privy handles the entire auth lifecycle — I just check `authenticated` and `user` from the hook"*
- *"The Kanban board uses @dnd-kit with drag sensors and collision detection for smooth UX"*
- *"I separated concerns clearly — context for state/data, pages for UI logic, components for reusability"*
