import { notFound } from "next/navigation";
import FathomMvp from "../../../components/fathom-mvp";
import { demoMeetings } from "../../../lib/demo-data";

export default async function MeetingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const meeting = demoMeetings.find((item) => item.id === id);
  if (!meeting) notFound();
  return <FathomMvp meetings={demoMeetings} initialMeeting={meeting} />;
}