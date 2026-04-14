const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI("AIzaSyCTpvANtlJFrYNG6FDZtQSIqOgM8Y3t-_8");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

let users = [{ name: "Suraj", email: "test@test.com", password: "123" }];

app.post("/api/signup", (req, res) => {
    const { name, email, password } = req.body;
    if (users.find(u => u.email === email)) return res.json({ success: false, message: "User already exists!" });
    users.push({ name, email, password });
    res.json({ success: true, message: "Account Created! Now Login." });
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
        const result = await model.generateContent(`Short answer: ${message}`);
        res.json({ reply: result.response.text() });
    } catch (err) { res.json({ reply: "AI is busy. Fact: Newton's 1st law is Law of Inertia." }); }
});

app.post("/api/quiz", async (req, res) => {
    try {
        const { topic } = req.body;
        const result = await model.generateContent(`Generate 3 MCQs on ${topic} with answers.`);
        res.json({ quiz: result.response.text() });
    } catch (err) { res.json({ quiz: "Try another topic like Science or History." }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Live on ${PORT}`));
