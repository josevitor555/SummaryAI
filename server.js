import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

const app = express();

import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(__dirname + '/public'));
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

app.get('/', async function(request, response) {
    response.sendFile('index.html', {
        root: __dirname + '/public'
    });
});

app.post('/summarize', upload.single('file'), async (req, res) => {
    const filePath = req.file.path;

    try {
        const content = await fs.readFile(filePath, 'utf-8');
        const prompt = `Resuma o seguinte conteúdo: \n\n${content}`;

        const result = await model.generateContent(prompt, generationConfig);
        const responseAI = await result.response;
        const text = await responseAI.text();

        res.send(text);
    } catch (error) {
        console.log(`Error during AI content generation: ${error.message}`);
        res.status(500).send(`Error generating summary: ${error.message}`);
    } finally {
        try {
            await fs.unlink(filePath);
        } catch (unlinkError) {
            console.log(`Error removing temporary file: ${unlinkError.message}`);
        }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Running on ${PORT} port`);
});