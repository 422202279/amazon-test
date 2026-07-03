# 真实数据链路验证

更新时间：2026-07-03

## 一、已经确认能拿到的真实产品样本

本次直接用现有真实源导入验证，已成功入库 5 条真实产品数据：

### 内部产品总表导入

- `英国-新店`
  - `ASIN`: `B0FP4JG5TD`
  - 标题：`Pet Prime 安抚心跳毛绒玩具，加热/保暖（French Bulldog）`
  - 产品链接：`https://www.amazon.co.uk/Pet-Prime-Heartbeat-Separation-Variable-speed/dp/B0FP4JG5TD/ref=sr_1_1`
  - 评分：`4.4`
  - Review 数：`37`

- `英国-新店`
  - `ASIN`: `B0F1CTJ8C7`
  - 标题：`Pet Prime 益智慢食喂食器，自动喂食器，猫互动玩具（Green）`
  - 评分：`3.9`
  - Review 数：`37`

### 卖家精灵 CA 导入

- `Petmo`
  - `ASIN`: `B0GFVWMWM8`
  - 标题：`Pet Prime Interactive Dog Ball...`
  - 产品链接：`https://www.amazon.ca/dp/B0GFVWMWM8`
  - 价格：`28.99`
  - 评分：`4.1`
  - Review 数：`31`

- `Petmo`
  - `ASIN`: `B0GSVQ25QF`
  - 标题：`PetPrime Interactive Dog Ball Toy...`
  - 产品链接：`https://www.amazon.ca/dp/B0GSVQ25QF`
  - 价格：`29.99`
  - 评分：`4.6`
  - Review 数：`6`

## 二、公开链接直连验证结果

### Amazon 商品页

实测结果：

- `amazon.com` 商品页：`200`
- `amazon.co.uk` 商品页：`200`

说明：

- Amazon 商品公开页当前可以直接作为“低频页面校验”来源
- 适合校验：
  - 标题
  - ASIN
  - 评分
  - Review 数
  - 产品链接有效性

### Coupang 商品页

实测结果：

- 返回 `403 Access Denied`

说明：

- 不适合作为云端自动主链路
- 不要把韩国 Coupang 产品抓取设计成核心依赖

### Naver 商品页

实测结果：

- 返回 `429`

说明：

- 不适合作为云端自动主链路
- 更适合走人工导入或低频人工复核

## 三、当前结论

### 可以继续优先开发的主链路

1. 内部产品总表导入
2. 卖家精灵产品表导入
3. 卖家精灵历史销量 / 价格 / 销售额导入
4. Amazon 商品页低频校验

### 不建议继续押注的主链路

1. Coupang 商品公开页自动抓取
2. Naver 商品公开页自动抓取
3. 把评论完整抓取作为 V1 的前提

## 四、开发顺序建议

先做：

1. 产品总表真实筛选
2. 评论总表真实筛选
3. 同款多店铺对比真实查询

再做：

1. 手动更新任务
2. 定时任务管理
3. 产品开发模块联动评论证据与整改闭环
