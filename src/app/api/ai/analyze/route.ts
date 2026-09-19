import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY is not configured." }, { status: 503 });
  }

  const body = await request.json() as { transcript?: string; template?: string };
  if (!body.transcript?.trim()) {
    return NextResponse.json({ error: "A transcript is required." }, { status: 400 });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are Fathom, a meeting intelligence assistant. Return valid JSON with exactly these keys: summary (string), topics (string[]), decisions (string[]), actionItems ({task:string, owner:string}[]). Be concise and grounded only in the transcript." },
        { role: "user", content: `Use the ${body.template ?? "General meeting"} template. Analyze this transcript:\n\n${body.transcript}` },
      ],
    });
    const content = response.choices[0]?.message.content;
    if (!content) return NextResponse.json({ error: "The AI returned no content." }, { status: 502 });
    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    console.error("AI analysis failed", error);
    return NextResponse.json({ error: "AI analysis failed." }, { status: 502 });
  }
}
