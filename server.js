const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

/* DATABASE FILE */

const DB_FILE = "database.json";

/* Create database if not exists */

if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], notes: [] }, null, 2));
}

/* DATABASE FUNCTIONS */

function readDB() {
  try {
    const data = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return { users: [], notes: [] };
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

/* SIGNUP */

app.post("/api/signup", (req, res) => {

  const { name, email, password } = req.body;

  let db = readDB();

  const existing = db.users.find(u => u.email === email);

  if (existing) {
    return res.json({ success: false, message: "User already exists" });
  }

  const newUser = {
    id: uuidv4(),
    name,
    email,
    password
  };

  db.users.push(newUser);

  writeDB(db);

  res.json({ success: true, message: "Account created" });

});

/* LOGIN */

app.post("/api/login", (req, res) => {

  const { email, password } = req.body;

  let db = readDB();

  const user = db.users.find(
    u => u.email === email && u.password === password
  );

  if (!user) {
    return res.json({ success: false, message: "Invalid login" });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });

});

/* AI TUTOR */

app.post("/api/chat", (req, res) => {

  const { message } = req.body;

  let reply = "";

  if (message.toLowerCase().includes("math")) {
    reply = "Math is the study of numbers, quantities and shapes.";
  }
  else if (message.toLowerCase().includes("physics")) {
    reply = "Physics studies matter, energy and natural laws.";
  }
  else {
    reply = "AI Tutor: " + message;
  }

  res.json({ reply });

});

/* SAVE NOTES */

app.post("/api/notes/save", (req, res) => {

  const { userId, notes } = req.body;

  let db = readDB();

  db.notes.push({
    id: uuidv4(),
    userId,
    notes
  });

  writeDB(db);

  res.json({ success: true });

});

/* GET NOTES */

app.get("/api/notes/:userId", (req, res) => {

  let db = readDB();

  const userNotes = db.notes.filter(
    n => n.userId === req.params.userId
  );

  res.json(userNotes);

});

/* QUIZ GENERATOR */

app.post("/api/quiz", (req, res) => {

  const { topic } = req.body;

  const quiz = [
    { q: `What is ${topic}?`, a: "Definition based answer" },
    { q: `Explain the concept of ${topic}.`, a: "Concept explanation" },
    { q: `Why is ${topic} important?`, a: "Importance explanation" }
  ];

  res.json({ quiz });

});

/* STUDY PLANNER */

app.post("/api/planner", (req, res) => {

  const { subjects, hours } = req.body;

  const each = hours / subjects.length;

  const plan = subjects.map(s => ({
    subject: s,
    hours: each
  }));

  res.json({ plan });

});

/* ATTENDANCE */

app.get("/api/attendance", (req, res) => {

  const attendance = [
    { subject: "Math", percent: 85 },
    { subject: "Physics", percent: 75 },
    { subject: "Chemistry", percent: 90 }
  ];

  res.json(attendance);

});

/* PROGRESS */

app.get("/api/progress", (req, res) => {

  const progress = [
    { subject: "Math", progress: 70 },
    { subject: "Physics", progress: 60 },
    { subject: "Chemistry", progress: 80 }
  ];

  res.json(progress);

});

/* START SERVER */

app.listen(PORT, () => {
  console.log(`Companion AI backend running at http://localhost:${PORT}`);
});