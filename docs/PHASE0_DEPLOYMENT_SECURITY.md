# 第 0 批整改：云部署阻断、安全基础与演示数据隔离

日期：2026-07-10

## 已完成

- 前端 API 默认改为同源 `/api`，可由 `window.__API_BASE__` 覆盖。本地开发和 Nginx 反向代理不再依赖浏览器自身的 `127.0.0.1:8000`。
- 前端默认运行于 `production`。店铺、产品、评论、对比、任务、报告与资讯的演示数据仅在 `window.__APP_ENV__ === "demo"` 时装载。
- 产品页、评论页和店铺页启动时先读取 `/api/stores`，并保留 `allStores` 作为完整店铺注册表。页面筛选只改变当前显示的 `stores`，不再覆盖完整数据源。
- 店铺下拉框使用 `allStores`；选择店铺会回填对应平台和站点。Amazon 站点范围为 US、UK、DE、JP、CA、FR，Coupang/Naver 固定 KR。
- 产品、评论、对比、任务和报告接口返回空数组时会清空现有内容并显示空状态；接口失败时不会回退展示演示数据。
- 密码从固定 Salt + SHA256 改为 bcrypt；默认管理员邮箱和初始密码改为环境变量控制。
- 新增数据库会话表。浏览器只持有随机令牌，数据库仅持有令牌摘要和过期时间；服务重启后会话仍有效，注销会删除对应会话。
- 默认管理员首次登录标记为需要改密码；新增 `POST /api/auth/change-password`，改密后清除该标记。
- 旧版本固定 Salt + SHA256 的默认管理员会在首次启动时一次性迁移为 bcrypt，并强制改密；生产环境没有 `ADMIN_INITIAL_PASSWORD` 时拒绝创建或迁移管理员，避免重新引入写死密码。
- CORS 改为环境变量白名单。生产环境会自动排除 `*`；同域 Nginx 部署不需要配置跨域来源。

## 环境变量

生产环境的 `.env` 至少应设置：

```env
APP_ENV=production
ADMIN_EMAIL=admin@your-domain.com
ADMIN_INITIAL_PASSWORD=replace-with-a-strong-one-time-password
SESSION_TTL_HOURS=168
CORS_ORIGINS=https://your-domain.com
```

`ADMIN_INITIAL_PASSWORD` 仅用于首次创建管理员。不要把真实 `.env`、平台密钥或初始密码提交到 GitHub。

## 验证结果

- `python -m unittest discover -s backend/tests`：41 项通过。
- 新增验证：登录响应不再泄露默认密码、清空内存缓存后会话仍可验证、旧默认管理员哈希迁移、首次改密流程、前端同源 API/店铺注册表/空结果契约。
- `node --check prototype/app.js`：通过。
- `git diff --check`：通过。

## 已知边界

- 当前店铺 Excel 实际只有 10 条店铺页记录：Amazon 8 条、Coupang 1 条、法国 1 条、加拿大 1 条，其中没有 Naver 行。系统不会凭空创建 Naver 店铺；需通过店铺管理新增或导入真实 Naver 店铺资料。
- 本批未修改产品、评论、整改任务或报告业务表结构，也未接入 Amazon SP-API、Coupang Open API 或 Naver Commerce API。
- 前端本批已接收 `must_change_password` 字段；独立的改密页面将与账号管理流程一起在下一批补齐。

## 下一批建议

1. 建立店铺和 Listing 的稳定身份：`store_id`、商品组和唯一约束。
2. 建立每日指标快照，真实计算 3/7/30/60/90/180/365 天周期。
3. 建立评论、供应商和整改任务的多对多关联，取消人工新增原始评论。
