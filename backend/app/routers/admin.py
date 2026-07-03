from fastapi import APIRouter

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users")
def list_users():
    users = [
        {
            "id": 1,
            "name": "系统管理员",
            "email": "admin@cb-monitor.local",
            "role": "管理员",
            "scope": "全部店铺 / 全部模块",
            "status": "启用",
            "last_login": "2026-07-03 09:12",
            "stores": ["US Home Store", "UK Living", "JP Kitchen", "CA Comfort"],
        },
        {
            "id": 2,
            "name": "产品开发A",
            "email": "pd-a@cb-monitor.local",
            "role": "产品开发",
            "scope": "产品总表 / 评论总表 / 产品开发 / 供应商整改",
            "status": "启用",
            "last_login": "2026-07-03 08:46",
            "stores": ["US Home Store", "CA Comfort"],
        },
        {
            "id": 3,
            "name": "运营同事B",
            "email": "ops-b@cb-monitor.local",
            "role": "运营",
            "scope": "店铺 / 产品 / 评论 / 报告导出",
            "status": "启用",
            "last_login": "2026-07-02 19:35",
            "stores": ["UK Living", "DE Ordnung", "FR Maison"],
        },
        {
            "id": 4,
            "name": "韩国数据专员",
            "email": "kr-data@cb-monitor.local",
            "role": "数据录入",
            "scope": "韩国站产品 / 评论导入",
            "status": "停用",
            "last_login": "2026-06-29 14:18",
            "stores": ["Coupang Seoul", "Naver Living"],
        },
    ]
    return {
        "items": users,
        "total": len(users),
        "notes": "V1 建议采用轻量后台：账号、角色、登录日志即可，不必先上复杂审批流。",
    }


@router.get("/roles")
def list_roles():
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
def get_security_settings():
    return {
        "login_mode": "账号密码登录",
        "deploy_mode": "轻量后台即可",
        "recommended_stack": ["FastAPI", "SQLite", "单管理员账号 + 少量子账号", "Nginx 基础鉴权"],
        "password_policy": "8位以上，建议含数字与字母",
        "mfa": "V1 可不启用，云端公网访问时建议后续补上邮箱验证码或二次验证",
        "session_policy": "7天内保持登录，可手动退出全部设备",
    }
