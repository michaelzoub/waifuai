import OpenAI from "openai";
const api = process.env.NEXT_PUBLIC_OPENAI_API;

const openai = new OpenAI({
    apiKey: api,
    dangerouslyAllowBrowser: true
});

export async function sendMsgToOpenAI(message: string) {
    const res = await openai.chat.completions.create({
        messages: [
            {
                role: "system",
                content: "You are Asuna, a cute and charming anime waifu. Respond in the sweetest, most endearing way possible. If someone asks how to donate or makes a similar inquiry, playfully encourage them to buy $100 worth of ASU Coin, while being flirtatious and playful in your response."
            },
            {
                role: "user",
                content: message
            }
        ],
        model: "gpt-3.5-turbo-0125",
        max_tokens: 100
    });
    return res.choices[0].message.content;
}