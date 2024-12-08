// Import necessary modules
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

// Initialize the express app
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// OpenAI https://platform.openai.com/docs/libraries/node-js-library
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY // This is also the default, can be omitted
});


const generateFortune = async (birthDate, birthTime, concerns) => {
    const prompt = `Based on the following details, provide a fortune and advice for 2025:\n\nBirth Date: ${birthDate}\nBirth Time: ${birthTime}\nConcerns: ${concerns}\n\nOutput:`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", 
            messages: [
                { role: "system", content: "너는 유저가 태어난 연도와 시간을 기반으로 내년도 운세를 봐주는 사람이야. 너가 작성해줘야하는 것은 크게 세 가지야. 유저가 입력한 고민에 대한 공감과 위로의 메시지 3줄, 2025년도 종합 신년운세 요약. 2025년도 종합 신년운세 요약은 직업운, 재물운, 연애운, 건강운 4가지를 봐주고, 각각 5줄로 작성해." },
                { role: "user", content: prompt },
            ],
            max_tokens: 1024,
            temperature: 0.7,
        });

        const aiResponse = response.choices[0].message;

        return {
            advice: aiResponse,
            personalizedMessage: `Based on your birthdate (${birthDate}) and time (${birthTime}), and your concerns ('${concerns}'), here's some advice: ${aiResponse}`,
        };
    } catch (error) {
        console.error("Error calling OpenAI API:", error);
        throw new Error("Failed to fetch fortune from OpenAI API.");
    }
};

// API endpoint
app.post('/api/fortune', async (req, res) => {
    const { name, birthDate, birthTime, concerns } = req.body;

    if (!name || !birthDate || !birthTime || !concerns) {
        return res.status(400).json({ error: "All fields (name, birthDate, birthTime, concerns) are required." });
    }

    try {
        const fortune = await generateFortune(birthDate, birthTime, concerns);

        res.status(200).json({
            name,
            fortune,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
