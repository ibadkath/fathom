const transcript = [
  { time: "14:48", speaker: "Tina Nguyen", text: "We can pull the collaborative notes work forward by two weeks. It gives new teams a reason to invite others on day one." },
  { time: "22:06", speaker: "Jordan Lee", text: "I'll take the first pass on the new onboarding flow and bring a clickable prototype to Thursday's review." },
];

export default async function SharedMeetingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  return (
    <main style={{ minHeight: "100vh", padding: "48px 24px", color: "#252526", background: "#fbfaf8", fontFamily: "Arial, sans-serif" }}>
      <section style={{ width: "min(760px, 100%)", margin: "0 auto", padding: "32px", border: "1px solid #e8e7e4", borderRadius: 12, background: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 36 }}>
          <strong style={{ fontSize: 20 }}>fathom</strong>
          <span style={{ color: "#777773", fontSize: 12 }}>Shared meeting clip</span>
        </div>
        <p style={{ margin: "0 0 8px", color: "#9a9995", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>Shared privately</p>
        <h1 style={{ margin: "0 0 10px", fontFamily: "Georgia, serif", fontSize: 34, fontWeight: 400 }}>Q3 product strategy</h1>
        <p style={{ margin: "0 0 28px", color: "#777773", fontSize: 13 }}>A focused clip from 14:48 - 15:36, shared with you by Ibad.</p>
        <audio controls preload="metadata" style={{ width: "100%", marginBottom: 28 }} src="https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3">
          Your browser does not support audio playback.
        </audio>
        <div style={{ paddingTop: 24, borderTop: "1px solid #e8e7e4" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 16 }}>Transcript</h2>
          {transcript.map((line) => (
            <article key={line.time} style={{ display: "grid", gridTemplateColumns: "52px 1fr", gap: 16, padding: "14px 0", borderBottom: "1px solid #f0efed" }}>
              <span style={{ color: "#f26d5b", fontSize: 11, fontWeight: 700 }}>{line.time}</span>
              <p style={{ margin: 0, color: "#595955", fontSize: 13, lineHeight: 1.6 }}><strong style={{ display: "block", marginBottom: 4, color: "#696864", fontSize: 12 }}>{line.speaker}</strong>{line.text}</p>
            </article>
          ))}
        </div>
        <small style={{ display: "block", marginTop: 24, color: "#aaa9a5", fontSize: 10 }}>Share token: {token}</small>
      </section>
    </main>
  );
}
