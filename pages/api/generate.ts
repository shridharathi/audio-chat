import { Ratelimit } from "@upstash/ratelimit";
import type { NextApiRequest, NextApiResponse } from "next";
import redis from "../../utils/redis";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import prisma from "../../lib/prismadb";

type Data = string;
interface ExtendedNextApiRequest extends NextApiRequest {
  body: {
    imageUrl: string;
    prompt: string;
  };
}

// Create a new ratelimiter, that allows 5 requests per day
/*
const ratelimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.fixedWindow(5, "0 m"),
      analytics: true,
    })
  : undefined;
*/

export default async function handler(
  req: ExtendedNextApiRequest,
  res: NextApiResponse<Data>
) {
  // Check if user is logged in
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(500).json("Login to upload.");
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
    return res.status(400).json(`You have no generations left`);
  }


  

  //const versionId = "2bca10ed539cf2196f18b4ec85128a80355d94934db8620884ecca552cdc4def";
  const versionId = "3bb13fe1c33c35987b33792b01b71ed6529d03f165d1c2416375859f09ca9fef";
  const imageUrl = req.body.imageUrl;
  const prompt = req.body.prompt;
  const img2img = true;
  const condition_scale = 0.6;
  const strength = 0.9;
  const guidance_scale = 18.28;
  const refine = "no_refiner";
  const scheduler = "K_EULER";
  const lora_scale = 0.95;
  const lora_weights = "https://pbxt.replicate.delivery/mwN3AFyYZyouOB03Uhw8ubKW9rpqMgdtL9zYV9GF2WGDiwbE/trained_model.tar";
  const refine_steps = 20;
  const num_inference_steps = 30;



  //const negativePrompt = "worst quality, low quality, lowres, watermark, banner, logo, watermark, contactinfo, text, deformed, blurry, blur, out of focus, out of frame, surreal, extra, ugly";
  //const aPrompt = "room, bedroom, bathroom, kitchen, dining room, realistic, cinematic photo, highly detailed, cinematic lighting, ultra-detailed, ultrarealistic, photorealism, 8k., masterpiece, cinematic light, ultrarealistic+, photorealistic+, 8k, raw photo, realistic, hyperrealistic, highest quality, best quality, highly detailed, masterpiece, best quality, extremely detailed 8k wallpaper, masterpiece, best quality, ultra-detailed, best shadow, detailed background, high contrast, best illumination, detailed face, dulux, caustic, dynamic angle, detailed glow. dramatic lighting, highly detailed, insanely detailed hair, symmetrical, intricate details, professionally retouched, 8k high definition. strong bokeh. award winning photo.";
  const timeoutDuration = 12000;
  
  // POST request to Replicate to start the image restoration generation process
  let startResponse = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Token " + process.env.REPLICATE_API_KEY,
    },
    body: JSON.stringify({
      version: versionId,
      input: { image: imageUrl, prompt: prompt, img2img: img2img, condition_scale: condition_scale, strength: strength, guidance_scale: guidance_scale, refine: refine, scheduler: scheduler, lora_scale: lora_scale, lora_weights: lora_weights, refine_steps: refine_steps, num_inference_steps: num_inference_steps },
    }),
  });

  let jsonStartResponse = await startResponse.json();
  let endpointUrl = jsonStartResponse.urls.get;

  // GET request to get the status of the image restoration process & return the result when it's ready
  let restoredImage: string | null = null;
  while (!restoredImage) {
    // Loop in 1s intervals until the alt text is ready
    console.log("polling for result...");
    let finalResponse = await fetch(endpointUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Token " + process.env.REPLICATE_API_KEY,
      },
    });
    let jsonFinalResponse = await finalResponse.json();
    console.log(jsonFinalResponse)

    if (jsonFinalResponse.status === "succeeded") {
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
      restoredImage = jsonFinalResponse.output;
    } else if (jsonFinalResponse.status === "failed") {
      console.log("failed");
      break;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  res
    .status(200)
    .json(restoredImage ? restoredImage : "Failed to restore image");
}
