"""喵记 (MeowPurse) ORM 模型定义

SQLAlchemy 2.0 Mapped / mapped_column 声明式风格。
所有模型集中在本文件，对应 init_mysql.sql 中的 users / categories / bills 三张表。
"""

from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import (
    BigInteger,
    DateTime,
    DECIMAL,
    ForeignKey,
    Index,
    Integer,
    String,
    func,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


# ============================================================
# 声明式基类
# ============================================================
class Base(DeclarativeBase):
    """SQLAlchemy 声明式基类，所有 ORM 模型继承自此。"""

    pass


# ============================================================
# 1. 用户模型
# ============================================================
class User(Base):
    """用户表"""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(
        String(256), nullable=False, comment="bcrypt 哈希"
    )
    email: Mapped[Optional[str]] = mapped_column(
        String(128), unique=True, nullable=True, comment="邮箱"
    )
    phone: Mapped[Optional[str]] = mapped_column(
        String(20), unique=True, nullable=True, comment="手机号"
    )
    signature: Mapped[str] = mapped_column(
        String(256), default="", comment="个性签名"
    )
    nickname: Mapped[str] = mapped_column(String(64), default="")
    avatar: Mapped[str] = mapped_column(String(512), default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.current_timestamp()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp(),
    )

    # --- 关系 ---
    bills: Mapped[list["Bill"]] = relationship(back_populates="user", lazy="selectin")

    # --- 工厂方法 ---
    @classmethod
    def create(
        cls,
        username: str,
        password_hash: str,
        nickname: str = "",
        avatar: str = "",
        email: str | None = None,
        phone: str | None = None,
        signature: str = "",
    ) -> "User":
        """创建用户实例（密码应预先经 bcrypt 哈希）。"""
        return cls(
            username=username,
            password=password_hash,
            nickname=nickname,
            avatar=avatar,
            email=email,
            phone=phone,
            signature=signature,
        )

    def __repr__(self) -> str:
        return f"<User id={self.id} username={self.username!r}>"


# ============================================================
# 2. 分类模型
# ============================================================
class Category(Base):
    """账单分类表"""

    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(
        String(32), unique=True, nullable=False, comment="分类名称"
    )
    icon: Mapped[str] = mapped_column(String(64), default="", comment="图标标识")
    sort_order: Mapped[int] = mapped_column(Integer, default=0, comment="排序权重")

    # --- 表级索引 ---
    __table_args__ = (Index("idx_sort", "sort_order"),)

    # --- 工厂方法 ---
    @classmethod
    def create(cls, name: str, icon: str = "", sort_order: int = 0) -> "Category":
        """创建分类实例。"""
        return cls(name=name, icon=icon, sort_order=sort_order)

    def __repr__(self) -> str:
        return f"<Category id={self.id} name={self.name!r}>"


# ============================================================
# 3. 账单模型
# ============================================================
class Bill(Base):
    """账单表"""

    __tablename__ = "bills"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("users.id", ondelete="CASCADE", onupdate="CASCADE"),
        nullable=False,
        comment="用户ID",
    )
    amount: Mapped[Decimal] = mapped_column(
        DECIMAL(12, 2),
        nullable=False,
        comment="金额（正=收入，负=支出）",
    )
    category: Mapped[str] = mapped_column(
        String(32), nullable=False, comment="分类名称"
    )
    note: Mapped[str] = mapped_column(String(512), default="", comment="备注")
    source: Mapped[str] = mapped_column(
        String(16),
        default="manual",
        comment="来源: voice / manual",
    )
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, comment="记账时间"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.current_timestamp()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp(),
    )

    # --- 关系 ---
    user: Mapped["User"] = relationship(back_populates="bills")

    # --- 表级索引 ---
    __table_args__ = (
        Index("idx_user_time", "user_id", "recorded_at"),
        Index("idx_user_cat", "user_id", "category"),
        Index("idx_user_amount", "user_id", "amount"),
    )

    # --- 工厂方法 ---
    @classmethod
    def from_voice(
        cls,
        user_id: int,
        amount: Decimal,
        category: str,
        recorded_at: datetime,
        note: str = "",
    ) -> "Bill":
        """从语音识别结果创建账单（source=voice）。"""
        return cls(
            user_id=user_id,
            amount=amount,
            category=category,
            note=note,
            source="voice",
            recorded_at=recorded_at,
        )

    @classmethod
    def from_manual(
        cls,
        user_id: int,
        amount: Decimal,
        category: str,
        recorded_at: datetime,
        note: str = "",
    ) -> "Bill":
        """从手动输入创建账单（source=manual）。"""
        return cls(
            user_id=user_id,
            amount=amount,
            category=category,
            note=note,
            source="manual",
            recorded_at=recorded_at,
        )

    def __repr__(self) -> str:
        return (
            f"<Bill id={self.id} amount={self.amount} "
            f"category={self.category!r} source={self.source!r}>"
        )
