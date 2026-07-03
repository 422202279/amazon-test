import hashlib
import secrets
from datetime import UTC, datetime

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user_account import UserAccount

TOKEN_STORE: dict[str, int] = {}
PASSWORD_SALT = "cb-monitor-lite-local"


def hash_password(password: str) -> str:
    return hashlib.sha256(f"{PASSWORD_SALT}:{password}".encode("utf-8")).hexdigest()


def verify_password(password: str, password_hash: str) -> bool:
    return hash_password(password) == password_hash


def create_session_token(user_id: int) -> str:
    token = secrets.token_urlsafe(32)
    TOKEN_STORE[token] = user_id
    return token


def remove_session_token(token: str | None) -> None:
    if token:
        TOKEN_STORE.pop(token, None)


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
    user_id = TOKEN_STORE.get(token or "")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="请先登录")
    user = db.query(UserAccount).filter(UserAccount.id == user_id).one_or_none()
    if not user or user.status != "启用":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="账号不可用，请重新登录")
    return user


def ensure_default_admin(db: Session) -> None:
    existing = db.query(UserAccount).filter(UserAccount.email == "admin@cb-monitor.local").one_or_none()
    if existing:
        return
    db.add(
        UserAccount(
            name="系统管理员",
            email="admin@cb-monitor.local",
            password_hash=hash_password("admin123456"),
            role="管理员",
            scope="全部店铺 / 全部模块",
            stores_json='["US Home Store","UK Living","JP Kitchen","CA Comfort"]',
            status="启用",
            last_login_at=datetime.now(UTC),
        )
    )
    db.commit()
