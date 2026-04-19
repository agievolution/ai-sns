import atexit
import json
import queue
import threading
import time
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Optional


class _LLMNdjsonWriter:
    def __init__(self) -> None:
        self._max_bytes_per_file = 5 * 1024 * 1024
        self._flush_interval_sec = 1.0
        self._max_batch = 100
        self._queue: "queue.Queue[dict]" = queue.Queue(maxsize=20000)
        self._stop_evt = threading.Event()
        self._thread: Optional[threading.Thread] = None

        self._fp = None
        self._current_date = ""
        self._current_bytes = 0

        self._logs_root = Path(__file__).resolve().parents[1] / "logs"
        try:
            self._logs_root.mkdir(parents=True, exist_ok=True)
        except Exception:
            pass

        self._start()
        atexit.register(self.shutdown)

    def _start(self) -> None:
        if self._thread and self._thread.is_alive():
            return
        self._thread = threading.Thread(target=self._run, name="llm-ndjson-writer", daemon=True)
        self._thread.start()

    def new_request_id(self) -> str:
        return uuid.uuid4().hex

    def enqueue(self, event: dict) -> None:
        if not isinstance(event, dict):
            return
        self._start()
        try:
            self._queue.put(event, block=True)
        except Exception:
            try:
                self._write_batch([event])
            except Exception:
                return

    def shutdown(self) -> None:
        try:
            self._stop_evt.set()
        except Exception:
            pass
        try:
            self._queue.put_nowait({"_kind": "__shutdown__"})
        except Exception:
            pass
        try:
            if self._thread and self._thread.is_alive():
                self._thread.join(timeout=5.0)
        except Exception:
            pass
        try:
            self._close_fp()
        except Exception:
            pass

    def _close_fp(self) -> None:
        fp = self._fp
        self._fp = None
        if not fp:
            return
        try:
            fp.flush()
        except Exception:
            pass
        try:
            fp.close()
        except Exception:
            pass

    def _ensure_fp(self) -> None:
        date_str = datetime.now().strftime("%Y-%m-%d")
        if date_str != self._current_date:
            self._close_fp()
            self._current_date = date_str
            self._current_bytes = 0

        if self._fp and self._current_bytes < self._max_bytes_per_file:
            return

        if self._fp:
            self._close_fp()

        day_dir = self._logs_root / self._current_date
        day_dir.mkdir(parents=True, exist_ok=True)

        while True:
            ts = datetime.now().strftime("%H%M%S_%f")
            name = f"{ts}.ndjson"
            path = day_dir / name
            try:
                fp = open(path, "x", encoding="utf-8")
            except FileExistsError:
                continue
            except Exception:
                continue

            self._fp = fp
            try:
                self._current_bytes = path.stat().st_size
            except Exception:
                self._current_bytes = 0
            break

    def _write_batch(self, batch: list[dict]) -> None:
        if not batch:
            return
        self._ensure_fp()
        if not self._fp:
            return

        for ev in batch:
            line = json.dumps(ev, ensure_ascii=False, separators=(",", ":"))
            data = line + "\n"
            self._fp.write(data)
            try:
                self._current_bytes += len(data.encode("utf-8"))
            except Exception:
                self._current_bytes += len(data)

            if self._current_bytes >= self._max_bytes_per_file:
                self._close_fp()
                self._ensure_fp()

        try:
            self._fp.flush()
        except Exception:
            pass

    def _run(self) -> None:
        buf: list[dict] = []
        last_flush = time.monotonic()

        while True:
            if self._stop_evt.is_set() and self._queue.empty():
                break

            try:
                item = self._queue.get(timeout=0.2)
            except queue.Empty:
                item = None

            if isinstance(item, dict) and item.get("_kind") == "__shutdown__":
                break

            if isinstance(item, dict):
                buf.append(item)

            now = time.monotonic()
            should_flush = False
            if len(buf) >= self._max_batch:
                should_flush = True
            elif buf and (now - last_flush) >= self._flush_interval_sec:
                should_flush = True

            if should_flush:
                try:
                    self._write_batch(buf)
                finally:
                    buf.clear()
                    last_flush = now

        if buf:
            try:
                self._write_batch(buf)
            except Exception:
                pass
        self._close_fp()


_writer_singleton: Optional[_LLMNdjsonWriter] = None


def _get_writer() -> _LLMNdjsonWriter:
    global _writer_singleton
    if _writer_singleton is None:
        _writer_singleton = _LLMNdjsonWriter()
    return _writer_singleton


def new_request_id() -> str:
    return _get_writer().new_request_id()


def _jsonable(obj: Any) -> Any:
    if obj is None or isinstance(obj, (str, int, float, bool)):
        return obj
    if isinstance(obj, dict):
        return {str(k): _jsonable(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [_jsonable(x) for x in obj]

    dump = getattr(obj, "model_dump", None)
    if callable(dump):
        try:
            return _jsonable(dump())
        except Exception:
            pass

    dump2 = getattr(obj, "dict", None)
    if callable(dump2):
        try:
            return _jsonable(dump2())
        except Exception:
            pass

    return str(obj)


def log_llm_request(*, request_id: str, source: str, request_json: Any) -> None:
    ev = {
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "kind": "llm_request",
        "request_id": str(request_id or ""),
        "source": str(source or ""),
        "request_json": _jsonable(request_json),
    }
    _get_writer().enqueue(ev)


def log_llm_response(*, request_id: str, source: str, response_json: Any) -> None:
    ev = {
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "kind": "llm_response",
        "request_id": str(request_id or ""),
        "source": str(source or ""),
        "response_json": _jsonable(response_json),
    }
    _get_writer().enqueue(ev)


def log_llm_stream_chunk(*, request_id: str, source: str, stream_raw: Any) -> None:
    ev = {
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "kind": "llm_stream_chunk",
        "request_id": str(request_id or ""),
        "source": str(source or ""),
        "stream_raw": _jsonable(stream_raw),
    }
    _get_writer().enqueue(ev)


def log_llm_error(*, request_id: str, source: str, error: Any) -> None:
    ev = {
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "kind": "llm_error",
        "request_id": str(request_id or ""),
        "source": str(source or ""),
        "stream_raw": _jsonable({"error": str(error)}),
    }
    _get_writer().enqueue(ev)
