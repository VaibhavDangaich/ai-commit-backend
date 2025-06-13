// index.js (Backend)

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } = '@google/generative-ai';

// Load environment variables from .env file (for local development)
dotenv.config();

const app = express();

// Enable Cross-Origin Resource Sharing for all origins
// In a production environment, you might want to restrict this to specific origins.
app.use(cors());

// Parse JSON request bodies with an increased limit
// The default limit is often 100kb. We are increasing it to 50MB to handle large diffs.
app.use(express.json({ limit: '50mb' })); // <--- Added this line to increase the payload limit

// Initialize Google Generative AI with the API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Define a simple root route for health check or welcome message
app.get('/', (req, res) => {
    res.send('Welcome to the Git Commit Message Generator Backend!');
});

// Define the POST /generate endpoint for generating commit messages
app.post('/generate', async (req, res) => {
    // Extract the 'diff' data from the request body
    const { diff } = req.body;

    // Validate if 'diff' data is provided
    if (!diff) {
        console.error('Error: Missing diff data in request body.');
        return res.status(400).json({ error: 'Missing diff data.' });
    }

    try {
        // Get the generative model (using gemini-1.5-flash as specified)
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Construct the prompt for the AI model
        const prompt = `Generate a concise Git commit message based on the following staged diff:\n\n${diff}`;

        // Generate content using the AI model
        const result = await model.generateContent(prompt);

        // Extract the response text
        const response = result.response;
        const text = response.text();

        // Send the generated commit message back as JSON
        res.json({ message: text.trim() });
    } catch (err) {
        // Log any errors that occur during the AI generation process
        console.error('Error generating commit message:', err);
        // Send a 500 Internal Server Error response to the client
        res.status(500).json({ error: 'Failed to generate commit message.' });
    }
});

// Set the port for the server to listen on, defaulting to 3000
const PORT = process.env.PORT || 3000;

// Start the server and log the port it's listening 
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
