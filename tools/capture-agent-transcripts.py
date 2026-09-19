import argparse
import datetime as dt
import json
import os
import sqlite3
import time
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
LOGS_ROOT = REPO_ROOT / ".agent-logs"
STATE_PATH = Path(os.environ.get("LOCALAPPDATA", str(Path.home()))) / "fathom-agent-capture-state.json"
DB_PATH = Path(os.environ["APPDATA"]) / "Code - Insiders" / "User" / "globalStorage" / "github.copilot-chat" / "session-store.db"
MODEL = os.environ.get("COPILOT_CAPTURE_MODEL", "claude-fable-5.1")


def utc(value):
    parsed = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    return parsed.astimezone(dt.timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def load_state():
    if STATE_PATH.exists():
        return json.loads(STATE_PATH.read_text(encoding="utf-8"))
    return {"captured": []}


def save_state(state):
    STATE_PATH.write_text(json.dumps(state, indent=2), encoding="utf-8")


def log_path(session_id, timestamp):
    stamp = dt.datetime.fromisoformat(timestamp.replace("Z", "+00:00")).strftime("%Y-%m-%d_%H-%M-%S")
    return LOGS_ROOT / f"{stamp}_{session_id}.md"


def append_session(session_id, rows, state):
    if not rows:
        return
    first = utc(rows[0]["timestamp"])
    log_paths = state.setdefault("log_paths", {})
    path = Path(log_paths[session_id]) if session_id in log_paths else None
    if path is None:
        existing = sorted(LOGS_ROOT.glob(f"*_{session_id}.md"))
        path = existing[0] if existing else log_path(session_id, first)
        log_paths[session_id] = str(path)
    if not path.exists():
        path.write_text(
            "---\n"
            f"session_id: {session_id}\n"
            f"date: {first[:10]}\n"
            f"author: {os.environ.get('USERNAME', 'unknown')}\n"
            f"model: {MODEL}\n"
            "tool: vscode-copilot\n"
            f"project: {REPO_ROOT.name}\n"
            f"total_exchanges: {len(rows)}\n"
            f"first_prompt_time: {first}\n"
            f"last_prompt_time: {first}\n"
            "---\n\n"
            f"# Session Log - {first[:10]}\n\n"
            f"Session: `{session_id[:8]}` | Project: {REPO_ROOT.name}\n\n---\n\n",
            encoding="utf-8",
        )
    number = path.read_text(encoding="utf-8").count("[LOG_ENTRY type=PROMPT") + 1
    with path.open("a", encoding="utf-8") as output:
        for row in rows:
            prompt_time = utc(row["timestamp"])
            response_time = utc(row["response_timestamp"])
            output.write(
                f"[LOG_ENTRY type=PROMPT num={number} session={session_id[:8]}]\n"
                f"timestamp: {prompt_time}\nmodel: {MODEL}\n\n"
                f"{row['user_message']}\n\n"
                f"[LOG_ENTRY type=RESPONSE num={number} session={session_id[:8]}]\n"
                f"timestamp: {response_time}\nmodel: {MODEL}\n\n"
                f"{row['assistant_response']}\n\n"
            )
            state["captured"].append(f"{session_id}/{row['turn_index']}")
            number += 1


def capture_once():
    LOGS_ROOT.mkdir(parents=True, exist_ok=True)
    if not DB_PATH.exists():
        return
    state = load_state()
    repo = str(REPO_ROOT).lower()
    connection = sqlite3.connect(f"file:{DB_PATH}?mode=ro", uri=True)
    connection.row_factory = sqlite3.Row
    sessions = connection.execute(
        "SELECT id FROM sessions WHERE lower(cwd) = ?", (repo,)
    ).fetchall()
    for session in sessions:
        rows = connection.execute(
            "SELECT turn_index, user_message, assistant_response, timestamp "
            "FROM turns WHERE session_id = ? AND user_message IS NOT NULL "
            "AND assistant_response IS NOT NULL ORDER BY turn_index",
            (session["id"],),
        ).fetchall()
        pending = [dict(row) for row in rows if f"{session['id']}/{row['turn_index']}" not in state["captured"]]
        if pending:
            for row in pending:
                row["response_timestamp"] = row["timestamp"]
            append_session(session["id"], pending, state)
    connection.close()
    save_state(state)


parser = argparse.ArgumentParser()
parser.add_argument("--once", action="store_true")
parser.add_argument("--interval", type=float, default=2)
args = parser.parse_args()
while True:
    capture_once()
    if args.once:
        break
    time.sleep(args.interval)