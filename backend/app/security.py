import secrets
import hashlib
from datetime import UTC, datetime, timedelta

import bcrypt

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user_account import UserAccount
from app.models.user_session import UserSession
from app.config import settings

# Kept only as a compatibility symbol for tests and running processes. Sessions are persisted in SQLite.
TOKEN_STORE: dict[str, int] = {}


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except (ValueError, TypeError):
        return False


def _token_hash(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _initial_admin_password() -> str:
    if settings.admin_initial_password:
        return settings.admin_initial_password
    if settings.app_env.lower() == "production":
        raise RuntimeError("生产环境必须设置 ADMIN_INITIAL_PASSWORD 后才能创建或迁移管理员账号")
    return "admin123456"


def _is_legacy_sha256(password_hash: str | None) -> bool:
    return bool(password_hash and len(password_hash) == 64 and all(char in "0123456789abcdef" for char in password_hash.lower()))


def create_session_token(user_id: int, db: Session) -> str:
    token = secrets.token_urlsafe(32)
    db.add(
        UserSession(
            user_id=user_id,
            token_hash=_token_hash(token),
            expires_at=datetime.now(UTC) + timedelta(hours=settings.session_ttl_hours),
        )
    )
    db.commit()
    return token


def remove_session_token(token: str | None, db: Session) -> None:
    if token:
        db.query(UserSession).filter(UserSession.token_hash == _token_hash(token)).delete()
        db.commit()


def extract_bearer_token(authorization: str | None) -> str | None:
    if not authorization:
        return None
    if not authorization.lower().startswith("bearer "):
        return None
    return authorization.split(" ", 1)[1].strip()


def get_current_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> UserAccount:
    token = extract_bearer_token(authorization)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="请先登录")
    session = db.query(UserSession).filter(UserSession.token_hash == _token_hash(token)).one_or_none()
    if not session or session.expires_at <= datetime.now(UTC).replace(tzinfo=None):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="登录已失效，请重新登录")
    user = db.query(UserAccount).filter(UserAccount.id == session.user_id).one_or_none()
    if not user or user.status != "启用":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="账号不可用，请重新登录")
    return user


def ensure_default_admin(db: Session) -> None:
    existing = db.query(UserAccount).filter(UserAccount.email == settings.admin_email).one_or_none()
    if existing:
        if _is_legacy_sha256(existing.password_hash):
            existing.password_hash = hash_password(_initial_admin_password())
            existing.must_change_password = True
            db.commit()
        return
    db.add(
        UserAccount(
            name="系统管理员",
            email=settings.admin_email,
            password_hash=hash_password(_initial_admin_password()),
            role="管理员",
            scope="全部店铺 / 全部模块",
            stores_json='["US Home Store","UK Living","JP Kitchen","CA Comfort"]',
            status="启用",
            must_change_password=True,
            last_login_at=datetime.now(UTC),
        )
    )
    db.commit()
