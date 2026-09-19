export type TranscriptSegment = {
  id: string;
  speaker: string;
  initials: string;
  text: string;
  startSec: number;
  endSec: number;
};

export type DemoMeeting = {
  id: string;
  title: string;
  startedAt: string;
  durationSec: number;
  participants: string[];
  audioUrl: string;
  transcript: TranscriptSegment[];
  summary: string;
  topics: string[];
  decisions: string[];
  actionItems: { id: string; task: string; owner: string; completed: boolean }[];
};

const audioUrl = "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3";

const strategyTranscript: TranscriptSegment[] = [
  { id: "strategy-1", speaker: "Maya Chen", initials: "MC", text: "Let's get into the Q3 plan. We have three big bets on the table and six weeks to make the call.", startSec: 0, endSec: 204 },
  { id: "strategy-2", speaker: "Jordan Lee", initials: "JL", text: "The strongest signal from customers is faster setup. People understand the product, but they are not reaching their first win quickly enough.", startSec: 204, endSec: 492 },
  { id: "strategy-3", speaker: "Maya Chen", initials: "MC", text: "That feels like the right north star. If we make activation our focus, what does that mean for the roadmap we already committed to?", startSec: 492, endSec: 888 },
  { id: "strategy-4", speaker: "Tina Nguyen", initials: "TN", text: "We can pull the collaborative notes work forward by two weeks. It gives new teams a reason to invite others on day one.", startSec: 888, endSec: 1326 },
  { id: "strategy-5", speaker: "Jordan Lee", initials: "JL", text: "I'll take the first pass on the new onboarding flow and bring a clickable prototype to Thursday's review.", startSec: 1326, endSec: 1900 },
  { id: "strategy-6", speaker: "Maya Chen", initials: "MC", text: "Let's leave today with one clear goal: get a new team from sign-up to their first shared note in under five minutes.", startSec: 1900, endSec: 2892 },
];

export const demoMeetings: DemoMeeting[] = [
  {
    id: "q3-product-strategy",
    title: "Q3 product strategy",
    startedAt: "2026-09-19T10:30:00.000Z",
    durationSec: 2892,
    participants: ["Maya Chen", "Jordan Lee", "Tina Nguyen", "Nate Ford", "Suki Kim", "Owen Brooks"],
    audioUrl,
    transcript: strategyTranscript,
    summary: "Q3 planning centered on improving activation. The team aligned on getting new customers to their first shared note in under five minutes.",
    topics: ["Activation", "Onboarding", "Roadmap"],
    decisions: ["Activation is the Q3 north star.", "Collaborative notes move forward two weeks."],
    actionItems: [
      { id: "strategy-action-1", task: "Draft the new onboarding flow", owner: "Jordan Lee", completed: true },
      { id: "strategy-action-2", task: "Move collaborative notes work forward", owner: "Tina Nguyen", completed: false },
      { id: "strategy-action-3", task: "Review the clickable prototype Thursday", owner: "Maya Chen", completed: false },
    ],
  },
  {
    id: "design-critique-mobile",
    title: "Design critique - Mobile",
    startedAt: "2026-09-19T09:00:00.000Z",
    durationSec: 1920,
    participants: ["Priya Shah", "Leo Wong", "Aisha Malik", "Maya Chen"],
    audioUrl,
    transcript: [{ id: "design-1", speaker: "Priya Shah", initials: "PS", text: "The new mobile flow should keep the first decision visible without making the screen feel crowded.", startSec: 0, endSec: 300 }],
    summary: "The team focused on reducing visual noise in the mobile onboarding flow and agreed to test a single primary action.",
    topics: ["Mobile UX", "Onboarding"],
    decisions: ["Test one primary action above the fold."],
    actionItems: [{ id: "design-action-1", task: "Prepare the mobile prototype for testing", owner: "Priya Shah", completed: false }],
  },
  {
    id: "weekly-growth-sync",
    title: "Weekly growth sync",
    startedAt: "2026-09-18T15:00:00.000Z",
    durationSec: 2460,
    participants: ["Nate Ford", "Suki Kim", "Owen Brooks", "Maya Chen"],
    audioUrl,
    transcript: [{ id: "growth-1", speaker: "Nate Ford", initials: "NF", text: "Activation improved this week, but the biggest drop is still between invite sent and first shared note.", startSec: 0, endSec: 420 }],
    summary: "Growth reviewed activation movement and identified the invite-to-first-note step as the next funnel priority.",
    topics: ["Activation", "Growth funnel"],
    decisions: ["Instrument the invite-to-first-note step."],
    actionItems: [{ id: "growth-action-1", task: "Add funnel instrumentation", owner: "Nate Ford", completed: false }],
  },
  {
    id: "customer-interview-acme",
    title: "Customer interview - Acme",
    startedAt: "2026-09-18T11:00:00.000Z",
    durationSec: 1560,
    participants: ["Aisha Rahman", "Ben Stone"],
    audioUrl,
    transcript: [{ id: "customer-1", speaker: "Aisha Rahman", initials: "AR", text: "The first shared note is where our team understands the value. Everything before that feels like setup work.", startSec: 0, endSec: 360 }],
    summary: "Acme sees the first shared note as the moment of value and wants less setup before collaboration begins.",
    topics: ["Customer research", "Collaboration"],
    decisions: ["Explore a guided first shared note."],
    actionItems: [{ id: "customer-action-1", task: "Turn the interview insight into a product brief", owner: "Ben Stone", completed: false }],
  },
];

export function getDemoMeeting(id: string) {
  return demoMeetings.find((meeting) => meeting.id === id) ?? demoMeetings[0];
}

export function formatDuration(durationSec: number) {
  const minutes = Math.floor(durationSec / 60);
  return `${minutes} min`;
}

export function formatTimestamp(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}
