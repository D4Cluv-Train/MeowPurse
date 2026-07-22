"""喵记 (MeowPurse) FastAPI 应用入口"""

import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.db import get_async_sessionmaker


# ============================================================
# 生命周期
# ============================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用启动/关闭时的初始化与清理。"""
    yield


app = FastAPI(
    title="喵记 MeowPurse",
    version="0.0.1",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# 健康检查
# ============================================================
@app.get("/api/v1/health")
async def health_check():
    """健康检查：验证 MySQL + Redis 连通性。"""
    import redis.asyncio as aioredis

    checks: dict[str, str] = {}

    # MySQL
    try:
        async_session = get_async_sessionmaker()
        async with async_session() as session:
            await session.execute(text("SELECT 1"))
        checks["mysql"] = "ok"
    except Exception as exc:
        checks["mysql"] = f"error: {exc}"

    # Redis
    try:
        redis_url = os.getenv("REDIS_URL", "redis://127.0.0.1:6379/0")
        r = aioredis.from_url(redis_url, decode_responses=True)
        await r.ping()
        await r.aclose()
        checks["redis"] = "ok"
    except Exception as exc:
        checks["redis"] = f"error: {exc}"

    all_ok = all(v == "ok" for v in checks.values())
    return {
        "code": 0 if all_ok else 1,
        "data": checks,
        "message": "ok" if all_ok else "service unavailable",
    }
