


const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

// GEMINI CONFIG
const genAI = new GoogleGenerativeAI("AIzaSyCTpvANtlJFrYNG6FDZtQSIqOgM8Y3t-_8");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// TEMP DATABASE
let users = [{ name: "Suraj", email: "test@test.com", password: "123" }];

// ROUTES
app.post("/api/signup", (req, res) => {
    const { name, email, password } = req.body;
    if (users.find(u => u.email === email)) return res.json({ success: false, message: "User exists!" });
    users.push({ name, email, password });
    res.json({ success: true, message: "Account Created!" });
});

app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (user) res.json({ success: true, user });
    else res.json({ success: false, message: "Invalid Credentials" });
});

app.post("/api/chat", async (req, res) => {
    try {
        const { message } = req.body;
        const result = await model.generateContent(`Short answer for student: ${message}`);
        res.json({ reply: result.response.text() });
    } catch (err) { res.json({ reply: "AI Error. Newton's 1st Law: Object stays at rest unless forced." }); }
});

app.post("/api/quiz", async (req, res) => {
    try {
        const { topic } = req.body;
        const prompt = `Generate 3 MCQs on ${topic} with A,B,C,D options and Answer.`;
        const result = await model.generateContent(prompt);
        res.json({ quiz: result.response.text() });
    } catch (err) { res.json({ quiz: "Could not generate quiz. Try: Physics, Math, or History." }); }
});

app.get("/api/attendance", (req, res) => {
    res.json([{ subject: "Math", percent: 85 }, { subject: "Physics", percent: 78 }]);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server live on ${PORT}`));
