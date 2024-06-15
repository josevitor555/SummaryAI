import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ElevenLabsClient } from "elevenlabs";

const apiKey = process.env.GOOGLE_API_KEY;
const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;

const genAI = new GoogleGenerativeAI(apiKey);
const elevenlabs = new ElevenLabsClient({ apiKey: elevenLabsApiKey });

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

const app = express();
const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

app.get('/', async function(request, response) {
    response.sendFile('index.html', {
        root: path.join(__dirname, 'public')
    });
});

app.post('/summarize', upload.single('file'), async (req, res) => {
    const filePath = req.file.path;
    const audioFilePath = path.resolve(__dirname, 'public', 'summary_speech.mp3');

    try {
        const content = await fs.readFile(filePath, 'utf-8');
        const prompt = `Resume o seguinte conteúdo: \n\n${content}`;
        
        const result = await model.generateContent(prompt, generationConfig);
        const responseAI = await result.response;
        const summary = await responseAI.text();

        const audio = await elevenlabs.generate({
            voice: "Serena",
            text: summary,
            model_id: "eleven_multilingual_v2"
        });

        await fs.writeFile(audioFilePath, audio);

        res.json({ summary, audioUrl: `/summary_speech.mp3`});
    } catch (error) {
        console.log(`Error during AI content generation: ${error.message}`);
        res.status(500).send(`Error generating summary and audio: ${error.message}`);
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
    console.log(`Running on port ${PORT}`);
});
