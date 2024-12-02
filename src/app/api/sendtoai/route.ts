import { NextRequest, NextResponse } from "next/server";
import { sendMsgToOpenAI } from "@/app/services/openai";
import OpenAI from "openai";
import { ElevenLabsClient } from "elevenlabs";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Load the API key from the environment
  });

  const elevenLabsApi = process.env.ELEVEN_API_KEY

  async function toElevenLabs(msgToSend: string) {
    const client = new ElevenLabsClient({ apiKey: elevenLabsApi })
    const mp3: any = await client.textToSpeech.convert("PZxgznnzx62OVh3FAqVK", {
      model_id: "eleven_multilingual_v2",
      text: msgToSend,
    })
    if (mp3 instanceof ReadableStream) {
      const chunks: any = [];
      const reader = mp3.getReader();
  
      // Read the stream and collect chunks
      const readStream = async () => {
        const { done, value } = await reader.read();
        if (done) {
          // Combine chunks into a single Buffer
          const buffer = Buffer.concat(chunks);
          return buffer;
        }
  
        // Push chunk data into the chunks array
        chunks.push(value);
        return readStream();
      };
  
      return await readStream();
    } else {
      // If mp3 isn't a ReadableStream, you can return it directly
      return mp3; // or process it as needed
    }
  }


async function main(msgToSend: string) {
  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "nova",
    input: msgToSend,
  });
  const buffer = Buffer.from(await mp3.arrayBuffer());
  return buffer
}

export async function POST(req: NextRequest) {
    console.log("POST HIT")
    try {
        const body = await req.json()
        console.log(body)
        const receivedWaifuMsg: any = await sendMsgToOpenAI(body)
        const voicemsg = await toElevenLabs(receivedWaifuMsg)
        console.log(receivedWaifuMsg)
        console.log(voicemsg)
        return new NextResponse(voicemsg, {
            headers: {
                "Content-Type": "audio/mpeg",
                "Content-Disposition": `attachment; filename="speech.mp3"`,
            }
        })
    } catch {
        return NextResponse.json("wtf")
    }
}