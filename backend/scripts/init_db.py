"""创建 MySQL 全部表 + 预置分类数据 + Redis 连通性验证

用法（在 backend 目录下）：
    python -m scripts.init_db            # 增量建表
    python -m scripts.init_db --recreate # 删表重建
"""

import argparse
import os

from dotenv import load_dotenv

load_dotenv()

import asyncio
import sys

import redis.asyncio as aioredis
from app.db import Base, get_sync_engine
from app.db.models import Category


def _seed_categories() -> None:
    """预置默认分类（与 schema.sql 保持一致）。"""
    defaults = [
        ("餐饮", "food", 1),
        ("交通", "transport", 2),
        ("购物", "shopping", 3),
        ("娱乐", "entertainment", 4),
        ("住房", "housing", 5),
        ("医疗", "medical", 6),
        ("教育", "education", 7),
        ("通讯", "communication", 8),
        ("服饰", "clothing", 9),
        ("其他", "other", 99),
    ]
    engine = get_sync_engine()
    from sqlalchemy import text
    from sqlalchemy.orm import Session

    with Session(engine) as session:
        existing = {row[0] for row in session.execute(
            text("SELECT name FROM categories")
        ).fetchall()}
        added = 0
        for name, icon, sort_order in defaults:
            if name not in existing:
                session.add(Category(name=name, icon=icon, sort_order=sort_order))
                added += 1
        if added:
            session.commit()
            print(f"[init_db] 预置 {added} 条分类数据")


async def _check_redis() -> bool:
    """验证 Redis 连通性。"""
    redis_url = os.getenv("REDIS_URL", "redis://127.0.0.1:6379/0")
    try:
        r = aioredis.from_url(redis_url, decode_responses=True)
        await r.ping()
        await r.set("meowpurse:health", "ok", ex=10)
        val = await r.get("meowpurse:health")
        await r.aclose()
        return val == "ok"
    except Exception:
        return False


def main() -> None:
    parser = argparse.ArgumentParser(description="喵记数据库初始化")
    parser.add_argument("--recreate", action="store_true", help="删表重建")
    args = parser.parse_args()

    engine = get_sync_engine()

    if args.recreate:
        print("[init_db] 删除所有表 ...")
        Base.metadata.drop_all(engine)

    print("[init_db] 创建 MySQL 表 ...")
    Base.metadata.create_all(engine)
    tables = sorted(Base.metadata.tables.keys())
    print(f"[init_db] MySQL 表就绪（{len(tables)}）：{tables}")

    _seed_categories()

    redis_ok = asyncio.run(_check_redis())
    if redis_ok:
        print("[init_db] Redis 连通正常")
    else:
        print("[init_db] ⚠ Redis 连接失败，请检查服务是否启动")
        sys.exit(1)

    print("[init_db] 数据库初始化完成。")


if __name__ == "__main__":
    main()
