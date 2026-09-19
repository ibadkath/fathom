"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Archive, ArrowUpRight, Bell, CalendarDays, Check, CheckCircle2, ChevronDown,
  Copy, FileText, Filter, Highlighter, Inbox, LayoutGrid, ListFilter,
  MoreHorizontal, Pause, Play, Plus, Search, Send, Settings2, Share2,
  Sparkles, Video, MessageCircle, X,
} from "lucide-react";
import "./fathom.css";

type Meeting = {
  id: number;
  title: string;
  status: string;
  duration: string;
  people: string;
  initials: string[];
  color: string;
};

const meetings: Meeting[] = [
  { id: 1, title: "Q3 product strategy", status: "Just now", duration: "48 min", people: "Maya, Jordan, +4", initials: ["MC", "JL", "TN"], color: "coral" },
  { id: 2, title: "Design critique - Mobile", status: "1 hr ago", duration: "32 min", people: "Priya, Leo, +2", initials: ["PS", "LW", "AM"], color: "blue" },
  { id: 3, title: "Weekly growth sync", status: "Yesterday", duration: "41 min", people: "Nate, Suki, +3", initials: ["NF", "SK", "OB"], color: "yellow" },
  { id: 4, title: "Customer interview - Acme", status: "Yesterday", duration: "26 min", people: "Aisha, Ben", initials: ["AR", "BS"], color: "green" },
];

const transcript = [
  { time: "00:00", speaker: "Maya Chen", initials: "MC", tone: "coral", text: "Alright, let's get into the Q3 plan. We have three big bets on the table and six weeks to make the call." },
  { time: "03:24", speaker: "Jordan Lee", initials: "JL", tone: "blue", text: "The strongest signal from customers is still around faster setup. People understand the product, but they are not reaching their first win quickly enough." },
  { time: "08:12", speaker: "Maya Chen", initials: "MC", tone: "coral", text: "That feels like the right north star. If we make activation our focus, what does that mean for the roadmap we already committed to?" },
  { time: "14:48", speaker: "Tina Nguyen", initials: "TN", tone: "yellow", text: "We can pull the collaborative notes work forward by two weeks. It gives new teams a reason to invite others on day one." },
  { time: "22:06", speaker: "Jordan Lee", initials: "JL", tone: "blue", text: "I'll take the first pass on the new onboarding flow and bring a clickable prototype to Thursday's review." },
  { time: "31:40", speaker: "Maya Chen", initials: "MC", tone: "coral", text: "Great. Let's leave today with one clear goal: get a new team from sign-up to their first shared note in under five minutes." },
];

const summaryTabs = ["Overview", "Topics", "Action items", "Highlights"];
const templates = ["General meeting", "Sales call", "1:1", "Engineering", "Interview"];
const demoAudioUrl = "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3";

type WorkspaceView = "inbox" | "calendar" | "meetings" | "search" | "settings";

