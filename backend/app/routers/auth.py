from datetime import UTC, datetime

from fastapi import APIRouter, Depends, Header, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user_account import UserAccount
from app.security import (
    create_session_token,
    ensure_default_admin,
    extract_bearer_token,
    get_current_user,
    remove_session_token,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginPayload(BaseModel):
    email: str
    password: str


@router.post("/login")
def login(payload: LoginPayload, db: Session = Depends(get_db)):
    ensure_default_admin(db)
    user = db.query(UserAccount).filter(UserAccount.email == payload.email).one_or_none()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="账号或密码错误")
    if user.status != "启用":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="账号已停用")
    user.last_login_at = datetime.now(UTC)
    db.commit()
    token = create_session_token(user.id)
    return {
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "scope": user.scope,
            "status": user.status,
        },
        "default_password_notice": "本地默认管理员：admin@cb-monitor.local / admin123456",
    }


@router.get("/me")
def me(user: UserAccount = Depends(get_current_user)):
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "scope": user.scope,
        "status": user.status,
    }


@router.post("/logout")
def logout(authorization: str | None = Header(default=None)):
    remove_session_token(extract_bearer_token(authorization))
    return {"ok": True}
