import json
import sys

raw = sys.stdin.read() or "{}"
try:
    params = json.loads(raw)
except Exception:
    params = {"_raw": raw}

print(json.dumps({"ok": True, "params": params}, ensure_ascii=False))
