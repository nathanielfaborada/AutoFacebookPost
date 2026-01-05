import { InferenceClient } from "@huggingface/inference";
import fs from "fs";
import axios from "axios";
import FormData from "form-data";

const FB_PAGE_ID = process.env.FB_PAGE_ID;
const FB_PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
const HF_TOKEN = process.env.HF_TOKEN;

const client = new InferenceClient(HF_TOKEN);

async function generateImage() {
  const image = await client.textToImage({
    provider: "fal-ai",
    model: "Qwen/Qwen-Image-2512",
    inputs: "Astronaut riding a horse",
    parameters: {
      num_inference_steps: 5,
    },
  });

  // image is a Blob
  const buffer = Buffer.from(await image.arrayBuffer());
  fs.writeFileSync("astronaut.png", buffer);

  console.log("✅ Image generated: astronaut.png");
  return "astronaut.png";
}

async function postImageToFacebook(imagePath) {
  const url = `https://graph.facebook.com/v24.0/${FB_PAGE_ID}/photos`;

  const form = new FormData();
  form.append("source", fs.createReadStream(imagePath));
  form.append("message", "🚀 Astronaut riding a horse 🐎");
  form.append("access_token", FB_PAGE_ACCESS_TOKEN);

  const res = await axios.post(url, form, {
    headers: {
      ...form.getHeaders(),
    },
  });

  console.log("✅ Posted to Facebook:", res.data.id);
}

async function run() {
  const imagePath = await generateImage();
  await postImageToFacebook(imagePath);
}

run().catch(console.error);
