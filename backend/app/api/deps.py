"""API 公共依赖（认证、分页等）"""

import os
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.db.models import User

# ============================================================
# JWT 配置
# ============================================================
_JWT_SECRET = os.getenv("JWT_SECRET", "change-me-to-a-random-secret")
_JWT_ALGORITHM = "HS256"
_JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "1440"))

_scheme = HTTPBearer()


def create_access_token(user_id: int) -> str:
    """生成 JWT access token。"""
    expire = datetime.now(timezone.utc) + timedelta(minutes=_JWT_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),
        "exp": expire,
    }
    return jwt.encode(payload, _JWT_SECRET, algorithm=_JWT_ALGORITHM)


def decode_access_token(token: str) -> int:
    """解析 JWT token，返回 user_id；解析失败抛出 JWTError。"""
    payload = jwt.decode(token, _JWT_SECRET, algorithms=[_JWT_ALGORITHM])
    return int(payload["sub"])


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """认证依赖：从 Authorization Header 提取 JWT 并返回当前用户。

    用法:
        @router.get("/users/me")
        async def my_profile(user: User = Depends(get_current_user)):
            ...
    """
    try:
        user_id = decode_access_token(credentials.credentials)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证令牌",
        )

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户不存在或已注销",
        )
    return user
