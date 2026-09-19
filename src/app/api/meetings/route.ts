import { NextResponse } from "next/server";
import { demoMeetings } from "../../../lib/demo-data";

export function GET() {
  return NextResponse.json(demoMeetings);
}
