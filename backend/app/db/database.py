"""数据库连接与会话管理

基于 aiomysql 异步驱动 + SQLAlchemy 2.0 AsyncEngine。
引擎实例通过 @lru_cache 单例复用，session 通过 async_sessionmaker 工厂创建。
同步引擎仅用于 DDL（create_all / drop_all）。
"""

import os
from functools import lru_cache
from typing import AsyncGenerator

from sqlalchemy import Engine, create_engine
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

# ============================================================
# 配置（从环境变量读取，后续可迁移到 core/config.py）
# ============================================================
_MYSQL_HOST = os.getenv("MYSQL_HOST", "127.0.0.1")
_MYSQL_PORT = os.getenv("MYSQL_PORT", "3306")
_MYSQL_USER = os.getenv("MYSQL_USER", "root")
_MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
_MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "meowpurse")

_DATABASE_URL = (
    f"mysql+aiomysql://{_MYSQL_USER}:{_MYSQL_PASSWORD}"
    f"@{_MYSQL_HOST}:{_MYSQL_PORT}/{_MYSQL_DATABASE}"
    "?charset=utf8mb4"
)

# 同步引擎 URL（pymysql 驱动，仅用于 DDL）
_SYNC_DATABASE_URL = (
    f"mysql+pymysql://{_MYSQL_USER}:{_MYSQL_PASSWORD}"
    f"@{_MYSQL_HOST}:{_MYSQL_PORT}/{_MYSQL_DATABASE}"
    "?charset=utf8mb4"
)


def _build_engine() -> AsyncEngine:
    """创建异步引擎实例（内部函数，由 @lru_cache 包装）。"""
    return create_async_engine(
        _DATABASE_URL,
        echo=os.getenv("APP_ENV") == "development",
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
        pool_recycle=3600,
    )


@lru_cache
def get_engine() -> AsyncEngine:
    """获取全局唯一的 AsyncEngine 实例（@lru_cache 单例）。"""
    return _build_engine()


def get_async_sessionmaker() -> async_sessionmaker[AsyncSession]:
    """获取 AsyncSession 工厂。

    每次调用均基于全局 engine 创建新的 sessionmaker，
    确保 session 配置（如 expire_on_commit）可灵活调整。
    """
    return async_sessionmaker(
        bind=get_engine(),
        class_=AsyncSession,
        expire_on_commit=False,
    )


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI 依赖注入：提供请求级 AsyncSession。

    用法:
        @router.get("/bills")
        async def list_bills(db: AsyncSession = Depends(get_db)):
            result = await db.execute(select(Bill))
            return result.scalars().all()
    """
    async_session = get_async_sessionmaker()
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


@lru_cache
def get_sync_engine() -> Engine:
    """获取同步引擎（仅用于 DDL：create_all / drop_all）。"""
    return create_engine(_SYNC_DATABASE_URL, echo=False)
