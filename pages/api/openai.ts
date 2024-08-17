
import OpenAI from 'openai';
import type { NextApiRequest, NextApiResponse } from 'next';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
  
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  
    const { messages } = req.body; //
  
    try {
      console.log(messages);
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages,
      });
      console.log(completion);
      const choice = completion.choices[0];
      const messageContent = choice.message.content;
      
  
      return res.status(200).json(messageContent);
    } catch (error) {
      return res.status(500).json({ error: "Oh no! Something went wrong." });
    }
  }