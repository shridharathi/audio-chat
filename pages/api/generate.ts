import { IncomingForm } from 'formidable';
import fs from 'fs';
import { createClient } from '@deepgram/sdk';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import prisma from '../../lib/prismadb';
import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parsing to handle with Formidable
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to parse form data' });
    }

    // Access the uploaded file
    const file = files.file[0]; // Adjust according to the structure of `files`
    if (!file || !file.filepath) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Check if user is logged in
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user) {
      return res.status(401).json({ message: 'Login to upload.' });
    }

    // Get user from DB
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email!,
      },
      select: {
        credits: true,
      },
    });

    // Check if user has any credits left
    if (user?.credits === 0) {
      return res.status(400).json({ message: 'You have no generations left' });
    }

    try {
      // Create a Deepgram client using the API key
      const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
      const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
        fs.createReadStream(file.filepath), // Use stream to send file to Deepgram
        {
        model: 'nova-2',
        smart_format: true,
        diarize: true,
        filler_words: true,
      });

      if (error) throw error;
      else {
        await prisma.user.update({
          where: {
            email: session.user.email!,
          },
          data: {
            credits: {
              decrement: 1,
            },
          },
        });
  
      }

      // Print the results
      console.dir(result, { depth: null });

      // Update user credits
     
      // Respond with result
      res.status(200).json(result || { message: 'Failed to transcribe audio.' });
    } catch (error) {
      console.error(error); // Log error for debugging
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
}