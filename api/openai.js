import OpenAI from "openai";

export default async function handler(req, res) {
  // Read your secret key from process.env (never exposed to browsers)
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  // The frontend will send us the same prompt/messages it wants to ask
  const { messages, ...options } = req.body;

  try {
    // We call OpenAI here, server-side
    const response = await openai.chat.completions.create({
      messages,
      ...options
    });
    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ error: "OpenAI request failed" });
  }
} 