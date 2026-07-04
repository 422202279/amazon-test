# 云端最低配部署方案

适用范围：

- 个人使用
- 2~5 人小团队
- 以 Amazon 为主链路，韩国站低频手动补数

## 推荐最低配置

- 云服务器：2 核 2G
- 系统：Ubuntu 22.04 LTS
- 域名：1 个
- HTTPS 证书：Let's Encrypt 免费证书

## 运行栈

- 前端：静态 HTML / CSS / 少量 JS
- 后端：FastAPI
- 数据库：SQLite
- 反向代理：Nginx
- 进程守护：systemd

## 为什么先不用更重的方案

- 当前用户量很小
- 主要是产品、评论、整改、报告四类轻量数据
- 暂时不需要 Redis、MySQL、消息队列、容器编排
- 先把数据链路跑顺，比基础设施堆太多更重要

## 数据获取建议

### Amazon

- 产品：以 SellerSprite / 内部产品表导入为主
- 评论：以导出 / 人工整理 / 后续卖家侧可得数据为主
- 云端不建议依赖高频页面抓取

### Coupang

- 当前无卖家 API 时，不适合作为云端自动主链路
- 建议：人工采集产品主档 + 模板导入

### Naver

- 当前无卖家 API 时，不适合作为云端自动主链路
- 建议：人工采集产品主档 + 模板导入

## 流量与存储控制

- 评论图片只保留缩略图或链接
- 评论视频不保存原文件，只保留封面图和原评论链接
- 默认每天早上 06:00 低频刷新一次
- 韩国站不做高频自动抓取

## 当前仓库已提供

- `.env.example`
- `deploy/bootstrap.sh`
- `deploy/systemd/cb-monitor.service`
- `deploy/nginx/cb-monitor.conf`
- `scripts/deploy_self_check.py`
- `scripts/local_smoke_test.py`

## 后续部署顺序

1. 购买最低配云服务器
2. 安装 Python / Nginx
3. 上传当前项目
4. 执行 `deploy/bootstrap.sh`
5. 配置 systemd 服务
6. 配置 Nginx
7. 绑定域名
8. 申请 HTTPS 证书
9. 导入首批产品与评论样本
10. 验证前台页面、接口、定时任务

## 部署后建议立刻执行

1. 跑健康检查：`python3 scripts/deploy_self_check.py`
2. 跑业务冒烟：`python3 scripts/local_smoke_test.py`
3. 创建首个数据库备份
4. 如误操作，可用备份恢复 SQLite 主库
