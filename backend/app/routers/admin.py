import json

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user_account import UserAccount
from app.security import get_current_user, hash_password

router = APIRouter(prefix="/admin", tags=["admin"])


class UserPayload(BaseModel):
    name: str
    email: str
    role: str = "只读访客"
    scope: str | None = None
    stores: list[str] = []
    status: str = "启用"
    password: str | None = None


@router.get("/users")
def list_users(
    db: Session = Depends(get_db),
    _: UserAccount = Depends(get_current_user),
):
    users = db.query(UserAccount).order_by(UserAccount.created_at.asc(), UserAccount.id.asc()).all()
    return {
        "items": [_serialize_user(user) for user in users],
        "total": len(users),
        "notes": "V1 建议采用轻量后台：账号、角色、登录日志即可，不必先上复杂审批流。",
    }


@router.post("/users")
def create_user(
    payload: UserPayload,
    db: Session = Depends(get_db),
    _: UserAccount = Depends(get_current_user),
):
    existing = db.query(UserAccount).filter(UserAccount.email == payload.email).one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="该邮箱已存在")
    user = UserAccount(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password or "12345678"),
        role=payload.role,
        scope=payload.scope,
        stores_json=json.dumps(payload.stores, ensure_ascii=False),
        status=payload.status,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _serialize_user(user)


@router.put("/users/{user_id}")
def update_user(
    user_id: int,
    payload: UserPayload,
    db: Session = Depends(get_db),
    _: UserAccount = Depends(get_current_user),
):
    user = db.query(UserAccount).filter(UserAccount.id == user_id).one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="账号不存在")
    user.name = payload.name
    user.email = payload.email
    user.role = payload.role
    user.scope = payload.scope
    user.stores_json = json.dumps(payload.stores, ensure_ascii=False)
    user.status = payload.status
    if payload.password:
        user.password_hash = hash_password(payload.password)
    db.commit()
    db.refresh(user)
    return _serialize_user(user)


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: UserAccount = Depends(get_current_user),
):
    user = db.query(UserAccount).filter(UserAccount.id == user_id).one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="账号不存在")
    if user.email == "admin@cb-monitor.local":
        raise HTTPException(status_code=400, detail="默认管理员不可删除")
    db.delete(user)
    db.commit()
    return {"ok": True}


@router.get("/roles")
def list_roles(_: UserAccount = Depends(get_current_user)):
    return {
        "items": [
            {
                "role": "管理员",
                "modules": ["Dashboard", "店铺", "产品", "评论", "对比", "整改", "报告", "设置", "账号管理"],
                "permissions": ["查看", "导入", "导出", "编辑", "删除", "手动更新", "角色分配"],
            },
            {
                "role": "产品开发",
                "modules": ["Dashboard", "产品", "评论", "对比", "产品开发", "整改", "报告"],
                "permissions": ["查看", "导出", "标记问题", "生成整改建议"],
            },
            {
                "role": "运营",
                "modules": ["Dashboard", "店铺", "产品", "评论", "报告"],
                "permissions": ["查看", "导入", "导出", "批量分类"],
            },
            {
                "role": "数据录入",
                "modules": ["产品", "评论", "韩国手动导入"],
                "permissions": ["查看", "导入"],
            },
            {
                "role": "只读访客",
                "modules": ["Dashboard", "报告"],
                "permissions": ["查看"],
            },
        ]
    }


@router.get("/security")
def get_security_settings(_: UserAccount = Depends(get_current_user)):
    return {
        "login_mode": "账号密码登录",
        "deploy_mode": "轻量后台即可",
        "recommended_stack": ["FastAPI", "SQLite", "单管理员账号 + 少量子账号", "Nginx 基础鉴权"],
        "password_policy": "8位以上，建议含数字与字母",
        "mfa": "V1 可不启用，云端公网访问时建议后续补上邮箱验证码或二次验证",
        "session_policy": "7天内保持登录，可手动退出全部设备",
    }


def _serialize_user(user: UserAccount) -> dict:
    stores = []
    if user.stores_json:
        try:
            stores = json.loads(user.stores_json)
        except json.JSONDecodeError:
            stores = []
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "scope": user.scope,
        "status": user.status,
        "last_login": user.last_login_at.isoformat(sep=" ", timespec="minutes") if user.last_login_at else "-",
        "stores": stores,
    }
