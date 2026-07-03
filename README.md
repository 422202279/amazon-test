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
