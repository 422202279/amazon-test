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
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginPayload(BaseModel):
    email: str
    password: str


class ChangePasswordPayload(BaseModel):
    current_password: str
    new_password: str


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
    token = create_session_token(user.id, db)
    return {
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "scope": user.scope,
            "status": user.status,
            "must_change_password": user.must_change_password,
        },
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


@router.post("/change-password")
def change_password(
    payload: ChangePasswordPayload,
    db: Session = Depends(get_db),
    user: UserAccount = Depends(get_current_user),
):
    if len(payload.new_password) < 12:
        raise HTTPException(status_code=400, detail="新密码至少需要 12 位")
    if not verify_password(payload.current_password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="当前密码不正确")
    user.password_hash = hash_password(payload.new_password)
    user.must_change_password = False
    db.commit()
    return {"ok": True}


@router.post("/logout")
def logout(authorization: str | None = Header(default=None), db: Session = Depends(get_db)):
    remove_session_token(extract_bearer_token(authorization), db)
    return {"ok": True}
