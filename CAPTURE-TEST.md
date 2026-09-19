# Capture Test

Tool: GitHub Copilot in VS Code Insiders

Model: Claude Fable 5.1 (`claude-fable-5.1`), used for both planning and execution.

Automatic mechanism: a VS Code task with `runOptions.runOn: folderOpen` starts
`tools/capture-agent-transcripts.py`. The watcher reads the local Copilot session
store at `%APPDATA%\Code - Insiders\User\globalStorage\github.copilot-chat\session-store.db`
and appends completed `turns.user_message` and `turns.assistant_response` pairs to
`.agent-logs/`. Configuration changed: `.vscode/tasks.json`.

Expected log path: `.agent-logs/YYYY-MM-DD_HH-MM-SS_<session-id>.md`.

Canary status: PASSED. The first canary landed in
`.agent-logs/2026-09-19_10-05-24_fe3d67a2-f08a-4410-a334-ea00ff1903b5.md` and the
second, separate session landed in
`.agent-logs/2026-09-19_10-12-13_77003b65-0cfb-4a0a-8fcc-a9880e73f1d2.md`.
The first watcher also created same-session files during an earlier failed attempt;
that bug is documented below and fixed in the current watcher.

First canary entry, pasted raw:

```
[LOG_ENTRY type=PROMPT num=1 session=fe3d67a2]
timestamp: 2026-09-19T10:05:24.088Z
model: claude-fable-5.1

Send yourself a canary prompt: `CAPTURE TEST — 8x assignment, <your name>`

```



here is the prompt



```
 `CAPTURE TEST — 8x assignment, Ibad Kath`
```

[LOG_ENTRY type=RESPONSE num=1 session=fe3d67a2]
timestamp: 2026-09-19T10:05:24.088Z
model: claude-fable-5.1

CAPTURE TEST — 8x assignment, Ibad Kath received.
```

Second canary entry, pasted raw:

```
[LOG_ENTRY type=PROMPT num=1 session=77003b65]
timestamp: 2026-09-19T10:12:13.101Z
model: claude-fable-5.1

CAPTURE TEST — 8x assignment, Ibad Kath

[LOG_ENTRY type=RESPONSE num=1 session=77003b65]
timestamp: 2026-09-19T10:12:13.101Z
model: claude-fable-5.1

CAPTURE TEST — 8x assignment, Ibad Kath received.
```

First attempts that did not work:

- The Copilot JSONL transcript store records assistant and tool events but omits
  `user.message`, so it cannot provide verbatim prompts.
- A first watcher over all workspace transcripts also found unrelated sessions; it
  was removed and replaced with workspace-scoped SQLite session-store capture.
- The first SQLite watcher created a new file for each batch from one session; it now
  reuses one file per session.

The two-session canary check passed; assignment work may now begin.