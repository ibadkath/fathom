import { NextResponse } from "next/server";
import { getDemoMeeting } from "../../../../lib/demo-data";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const meeting = getDemoMeeting(id);
  return NextResponse.json(meeting);
}
