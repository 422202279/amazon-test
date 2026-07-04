# CrossBorder Store Review Monitor Lite

本仓库当前处于第一阶段：

- 静态原型已完成
- 后端骨架已开始搭建
- 产品数据字段映射与数据获取可行性评估已启动

## 目录

- `prototype/`：静态 HTML 原型
- `backend/`：FastAPI + SQLite 后端骨架
- `docs/`：评估文档与后续设计文档

## 当前后端可用能力

- `GET /api/health`
- `GET /api/stores`
- `GET /api/stores/import-preview/internal`
- `POST /api/stores/import/internal`
- `GET /api/products`
- `GET /api/products/compare`
- `GET /api/products/import-preview/internal`
- `GET /api/products/import-preview/sellersprite`
- `POST /api/products/import/internal`
- `POST /api/products/import/sellersprite`
- `GET /api/reviews`
- `GET /api/reviews/import-preview`
- `POST /api/reviews/import`
- `GET /api/supplier-tasks`
- `POST /api/supplier-tasks/generate-from-reviews`
- `GET /api/metrics`
- `GET /api/metrics/import-preview/sales-history`
- `POST /api/metrics/import/sales-history`
- `GET /api/ops/import-jobs`
- `GET /api/ops/data-quality`
- `GET /api/ops/schedule-settings`
- `POST /api/ops/manual-refresh`
- `GET /api/ops/source-capabilities`
- `GET /api/ops/deployment-profile`
- `GET /api/ops/live-validation`
- `GET /api/ops/backups`
- `POST /api/ops/backups/create`
- `POST /api/ops/backups/restore`
- `GET /api/admin/users`
- `GET /api/admin/roles`
- `GET /api/admin/security`

## 新增的导入校验能力

现在每次产品或评论导入，都会额外生成：

- 导入记录：来源文件、总行数、成功行数、失败行数、状态
- 质量摘要：缺少主键、缺少链接、评分异常、星级异常等警告统计

适用场景：

- 先人工导入评论，再由系统提示哪些行不完整
- 判断某次 Excel 导入是否足够干净，可以放心用于报表
- 为后续前端做“导入记录”和“数据健康度”页面提供接口基础

## 新增的真实查询能力

- 产品总表支持按 `平台 / 站点 / 店铺 / 关键词 / 多 ASIN / 多 SKU` 查询
- 评论总表支持两种视图：
  - `timeline`：全站评论按时间倒序
  - `product`：按产品聚合后查看最近评论
- 评论接口会附带供应商任务摘要字段：
  - `supplier_task_code`
  - `supplier_task_status`
  - `supplier_task_priority`
  - `supplier_name`
- 同款对比接口支持：
  - `Parent ASIN`
  - 多 `ASIN`
  - 多 `SKU`

## 本地启动

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python main.py
```

前端本地预览：

- 直接打开 `prototype/login.html`
- 默认本地管理员：
  - 账号：`admin@cb-monitor.local`
  - 密码：`admin123456`
- 一键启动后端：
  - `bash scripts/run_local_stack.sh`
- 一键启动本地演示前后端：
  - `bash scripts/start_local_demo.sh`
  - 打开：`http://127.0.0.1:4173/login.html`
- 停止本地演示：
  - `bash scripts/stop_local_demo.sh`
- 后端启动后，一键跑本地全流程冒烟：
  - `python3 scripts/local_smoke_test.py`
- 部署后健康检查：
  - `python3 scripts/deploy_self_check.py`

## 当前已打通的本地闭环

- 登录 / 退出
- 本地真实产品数据一键导入
- 账号管理增删改查
- 产品增删改查
- 评论增删改查
- 供应商整改任务增删改查

## 云部署准备

仓库已补充最低配部署骨架：

- `.env.example`
- `deploy/bootstrap.sh`
- `deploy/systemd/cb-monitor.service`
- `deploy/nginx/cb-monitor.conf`
- `docs/cloud-deployment-minimum-plan.md`
