import enum
import uuid as uuid_pkg
from datetime import datetime
from typing import Optional, List
from sqlalchemy import (
    DateTime,
    Enum as SQLEnum,
    Integer,
    String,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    DRIVER = "DRIVER"
    ANALYST = "ANALYST"
    VIEWER = "VIEWER"


class UserStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    SUSPENDED = "SUSPENDED"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    uuid: Mapped[uuid_pkg.UUID] = mapped_column(
        UUID(as_uuid=True),
        default=uuid_pkg.uuid4,
        unique=True,
        index=True,
        nullable=False,
    )
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), default="", nullable=False)
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    organization: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    department: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    
    role: Mapped[UserRole] = mapped_column(
        SQLEnum(UserRole, name="platform_user_role", native_enum=False),
        default=UserRole.VIEWER,
        nullable=False,
        index=True,
    )
    status: Mapped[UserStatus] = mapped_column(
        SQLEnum(UserStatus, name="platform_user_status", native_enum=False),
        default=UserStatus.ACTIVE,
        nullable=False,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    last_login: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Relationships
    password_resets: Mapped[List["PasswordResetToken"]] = relationship(
        "PasswordResetToken",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    @property
    def full_name(self) -> str:
        name = f"{self.first_name} {self.last_name}".strip()
        return name if name else self.email.split("@")[0]

    @property
    def name(self) -> str:
        return self.full_name

    @property
    def phone_number(self) -> Optional[str]:
        return self.phone

    @property
    def is_active(self) -> bool:
        return self.status == UserStatus.ACTIVE

    @property
    def last_login_at(self) -> Optional[datetime]:
        return self.last_login

    @last_login_at.setter
    def last_login_at(self, val: Optional[datetime]):
        self.last_login = val

    def __repr__(self) -> str:
        try:
            return f"<User(id={self.id}, email='{self.email}')>"
        except Exception:
            return "<User(detached)>"
