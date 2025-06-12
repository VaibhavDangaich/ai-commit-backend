// index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/generate', async (req, res) => {
    const { diff } = req.body;

    if (!diff) {
        return res.status(400).json({ error: 'Missing diff data' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `Generate a concise Git commit message based on the following staged diff:\n\n${diff}`;
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        res.json({ message: text.trim() });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Failed to generate commit message' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));