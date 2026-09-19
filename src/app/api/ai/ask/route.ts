import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY is not configured." }, { status: 503 });
  }

  const body = await request.json() as { transcript?: string; question?: string };
  if (!body.transcript?.trim() || !body.question?.trim()) {
    return NextResponse.json({ error: "A transcript and question are required." }, { status: 400 });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: "Answer questions about the meeting transcript. Be concise, cite the speaker when possible, and say when the transcript does not contain the answer." },
        { role: "user", content: `Transcript:\n${body.transcript}\n\nQuestion: ${body.question}` },
      ],
    });
    return NextResponse.json({ answer: response.choices[0]?.message.content ?? "No answer was returned." });
  } catch (error) {
    console.error("AI question failed", error);
    return NextResponse.json({ error: "AI question failed." }, { status: 502 });
  }
}
