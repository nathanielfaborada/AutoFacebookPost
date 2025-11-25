import "dotenv/config";
import axios from "axios";
import { GoogleGenAI } from "@google/genai";

import schedule from "node-schedule";

const ai = new GoogleGenAI({ apiKey: process.env.OPENAI_API_KEY });

// Facebook credentials
const FB_PAGE_ID = process.env.FB_PAGE_ID;
const FB_PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;


async function generateCaption() {

    const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Generate a short and engaging social media caption for a post about life motivation. The caption should be inspiring and encourage followers to stay active and live longer. Use emojis to make it more appealing. In 2 sentences.",
  });
//   console.log(response.text);
  return response.text;
}

async function postToFacebook(caption) {
  if (!caption) return;

  const url = `https://graph.facebook.com/v24.0/${FB_PAGE_ID}/feed`;

  try {
    const res = await axios.post(
      url,
      {
        message: caption,
        access_token: FB_PAGE_ACCESS_TOKEN,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Posted successfully! Post ID:", res.data.id);
  } catch (err) {
    console.error("Error posting to Facebook:", err.response?.data || err.message);
  }
}

// Main function
async function run() {
  
  const caption = await generateCaption();

  console.log("Caption:\n", caption);
  console.log("Posting to Facebook...");
  await postToFacebook(caption);
}

run();

schedule.scheduleJob('0 * * * *', () => {
  console.log("Scheduled job triggered at", new Date().toLocaleString());
  run(); // your function that generates caption and posts to FB
});
