import express from "express";
import dotenv from "dotenv";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import bodyParser from "body-parser";
import cors from 'cors'

dotenv.config();

const app = express();

app.use(bodyParser.json()); // JSON parsing middleware

app.use(cors())

app.get("/", (req, res) => res.send("hello"));

app.post("/chat", async (req, res) => {
  try {
    console.log(req.body);
    const { fromDate, toDate, interests, additionalInfo, majorDistricts } = req.body;

    const MODEL_NAME = "gemini-1.0-pro";
    const API_KEY = process.env.GEMINI_API;

    if (!API_KEY) {
      throw new Error('GEMINI_API key is not provided');
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
      temperature: 0.9,
      topK: 1,
      topP: 1,
      maxOutputTokens: 2048,
    };

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    const chat = model.startChat({
      generationConfig,
      safetySettings,
      history: [
        {
          role: "user",
          parts: [{ text: `who are you` }],
        },
        {
          role: "model",
          parts: [
            {
              text: `Prepare a travel plan from ${fromDate} to ${toDate} in districts such as ${majorDistricts}. The planning should include interests like ${interests}.${additionalInfo}. (explain detaily)`,
            },
          ],
        },
      ],
    });

    const result = await chat.sendMessage("hello");
    const response = result.response;
    console.log(response.text());

    res.status(200).send(response.text());
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
