"""用户模块 API：注册、登录、查询个人信息"""

from typing import Annotated

import bcrypt
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import create_access_token, get_current_user
from app.db import get_db
from app.db.models import User

router = APIRouter()


# ============================================================
# 请求 / 响应模型
# ============================================================
class RegisterRequest(BaseModel):
    """注册请求"""

    username: str = Field(..., min_length=2, max_length=64, description="用户名")
    password: str = Field(..., min_length=6, max_length=128, description="密码")
    nickname: str = Field(default="", max_length=64, description="昵称")
    phone: str | None = Field(default=None, max_length=20, description="手机号")
    email: str | None = Field(default=None, max_length=128, description="邮箱")


class LoginRequest(BaseModel):
    """登录请求"""

    account: str = Field(..., min_length=1, max_length=128, description="用户名或手机号")
    password: str = Field(..., min_length=1, max_length=128, description="密码")


class UserProfileResponse(BaseModel):
    """用户信息响应"""

    user_id: int
    username: str
    nickname: str
    avatar: str
    email: str | None
    phone: str | None
    signature: str
    created_at: str

    @classmethod
    def from_user(cls, user: User) -> "UserProfileResponse":
        return cls(
            user_id=user.id,
            username=user.username,
            nickname=user.nickname,
            avatar=user.avatar,
            email=user.email,
            phone=user.phone,
            signature=user.signature,
            created_at=user.created_at.isoformat() if user.created_at else "",
        )


class AuthResponse(BaseModel):
    """认证响应（注册/登录）"""

    token: str
    user: UserProfileResponse


# ============================================================
# 路由
# ============================================================
@router.post("/auth/login", response_model=dict)
async def login(
    body: LoginRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """用户登录：支持用户名或手机号 + 密码"""
    # 查找用户（username 或 phone）
    result = await db.execute(
        select(User).where(
            (User.username == body.account) | (User.phone == body.account)
        )
    )
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="账号或密码错误",
        )

    # 验证密码
    if not bcrypt.checkpw(body.password.encode("utf-8"), user.password.encode("utf-8")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="账号或密码错误",
        )

    token = create_access_token(user.id)
    return {
        "code": 200,
        "data": {
            "token": token,
            "user": UserProfileResponse.from_user(user).model_dump(),
        },
        "message": "ok",
    }


@router.post("/users", response_model=dict)
async def register(
    body: RegisterRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """用户注册"""
    # 检查用户名唯一性
    result = await db.execute(select(User).where(User.username == body.username))
    if result.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="用户名已被注册",
        )

    # 检查手机号唯一性
    if body.phone:
        result = await db.execute(select(User).where(User.phone == body.phone))
        if result.scalar_one_or_none() is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="手机号已被注册",
            )

    # 检查邮箱唯一性
    if body.email:
        result = await db.execute(select(User).where(User.email == body.email))
        if result.scalar_one_or_none() is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="邮箱已被注册",
            )

    # 创建用户
    password_hash = bcrypt.hashpw(
        body.password.encode("utf-8"), bcrypt.gensalt()
    ).decode("utf-8")

    user = User.create(
        username=body.username,
        password_hash=password_hash,
        nickname=body.nickname or body.username,
        phone=body.phone,
        email=body.email,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)

    token = create_access_token(user.id)
    return {
        "code": 200,
        "data": {
            "token": token,
            "user": UserProfileResponse.from_user(user).model_dump(),
        },
        "message": "ok",
    }


@router.get("/users/me", response_model=dict)
async def get_profile(
    user: Annotated[User, Depends(get_current_user)],
):
    """查询当前登录用户信息（需 JWT 认证）"""
    return {
        "code": 200,
        "data": UserProfileResponse.from_user(user).model_dump(),
        "message": "ok",
    }
