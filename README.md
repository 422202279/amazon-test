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
- `GET /api/products/import-preview/internal`
- `GET /api/products/import-preview/sellersprite`

## 本地启动

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python main.py
```
