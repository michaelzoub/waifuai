import { NextRequest, NextResponse } from "next/server";
import { sendMsgToOpenAI } from "@/app/services/openai";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Load the API key from the environment
  });


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
        const voicemsg = await main(receivedWaifuMsg)
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