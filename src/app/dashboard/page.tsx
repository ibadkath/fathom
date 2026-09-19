import FathomMvp from "../../components/fathom-mvp";
import { demoMeetings } from "../../lib/demo-data";

export default function DashboardPage() {
  return <FathomMvp meetings={demoMeetings} />;
}