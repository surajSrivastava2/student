const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

// GEMINI CONFIGURATION (Key integrated)
const genAI = new GoogleGenerativeAI("AIzaSyCTpvANtlJFrYNG6FDZtQSIqOgM8Y3t-_8");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/* DATABASE FILE */
const DB_FILE = "database.json";
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], notes: [] }, null, 2));
}

function readDB() {
  try {
    const data = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(data);
  } catch { return { users: [], notes: [] }; }
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

/* AUTHENTICATION */
app.post("/api/signup", (req, res) => {
  const { name, email, password } = req.body;
  let db = readDB();
  if (db.users.find(u => u.email === email)) return res.json({ success: false, message: "User already exists" });
  const newUser = { id: uuidv4(), name, email, password };
  db.users.push(newUser);
  writeDB(db);
  res.json({ success: true, message: "Account created" });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  let db = readDB();
  const user = db.users.find(u => u.email === email && u.password === password);
  if (!user) return res.json({ success: false, message: "Invalid login" });
  res.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
});

/* AI TUTOR (Real AI) */
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    const result = await model.generateContent(`You are a helpful student AI tutor. Answer this shortly: ${message}`);
    const response = await result.response;
    res.json({ reply: response.text() });
  } catch (error) {
    res.json({ reply: "Bhai, AI server thoda slow hai, par main connected hoon!" });
  }
});

/* QUIZ GENERATOR (Dynamic AI) */
app.post("/api/quiz", async (req, res) => {
  try {
    const { topic } = req.body;
    const prompt = `Generate 3 multiple choice questions for ${topic}. Format: Question, options, and correct answer.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ quiz: response.text() });
  } catch (error) {
    res.json({ quiz: "AI couldn't generate quiz. Try again!" });
  }
});

/* BAQI FEATURES */
app.post("/api/notes/save", (req, res) => {
  const { userId, notes } = req.body;
  let db = readDB();
  db.notes.push({ id: uuidv4(), userId, notes });
  writeDB(db);
  res.json({ success: true });
});

app.get("/api/notes/:userId", (req, res) => {
  let db = readDB();
  res.json(db.notes.filter(n => n.userId === req.params.userId));
});

app.post("/api/planner", (req, res) => {
  const { subjects, hours } = req.body;
  const each = hours / subjects.length;
  res.json({ plan: subjects.map(s => ({ subject: s, hours: each })) });
});

app.get("/api/attendance", (req, res) => {
  res.json([{ subject: "Math", percent: 85 }, { subject: "Physics", percent: 75 }, { subject: "Chemistry", percent: 90 }]);
});

app.get("/api/progress", (req, res) => {
  res.json([{ subject: "Math", progress: 70 }, { subject: "Physics", progress: 60 }, { subject: "Chemistry", progress: 80 }]);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => { console.log(`Server live on port ${PORT}`); });
