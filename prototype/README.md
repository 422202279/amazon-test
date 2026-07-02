# CrossBorder Store Review Monitor Lite 静态原型

本目录是第一轮页面原型，只包含静态 `HTML + CSS + 少量 JS`，不接后端、不接数据库，所有数据均为假数据。

## 页面入口

- `index.html`：首页 Dashboard
- `stores.html`：店铺管理
- `products.html`：产品总表
- `reviews.html`：评论总表
- `comparison.html`：同款多店铺评论对比
- `product-detail.html`：产品详情
- `supplier-tasks.html`：供应商整改任务
- `reports.html`：报告中心
- `settings.html`：设置页

## 本地预览

方式 1：直接双击打开

1. 打开 `prototype` 目录
2. 双击 `index.html`
3. 通过左侧导航切换其他页面

方式 2：用本地静态服务打开

在 `prototype` 目录外层执行：

```bash
python3 -m http.server 4173 --directory prototype
```

然后访问：

```text
http://localhost:4173/index.html
```

如果你更习惯别的端口，可以把 `4173` 改成任意空闲端口。

## 当前原型重点

- 产品总表：宽表格、高密度字段、风险和整改状态集中展示
- 评论总表：1~5 星评论、评论图片、评论内容、店铺、站点、产品链接、问题分类、是否反馈供应商
- 多店铺对比：多个店铺同款产品的评分、差评占比、带图评论、主要问题 TOP3

## 当前不包含

- 后端接口
- 数据库存储
- Excel 导入导出真实逻辑
- 登录与权限真实功能
- 图表库接入
