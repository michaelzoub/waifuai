import { NextRequest, NextResponse } from "next/server";
import { sendMsgToOpenAI } from "@/app/services/openai";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Load the API key from the environment
  });

  async function toElevenLabs(msgToSend: string) {
    const options = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: '{"text":"<string>","model_id":"<string>","language_code":"<string>","voice_settings":{"stability":123,"similarity_boost":123,"style":123,"use_speaker_boost":true},"pronunciation_dictionary_locators":[{"pronunciation_dictionary_id":"<string>","version_id":"<string>"}],"seed":123,"previous_text":"<string>","next_text":"<string>","previous_request_ids":["<string>"],"next_request_ids":["<string>"],"use_pvc_as_ivc":true,"apply_text_normalization":"auto"}'
    };
    
    fetch('https://api.elevenlabs.io/v1/text-to-speech/{voice_id}', options)
      .then(response => response.json())
      .then(response => console.log(response))
      .catch(err => console.error(err));
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