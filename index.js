// index.js (Backend)

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables from .env file (for local development)
dotenv.config();

const app = express();

// Enable Cross-Origin Resource Sharing for all origins
app.use(cors());

// Parse JSON request bodies with an increased limit
app.use(express.json({ limit: '50mb' })); // <--- Increased payload limit

// Initialize Google Generative AI with the API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Root route (health check)
app.get('/', (req, res) => {
    res.send('Welcome to the Git Commit Message Generator Backend!');
});

// POST /generate endpoint
app.post('/generate', async (req, res) => {
    const { diff } = req.body;

    if (!diff) {
        console.error('Error: Missing diff data in request body.');
        return res.status(400).json({ error: 'Missing diff data.' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `Generate a concise Git commit message based on the following staged diff:\n\n${diff}
Give a concise primary line, then a short detailed message below it for GitHub commit details.
Do NOT use markdown, code blocks, or backticks in the commit message.`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        let text = response.text();

        // 🩹 FIX: remove any markdown formatting or code fences before returning
        text = text.replace(/```[\s\S]*?```/g, '');
        text = text.replace(/[`]/g, ''); // remove stray backticks if any
        text = text.trim();

        res.json({ message: text });
    } catch (err) {
        console.error('Error generating commit message:', err);
        res.status(500).json({ error: 'Failed to generate commit message.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
