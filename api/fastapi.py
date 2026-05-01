"""
Vercel Python serverless entry point for the FastAPI backend.
Vercel routes /api/backend/* here. The StripPrefix middleware
removes that prefix so FastAPI sees the original paths (/matches, /auth/login, etc.)
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.main import app as _fastapi_app  # noqa: E402

_PREFIX = "/api/backend"


class _StripPrefix:
    """ASGI middleware: strips the Vercel routing prefix before FastAPI sees it."""

    def __init__(self, app, prefix: str) -> None:
        self.app = app
        self._prefix = prefix.rstrip("/")
        self._prefix_bytes = self._prefix.encode()

    async def __call__(self, scope, receive, send):
        if scope.get("type") in ("http", "websocket"):
            path: str = scope.get("path", "/")
            if path.startswith(self._prefix):
                new_path = path[len(self._prefix):] or "/"
                raw: bytes = scope.get("raw_path", b"")
                scope = {
                    **scope,
                    "path": new_path,
                    "raw_path": (raw[len(self._prefix_bytes):] or b"/")
                    if raw.startswith(self._prefix_bytes)
                    else raw,
                }
        await self.app(scope, receive, send)


app = _StripPrefix(_fastapi_app, _PREFIX)