function WorkspaceViewPanel({ view, query, setQuery, onOpenMeeting }: { view: WorkspaceView; query: string; setQuery: (value: string) => void; onOpenMeeting: () => void }) {
  const [connected, setConnected] = useState<string[]>(["Google Calendar", "Slack"]);
  const toggleConnection = (name: string) => setConnected((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name]);

  if (view === "calendar") return <section className="workspace-panel"><div className="workspace-panel-heading"><div><span className="eyebrow">Your schedule</span><h2>Calendar</h2><p>See where Fathom is joining you this week.</p></div><button className="primary-action"><Plus size={15} /> Connect calendar</button></div><div className="calendar-toolbar"><button className="calendar-arrow">‹</button><strong>September 16 - 22, 2026</strong><button className="calendar-arrow">›</button><span /><button className="view-toggle active">Week</button><button className="view-toggle">Month</button></div><div className="calendar-grid"><div className="calendar-corner" />{["MON 16", "TUE 17", "WED 18", "THU 19", "FRI 20"].map((day) => <div key={day} className={day === "THU 19" ? "calendar-day today" : "calendar-day"}>{day}</div>)}{["9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM"].map((hour, row) => <div key={hour} className="calendar-row"><span>{hour}</span>{[0, 1, 2, 3, 4].map((column) => <div key={`${hour}-${column}`} className="calendar-cell">{row === 1 && column === 3 ? <button className="calendar-event coral" onClick={onOpenMeeting}><strong>Q3 product strategy</strong><small>10:30 - 11:18 AM</small></button> : row === 3 && column === 1 ? <button className="calendar-event blue"><strong>Design critique</strong><small>12:00 - 12:32 PM</small></button> : null}</div>)}</div>)}</div></section>;
  if (view === "meetings") return <section className="workspace-panel"><div className="workspace-panel-heading"><div><span className="eyebrow">Your library</span><h2>All meetings</h2><p>Every conversation, searchable and ready to revisit.</p></div><button className="primary-action"><Plus size={15} /> Add meeting</button></div><div className="library-toolbar"><label className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search meetings" /></label><button className="filter-button"><Filter size={15} /> Filter</button><button className="filter-button"><ListFilter size={15} /> Sort</button></div><div className="library-table"><div className="library-table-head"><span>Meeting</span><span>Participants</span><span>Date</span><span>Duration</span><span /></div>{meetings.map((meeting) => <button className="library-row" key={meeting.id} onClick={onOpenMeeting}><div className="library-title"><div className={`meeting-type ${meeting.color}`}><Video size={16} /></div><span><strong>{meeting.title}</strong><small>Recorded meeting</small></span></div><span>{meeting.people}</span><span>{meeting.status}</span><span>{meeting.duration}</span><MoreHorizontal size={16} /></button>)}</div></section>;
  if (view === "search") return <section className="workspace-panel search-panel"><div className="workspace-panel-heading"><div><span className="eyebrow">Across your workspace</span><h2>Ask Fathom</h2><p>Search every conversation or ask a question about your meetings.</p></div></div><label className="ask-field"><Search size={20} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="What did we decide about activation?" /><button><ArrowUpRight size={17} /></button></label><div className="suggestion-row"><button onClick={() => setQuery("activation")}>What are our biggest activation risks?</button><button onClick={() => setQuery("onboarding")}>Find mentions of onboarding</button><button onClick={() => setQuery("roadmap")}>Summarize roadmap decisions</button></div><div className="search-results"><div className="result-heading"><strong>{query ? `Results for “${query}”` : "Recent answers"}</strong><span>4 meetings</span></div>{transcript.filter((line) => !query || `${line.speaker} ${line.text}`.toLowerCase().includes(query.toLowerCase())).slice(0, 3).map((line) => <button className="search-result" key={line.time} onClick={onOpenMeeting}><div className="result-icon"><FileText size={15} /></div><span><strong>{line.text.slice(0, 74)}...</strong><small>{line.speaker} · Q3 product strategy · {line.time}</small></span><ArrowUpRight size={15} /></button>)}</div></section>;
  return <section className="workspace-panel settings-panel"><div className="workspace-panel-heading"><div><span className="eyebrow">Workspace</span><h2>Settings</h2><p>Make Fathom fit the way your team works.</p></div></div><div className="settings-layout"><nav className="settings-nav"><button className="active">General</button><button>Recording</button><button>AI summaries</button><button>Integrations</button><button>Team members</button></nav><div className="settings-content"><div className="settings-section"><h3>Workspace profile</h3><p>Basic details shared with your meeting team.</p><label>Workspace name<input defaultValue="Acme workspace" /></label><label>Meeting note template<select defaultValue="Team meeting"><option>Team meeting</option><option>Sales discovery</option><option>Customer interview</option></select></label></div><div className="settings-section"><h3>Integrations</h3><p>Send notes and action items where your team already works.</p>{["Google Calendar", "Slack", "Notion", "Asana"].map((name) => <div className="integration-row" key={name}><span className="integration-logo">{name[0]}</span><span><strong>{name}</strong><small>{connected.includes(name) ? "Connected and syncing" : "Not connected"}</small></span><button className={connected.includes(name) ? "connected" : ""} onClick={() => toggleConnection(name)}>{connected.includes(name) ? <><Check size={13} /> Connected</> : "Connect"}</button></div>)}</div></div></div></section>;
}

