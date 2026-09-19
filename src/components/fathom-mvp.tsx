"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, FileText, Highlighter, Link2, Mic, Play, Search, Share2, Sparkles, Square } from "lucide-react";
import { DemoMeeting, formatDuration, formatTimestamp } from "../lib/demo-data";
import "./fathom-mvp.css";
import "./live-recording.css";

type Props = { meetings: DemoMeeting[]; initialMeeting?: DemoMeeting };
type Tab = "summary" | "topics" | "actions" | "highlights";

export default function FathomMvp({ meetings, initialMeeting }: Props) {
  const router = useRouter();
  const [meetingList, setMeetingList] = useState(meetings);
  const [selectedMeeting, setSelectedMeeting] = useState(initialMeeting ?? meetings[0]);
  const [showDetail, setShowDetail] = useState(Boolean(initialMeeting));
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("summary");
  const [template, setTemplate] = useState("General meeting");
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareMode, setShareMode] = useState<"clip" | "full">("clip");
  const [highlightIds, setHighlightIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    return JSON.parse(window.localStorage.getItem("fathom-highlights") ?? "[]");
  });
  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    const seeded = meetings.flatMap((meeting) => meeting.actionItems.filter((action) => action.completed).map((action) => action.id));
    if (typeof window === "undefined") return seeded;
    return [...new Set([...seeded, ...JSON.parse(window.localStorage.getItem("fathom-actions") ?? "[]")])];
  });
  const [currentTime, setCurrentTime] = useState(0);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [aiSummary, setAiSummary] = useState<{ summary: string; topics: string[]; decisions: string[]; actionItems: { task: string; owner: string }[] } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingError, setRecordingError] = useState("");
  const [recordingSize, setRecordingSize] = useState(0);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [microphoneId, setMicrophoneId] = useState("");
  const recordingSecondsRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    window.localStorage.setItem("fathom-highlights", JSON.stringify(highlightIds));
  }, [highlightIds]);

  useEffect(() => {
    window.localStorage.setItem("fathom-actions", JSON.stringify(completedIds));
  }, [completedIds]);

  useEffect(() => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    void navigator.mediaDevices.enumerateDevices().then((devices) => setMicrophones(devices.filter((device) => device.kind === "audioinput")));
  }, []);

  useEffect(() => {
    if (!isRecording) return;
    const timer = window.setInterval(() => {
      recordingSecondsRef.current += 1;
      setRecordingSeconds(recordingSecondsRef.current);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isRecording]);

  const visibleMeetings = meetingList.filter((meeting) => `${meeting.title} ${meeting.participants.join(" ")}`.toLowerCase().includes(query.toLowerCase()));
  const activeSegment = selectedMeeting.transcript.find((segment) => currentTime >= segment.startSec && currentTime < segment.endSec);
  const selectedHighlightIds = highlightIds.filter((id) => selectedMeeting.transcript.some((segment) => segment.id === id));
  const transcriptText = selectedMeeting.transcript.map((segment) => `${formatTimestamp(segment.startSec)} ${segment.speaker}: ${segment.text}`).join("\n");

  const openMeeting = (meeting: DemoMeeting) => {
    setSelectedMeeting(meeting);
    setShowDetail(true);
    setTab("summary");
    router.push(`/meetings/${meeting.id}`);
  };

  const stopRecording = () => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    setIsRecording(false);
  };

  const startRecording = async () => {
    setRecordingError("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setRecordingError("Live recording is not supported by this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: microphoneId ? { exact: microphoneId } : undefined, echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      const devices = await navigator.mediaDevices.enumerateDevices();
      setMicrophones(devices.filter((device) => device.kind === "audioinput"));
      const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      streamRef.current = stream;
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onerror = () => {
        setRecordingError("The browser could not encode the microphone recording.");
        stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
      };
      recorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        if (audioBlob.size === 0) {
          setRecordingError("No audio data was captured. Check the selected microphone and try again.");
          stream.getTracks().forEach((track) => track.stop());
          setIsRecording(false);
          return;
        }
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordingSize(audioBlob.size);
        const id = `live-${Date.now()}`;
        const liveMeeting: DemoMeeting = {
          id,
          title: "Live meeting recording",
          startedAt: new Date().toISOString(),
          durationSec: Math.max(recordingSecondsRef.current, 1),
          participants: ["You"],
          audioUrl,
          transcript: [{ id: `${id}-transcript`, speaker: "You", initials: "YO", text: "Live audio captured in the browser. Add transcription after recording to connect this meeting to an AI summary.", startSec: 0, endSec: Math.max(recordingSecondsRef.current, 1) }],
          summary: "This recording was captured live in the browser. The transcript and AI summary are ready for a transcription provider in the next integration step.",
          topics: ["Live capture"],
          decisions: ["Review the captured recording and add a transcript."],
          actionItems: [{ id: `${id}-action`, task: "Review the live recording", owner: "You", completed: false }],
        };
        setMeetingList((current) => [liveMeeting, ...current]);
        setSelectedMeeting(liveMeeting);
        setShowDetail(true);
        stream.getTracks().forEach((track) => track.stop());
        recorderRef.current = null;
        streamRef.current = null;
        recordingSecondsRef.current = 0;
        setRecordingSeconds(0);
      };
      recorder.start(250);
      recordingSecondsRef.current = 0;
      setRecordingSeconds(0);
      setIsRecording(true);
    } catch {
      setRecordingError("Microphone access was blocked. Allow microphone access and try again.");
    }
  };

  const seekTo = (seconds: number) => {
    if (audioRef.current) audioRef.current.currentTime = seconds;
    setCurrentTime(seconds);
  };

  const toggleHighlight = (segmentId: string) => {
    setHighlightIds((current) => current.includes(segmentId) ? current.filter((id) => id !== segmentId) : [...current, segmentId]);
    setTab("highlights");
  };

  const toggleAction = (actionId: string) => {
    const action = selectedMeeting.actionItems.find((item) => item.id === actionId);
    if (action?.completed && completedIds.includes(actionId)) action.completed = false;
    setCompletedIds((current) => current.includes(actionId) ? current.filter((id) => id !== actionId) : [...current, actionId]);
  };

  const askMeeting = async () => {
    if (!question.trim()) return;
    setAiError("");
    const response = await fetch("/api/ai/ask", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ transcript: transcriptText, question }) });
    const result = await response.json() as { answer?: string; error?: string };
    if (!response.ok) {
      setAiError(result.error ?? "AI question failed.");
      return;
    }
    setAnswer(result.answer ?? "No answer was returned.");
  };

  const generateAiSummary = async () => {
    setIsAiLoading(true);
    setAiError("");
    const response = await fetch("/api/ai/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ transcript: transcriptText, template }) });
    const result = await response.json() as typeof aiSummary & { error?: string };
    setIsAiLoading(false);
    if (!response.ok) {
      setAiError(result.error ?? "AI analysis failed.");
      return;
    }
    setAiSummary(result);
  };

  const shareMeeting = () => {
    setIsShareOpen(false);
    router.push(`/share/${selectedMeeting.id}-${shareMode}`);
  };

  return (
    <main className="mvp-shell">
      <header className="mvp-header">
        <button className="mvp-brand" onClick={() => router.push("/dashboard")}><span className="mvp-mark"><i /><i /><i /></span> fathom</button>
        <div className="mvp-header-actions"><label className="mvp-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search meetings" /></label><span className="mvp-user">IK</span></div>
      </header>
      <div className="mvp-layout">
        <aside className="mvp-sidebar">
          <button className="mvp-nav active" onClick={() => router.push("/dashboard")}><FileText size={16} /> Recent meetings</button>
          {showDetail && <button className="mvp-nav" onClick={generateAiSummary} disabled={isAiLoading}><Sparkles size={16} /> {isAiLoading ? "Generating AI..." : "Generate AI summary"}</button>}
          <button className="mvp-nav" onClick={() => document.getElementById("mvp-search")?.focus()}><Search size={16} /> Search</button>
          <div className="mvp-sidebar-label">Workspace</div>
          <button className="mvp-nav" onClick={() => setTab("highlights")}><Highlighter size={16} /> Highlights <span>{selectedHighlightIds.length}</span></button>
          <button className="mvp-nav" onClick={() => setIsShareOpen(true)}><Share2 size={16} /> Share selected</button>
          <div className="mvp-capture-note"><Sparkles size={16} /><strong>Capture layer</strong><p>Seeded meetings are ready, or record a real browser microphone session.</p></div>
        </aside>
        <section className="mvp-content">
          <div className="mvp-page-heading"><div><span className="mvp-eyebrow">Meeting intelligence</span><h1>{showDetail ? selectedMeeting.title : "Recent meetings"}</h1><p>{showDetail ? "Playback, transcript, decisions, and follow-ups in one place." : "Turn every conversation into clear next steps."}</p></div><div className="mvp-heading-actions">{!showDetail && microphones.length > 0 && <select className="mvp-microphone-select" aria-label="Choose microphone" value={microphoneId} onChange={(event) => setMicrophoneId(event.target.value)}>{microphones.map((device, index) => <option key={device.deviceId} value={device.deviceId}>{device.label || `Microphone ${index + 1}`}</option>)}</select>}{showDetail && <button className="mvp-secondary-action" onClick={() => { setShowDetail(false); router.push("/dashboard"); }}><ChevronLeft size={15} /> Back</button>}{showDetail && <button className="mvp-share" onClick={() => setIsShareOpen(true)}><Share2 size={15} /> Share</button>}{!showDetail && <button className={`mvp-record-button ${isRecording ? "recording" : ""}`} onClick={isRecording ? stopRecording : startRecording}>{isRecording ? <><Square size={14} fill="currentColor" /> Stop recording · {formatTimestamp(recordingSeconds)}</> : <><Mic size={15} /> New meeting</>}</button>}</div></div>
          {recordingError && <div className="mvp-recording-error" role="alert">{recordingError}</div>}
          {aiError && <div className="mvp-recording-error" role="alert">{aiError}</div>}
          {aiSummary && <div className="mvp-ai-result"><strong>Live AI result</strong><span>{aiSummary.summary}</span></div>}
          {!showDetail && <div className="mvp-meeting-grid">{visibleMeetings.map((meeting) => <button className="mvp-meeting-card" key={meeting.id} onClick={() => openMeeting(meeting)}><div className="mvp-card-icon"><Play size={16} /></div><div><strong>{meeting.title}</strong><span>{formatDuration(meeting.durationSec)} · {meeting.participants.length} participants</span><small>AI summary available</small></div><ChevronLeft size={16} className="mvp-card-arrow" /></button>)}</div>}
          {showDetail && <>
            <div className="mvp-meta"><span>{selectedMeeting.participants.length} participants</span><span>{formatDuration(selectedMeeting.durationSec)}</span><span>{selectedMeeting.id.startsWith("live-") ? `Live microphone capture${recordingSize ? ` · ${(recordingSize / 1024).toFixed(1)} KB` : ""}` : "Seeded demo meeting"}</span></div>
            <section className="mvp-player"><div className="mvp-player-top"><strong><span className="mvp-live-dot" /> {selectedMeeting.title}</strong><span>{formatTimestamp(currentTime)} / {formatTimestamp(selectedMeeting.durationSec)}</span></div><div className="mvp-waveform">{Array.from({ length: 70 }, (_, index) => <i key={index} style={{ height: `${18 + ((index * 23) % 60)}%` }} />)}</div><audio ref={audioRef} src={selectedMeeting.audioUrl} onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)} controls preload="metadata" /></section>
            <div className="mvp-main-grid"><section className="mvp-transcript"><div className="mvp-section-title"><div><span className="mvp-eyebrow">Conversation</span><h2>Transcript</h2></div><span>{selectedMeeting.transcript.length} segments</span></div>{selectedMeeting.transcript.map((segment) => <article className={`mvp-segment ${activeSegment?.id === segment.id ? "active" : ""} ${selectedHighlightIds.includes(segment.id) ? "highlighted" : ""}`} key={segment.id} onClick={() => seekTo(segment.startSec)}><div className="mvp-segment-time">{formatTimestamp(segment.startSec)}</div><div className="mvp-avatar">{segment.initials}</div><div><strong>{segment.speaker}</strong><p>{segment.text}</p></div><button aria-label="Highlight segment" onClick={(event) => { event.stopPropagation(); toggleHighlight(segment.id); }}><Highlighter size={15} fill={selectedHighlightIds.includes(segment.id) ? "currentColor" : "none"} /></button></article>)}</section>
              <aside className="mvp-insights"><div className="mvp-ai-heading"><span><Sparkles size={15} /> Fathom AI</span><select value={template} onChange={(event) => setTemplate(event.target.value)}><option>General meeting</option><option>Sales call</option><option>Engineering</option><option>1:1</option><option>Interview</option></select></div><nav className="mvp-tabs">{(["summary", "topics", "actions", "highlights"] as Tab[]).map((item) => <button className={tab === item ? "active" : ""} key={item} onClick={() => setTab(item)}>{item === "summary" ? "Summary" : item === "actions" ? "Action items" : item[0].toUpperCase() + item.slice(1)}{item === "actions" && <span>{selectedMeeting.actionItems.length}</span>}</button>)}</nav>{tab === "summary" && <div className="mvp-insight-body"><h3>{template} summary</h3><p>{selectedMeeting.summary}</p><h3>Key topics</h3><div className="mvp-tags">{selectedMeeting.topics.map((topic) => <span key={topic}>{topic}</span>)}</div><h3>Decisions</h3><ul>{selectedMeeting.decisions.map((decision) => <li key={decision}><Check size={14} />{decision}</li>)}</ul></div>}{tab === "topics" && <div className="mvp-insight-body"><h3>Topics from this meeting</h3>{selectedMeeting.topics.map((topic, index) => <div className="mvp-topic" key={topic}><span>0{index + 1}</span><strong>{topic}</strong><small>Discussed in the transcript</small></div>)}</div>}{tab === "actions" && <div className="mvp-insight-body"><h3>Follow-ups</h3>{selectedMeeting.actionItems.map((action) => <label className="mvp-action" key={action.id}><input type="checkbox" checked={completedIds.includes(action.id) || action.completed} onChange={() => toggleAction(action.id)} /><span><strong>{action.task}</strong><small>{action.owner}</small></span></label>)}</div>}{tab === "highlights" && <div className="mvp-insight-body"><h3>Saved highlights</h3>{selectedMeeting.transcript.filter((segment) => selectedHighlightIds.includes(segment.id)).map((segment) => <button className="mvp-highlight" key={segment.id} onClick={() => seekTo(segment.startSec)}><strong>{formatTimestamp(segment.startSec)}</strong><span>{segment.text}</span></button>)}{selectedHighlightIds.length === 0 && <p className="mvp-muted">Highlight a transcript segment to save it here.</p>}</div>}<div className="mvp-ask"><div><strong>Ask this meeting</strong><small>Search the transcript with a question</small></div><div className="mvp-ask-input"><input id="mvp-search" value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => event.key === "Enter" && askMeeting()} placeholder="Who owns the next step?" /><button onClick={askMeeting}><Link2 size={15} /></button></div>{answer && <p className="mvp-answer">{answer}</p>}</div></aside></div>
          </>}
        </section>
      </div>
      {isShareOpen && <div className="mvp-modal-backdrop" onClick={() => setIsShareOpen(false)}><section className="mvp-modal" onClick={(event) => event.stopPropagation()}><button className="mvp-modal-close" onClick={() => setIsShareOpen(false)}>×</button><span className="mvp-eyebrow">Share this meeting</span><h2>{selectedMeeting.title}</h2><p>Send a focused clip to someone who was not on the call.</p><button className={`mvp-share-choice ${shareMode === "clip" ? "selected" : ""}`} onClick={() => setShareMode("clip")}><strong>Selected clip</strong><small>14:48 - 15:36 · 48 seconds</small></button><button className={`mvp-share-choice ${shareMode === "full" ? "selected" : ""}`} onClick={() => setShareMode("full")}><strong>Entire meeting</strong><small>Share transcript and recording</small></button><button className="mvp-create-link" onClick={shareMeeting}>Create share link <Link2 size={15} /></button></section></div>}
    </main>
  );
}