export default function FathomWorkspace() {
  const router = useRouter();
  const [view, setView] = useState<WorkspaceView>("inbox");
  const [selectedMeeting, setSelectedMeeting] = useState(1);
  const [query, setQuery] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  const [highlighted, setHighlighted] = useState<number[]>([3]);
  const [shared, setShared] = useState(false);
  const [completed, setCompleted] = useState<number[]>([1]);
  const [template, setTemplate] = useState("General meeting");
  const [question, setQuestion] = useState("");
  const [answerVisible, setAnswerVisible] = useState(false);
  const [clipShareOpen, setClipShareOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    const audio = new Audio(demoAudioUrl);
    audio.loop = true;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      void audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying]);
  const filteredTranscript = useMemo(() => transcript.filter((line) => `${line.speaker} ${line.text}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const toggleHighlight = (index: number) => setHighlighted((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index]);
  const toggleComplete = (index: number) => setCompleted((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index]);
  const handleWorkspaceClick = (event: React.MouseEvent<HTMLElement>) => {
    const button = (event.target as HTMLElement).closest("button");
    if (!button) return;
    const label = button.textContent?.trim() ?? "";
    if (button.closest(".mobile-bottom-nav")) {
      if (label.includes("Calendar")) setView("calendar");
      if (label.includes("Search")) setView("search");
      if (label.includes("Settings")) setView("settings");
      if (label.includes("Inbox")) setView("inbox");
      return;
    }
    if (button.closest(".sidebar-bottom") && label.includes("Settings")) {
      setView("settings");
      return;
    }
    if (button.closest(".meeting-list-heading")) {
      setView("meetings");
      return;
    }
    if (button.classList.contains("new-meeting") || button.classList.contains("primary-action")) {
      setNotice("Capture is stubbed for this MVP. Seeded meetings are ready to explore.");
      return;
    }
    if (button.classList.contains("meeting-settings")) {
      setNotice("Meeting customization is available in the full capture workflow.");
      return;
    }
    if (button.classList.contains("notification") || button.classList.contains("filter-button")) {
      setNotice("You are viewing all seeded meetings.");
      return;
    }
    if (button.classList.contains("speed-button")) {
      setNotice("Playback speed controls are ready for the real meeting recording.");
      return;
    }
    if (button.closest(".settings-nav")) {
      setNotice(`${label} settings are represented in this demo workspace.`);
      return;
    }
    if (button.classList.contains("share-option")) {
      button.parentElement?.querySelectorAll(".share-option").forEach((option) => option.classList.remove("selected"));
      button.classList.add("selected");
      setNotice(label.includes("Entire") ? "The full meeting is selected for sharing." : "The 48-second clip is selected for sharing.");
      return;
    }
    if (button.classList.contains("create-link")) {
      router.push("/share/q3-product-strategy-clip");
    }
  };

  return (
    <main className="app-shell" onClick={handleWorkspaceClick}>
      {notice && <div className="workspace-toast" role="status" style={{ position: "fixed", right: 20, bottom: 20, zIndex: 20, maxWidth: 340, padding: "12px 14px", color: "#fff", borderRadius: 8, background: "#20292e", fontSize: 12, boxShadow: "0 10px 30px #20292e33" }}>{notice}</div>}
      <aside className="sidebar">
        <div className="brand-lockup"><div className="brand-mark"><span /><span /><span /></div><span>fathom</span></div>
        <button className="workspace-switcher"><span className="workspace-avatar">A</span><span className="workspace-copy"><strong>Acme workspace</strong><small>Personal</small></span><ChevronDown size={15} /></button>
        <nav className="primary-nav" aria-label="Primary navigation"><button className={`nav-item ${view === "inbox" ? "active" : ""}`} onClick={() => setView("inbox")}><Inbox size={17} /> Inbox <span className="nav-count">3</span></button><button className={`nav-item ${view === "calendar" ? "active" : ""}`} onClick={() => setView("calendar")}><CalendarDays size={17} /> Calendar</button><button className={`nav-item ${view === "meetings" ? "active" : ""}`} onClick={() => setView("meetings")}><LayoutGrid size={17} /> All meetings</button></nav>
        <div className="sidebar-section"><div className="sidebar-label">Your library <button aria-label="Add folder"><Plus size={14} /></button></div><button className={`nav-item ${view === "meetings" ? "active" : ""}`} onClick={() => setView("meetings")}><FileText size={16} /> My meetings</button><button className="nav-item"><Archive size={16} /> Archived</button></div>
        <div className="sidebar-bottom"><div className="upgrade-card"><div className="upgrade-icon"><Sparkles size={15} /></div><strong>Make every meeting count</strong><p>You&apos;re on the free plan. Unlock unlimited recordings.</p><button>Explore Pro <ArrowUpRight size={13} /></button></div><button className="nav-item"><Settings2 size={17} /> Settings</button><div className="user-row"><div className="user-avatar">IK</div><div><strong>Ibad Kath</strong><small>ibad@acme.co</small></div><MoreHorizontal size={16} /></div></div>
      </aside>

      <section className="meeting-list-panel">
        <header className="list-header"><div><p className="eyebrow">Thursday, September 19</p><h1>Good morning, Ibad</h1></div><button className="icon-button notification" aria-label="Notifications"><Bell size={18} /><span /></button></header>
        <div className="list-toolbar"><label className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your meetings" /><span>Cmd K</span></label><button className="filter-button" aria-label="Filter meetings"><ListFilter size={16} /></button></div>
        <div className="meeting-list-heading"><span>Recent meetings</span><button>View all <ArrowUpRight size={13} /></button></div>
        <div className="meeting-list">{meetings.map((meeting) => <button key={meeting.id} className={`meeting-row ${selectedMeeting === meeting.id ? "selected" : ""}`} onClick={() => setSelectedMeeting(meeting.id)}><div className={`meeting-type ${meeting.color}`}><Video size={17} /></div><div className="meeting-row-copy"><strong>{meeting.title}</strong><span>{meeting.status} <i /> {meeting.duration}</span><small>{meeting.people}</small></div><div className="mini-avatars">{meeting.initials.map((initial, index) => <span key={initial} className={`avatar avatar-${index}`}>{initial}</span>)}</div></button>)}</div>
        <div className="list-footer"><div className="recording-pill"><span className="recording-dot" /> Notetaker is ready</div><button className="new-meeting"><Plus size={16} /> Add meeting</button></div>
      </section>

      {view !== "inbox" ? <WorkspaceViewPanel view={view} query={query} setQuery={setQuery} onOpenMeeting={() => setView("inbox")} /> : <section className="meeting-detail">
        <header className="detail-header"><div className="detail-breadcrumb"><span>My meetings</span><span>/</span><strong>Q3 product strategy</strong></div><div className="detail-actions"><button className="icon-button" aria-label="Meeting options"><MoreHorizontal size={18} /></button><button className={`share-button ${shared ? "shared" : ""}`} onClick={() => setClipShareOpen(true)}>{shared ? <Check size={15} /> : <Share2 size={15} />} {shared ? "Link ready" : "Share"}</button></div></header>
        <div className="meeting-heading"><div><div className="heading-kicker"><span className="live-dot" /> Recorded today at 10:30 AM</div><h2>Q3 product strategy</h2><div className="attendee-line"><div className="avatar-stack"><span className="avatar avatar-0">MC</span><span className="avatar avatar-1">JL</span><span className="avatar avatar-2">TN</span><span className="avatar avatar-more">+3</span></div><span>6 participants</span><span className="dot-separator" /><span>48 minutes</span></div></div><button className="meeting-settings"><Settings2 size={16} /> Customize</button></div>
        <div className="player-card"><div className="player-top"><span className="player-label"><span className="playing-bars"><i /><i /><i /></span> Q3 product strategy</span><span>00:00 / 48:12</span></div><div className="waveform" aria-label="Meeting audio waveform">{Array.from({ length: 76 }, (_, index) => <span key={index} style={{ height: `${14 + ((index * 17) % 30)}%` }} />)}</div><div className="player-controls"><button className="speed-button">1x</button><button className="play-button" onClick={() => setIsPlaying(!isPlaying)} aria-label={isPlaying ? "Pause recording" : "Play recording"}>{isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}</button><span className="player-time">00:00</span><div className="progress-track"><span /></div><span className="player-time">48:12</span></div></div>
        <div className="content-grid"><div className="transcript-column"><div className="section-toolbar"><div className="section-tabs"><button className="tab-active">Transcript</button><button>Notes <span className="small-count">2</span></button></div><button className="transcript-filter"><Filter size={14} /> All speakers <ChevronDown size={13} /></button></div><div className="transcript-list">{filteredTranscript.length ? filteredTranscript.map((line) => { const sourceIndex = transcript.indexOf(line); return <article key={line.time} className={`transcript-line ${highlighted.includes(sourceIndex) ? "is-highlighted" : ""}`}><span className="transcript-time">{line.time}</span><div className="speaker-avatar" data-tone={line.tone}>{line.initials}</div><div className="transcript-body"><div className="speaker-name">{line.speaker}<button className="line-action" onClick={() => toggleHighlight(sourceIndex)} aria-label="Toggle highlight"><Highlighter size={14} fill={highlighted.includes(sourceIndex) ? "currentColor" : "none"} /></button></div><p>{line.text}</p></div></article>; }) : <div className="empty-search"><Search size={20} /><strong>No transcript matches</strong><span>Try a different phrase.</span></div>}</div></div>
            <aside className="insight-column"><div className="insight-header"><div className="ai-label"><span className="sparkle-dot"><Sparkles size={12} /></span> Fathom AI</div><button className="icon-button" aria-label="Insight options"><MoreHorizontal size={17} /></button></div><div className="template-bar"><span>AI template</span><select value={template} onChange={(event) => setTemplate(event.target.value)}>{templates.map((option) => <option key={option}>{option}</option>)}</select></div><div className="summary-tabs">{summaryTabs.map((tab) => <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab}{tab === "Action items" && <span>3</span>}{tab === "Highlights" && <span>{highlighted.length}</span>}</button>)}</div>{activeTab === "Overview" && <div className="insight-content"><h3>{template} summary</h3><p>{template === "Sales call" ? "The conversation surfaced strong activation pain and a clear path to the next customer step." : "Q3 planning centered on improving activation. The team aligned on getting new customers to their first shared note in under five minutes."}</p><h3>Key topics</h3><div className="topic-list"><span>Activation</span><span>Onboarding</span><span>Roadmap</span></div><h3>Decisions</h3><ul className="decision-list"><li><CheckCircle2 size={15} />Activation is the Q3 north star.</li><li><CheckCircle2 size={15} />Collaborative notes move forward two weeks.</li></ul></div>}{activeTab === "Topics" && <div className="insight-content"><h3>Topics from this meeting</h3><div className="topic-card"><span className="topic-number">01</span><div><strong>Activation & onboarding</strong><p>New users need a faster path to their first shared note.</p></div><span>12:40</span></div><div className="topic-card"><span className="topic-number">02</span><div><strong>Q3 roadmap</strong><p>Collaborative notes moves forward by two weeks.</p></div><span>24:18</span></div></div>}{activeTab === "Action items" && <div className="insight-content"><h3>Action items <span className="inline-count">3</span></h3>{["Bring a clickable onboarding prototype", "Define the first-win activation metric", "Move collaborative notes into Q3 sprint"].map((item, index) => <button key={item} className="action-item" onClick={() => toggleComplete(index)}><span className={`action-check ${completed.includes(index) ? "done" : ""}`}>{completed.includes(index) && <Check size={12} />}</span><span><strong>{item}</strong><small>{index === 0 ? "Jordan Lee - Thu, Sep 26" : index === 1 ? "Maya Chen - Fri, Sep 27" : "Tina Nguyen - Mon, Sep 30"}</small></span></button>)}</div>}{activeTab === "Highlights" && <div className="insight-content"><h3>Important moments <span className="inline-count">{highlighted.length}</span></h3>{highlighted.map((index) => <button className="highlight-card" key={transcript[index].time} onClick={() => setActiveTab("Transcript")}><span className="highlight-time">{transcript[index].time}</span><span><strong>{transcript[index].text.slice(0, 65)}...</strong><small>{transcript[index].speaker}</small></span><ArrowUpRight size={14} /></button>)}</div>}<div className="ask-meeting"><div className="ask-title"><MessageCircle size={14} /> Ask this meeting</div><div className="ask-input"><input value={question} onChange={(event) => { setQuestion(event.target.value); setAnswerVisible(false); }} placeholder="What did we decide?" /><button onClick={() => setAnswerVisible(true)} aria-label="Ask Fathom"><ArrowUpRight size={15} /></button></div>{answerVisible && <div className="ask-answer"><Sparkles size={13} /><span>The team agreed activation is the Q3 north star and collaborative notes move forward two weeks.<button onClick={() => setActiveTab("Highlights")}>Jump to 14:48</button></span></div>}</div><div className="insight-footer"><button><Copy size={14} /> Copy summary</button><button><Send size={14} /> Send to Slack</button></div></aside></div>
      </section>}
          {clipShareOpen && <div className="modal-backdrop" onClick={() => setClipShareOpen(false)}><div className="share-modal" onClick={(event) => event.stopPropagation()}><div className="modal-heading"><div><span className="eyebrow">Share a moment</span><h3>Share meeting</h3></div><button className="icon-button" onClick={() => setClipShareOpen(false)} aria-label="Close"><X size={17} /></button></div><p>Send a focused clip instead of the full 48-minute recording.</p><div className="share-option selected"><span className="radio-dot" /><span><strong>Selected clip</strong><small>14:48 - 15:36 · 48 seconds</small></span></div><div className="share-option"><span className="radio-dot" /><span><strong>Entire meeting</strong><small>Share the full transcript and recording</small></span></div><button className="create-link" onClick={() => { setClipShareOpen(false); setShared(true); }}>Create share link <ArrowUpRight size={15} /></button></div></div>}
      <div className="mobile-bottom-nav"><button className="active"><Inbox size={18} /><span>Inbox</span></button><button><CalendarDays size={18} /><span>Calendar</span></button><button><Search size={18} /><span>Search</span></button><button><Settings2 size={18} /><span>Settings</span></button></div>
    </main>
  );
}
