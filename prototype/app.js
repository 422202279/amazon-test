const stores = [
  { name: "US Home Store", platform: "Amazon", site: "美国", seller: "A1USHOME88", products: 24, reviews: 642, rating: 4.3, status: "正常监控", sync: "2026-07-02 09:30" },
  { name: "UK Living", platform: "Amazon", site: "英国", seller: "A1UKLIFE22", products: 16, reviews: 318, rating: 4.2, status: "正常监控", sync: "2026-07-02 08:55" },
  { name: "DE Ordnung", platform: "Amazon", site: "德国", seller: "A1DEHOME77", products: 14, reviews: 279, rating: 4.0, status: "待补数据", sync: "2026-07-01 22:10" },
  { name: "JP Kitchen", platform: "Amazon", site: "日本", seller: "A1JPKITCHN", products: 18, reviews: 244, rating: 4.1, status: "正常监控", sync: "2026-07-02 07:45" },
  { name: "CA Comfort", platform: "Amazon", site: "加拿大", seller: "A1CACOMFY3", products: 11, reviews: 165, rating: 4.4, status: "正常监控", sync: "2026-07-01 20:12" },
  { name: "FR Maison", platform: "Amazon", site: "法国", seller: "A1FRHOUSE9", products: 9, reviews: 126, rating: 4.1, status: "暂停", sync: "2026-06-29 18:20" },
  { name: "Coupang Seoul", platform: "Coupang", site: "韩国", seller: "CPG-SEOUL-11", products: 13, reviews: 204, rating: 4.0, status: "正常监控", sync: "2026-07-02 09:10" },
  { name: "Naver Living", platform: "Naver", site: "韩国", seller: "NVR-LIVING-8", products: 12, reviews: 149, rating: 4.2, status: "待补数据", sync: "2026-07-01 16:42" },
  { name: "EU Hybrid", platform: "Amazon", site: "欧洲混合", seller: "A1EUHYBRID", products: 9, reviews: 98, rating: 3.9, status: "正常监控", sync: "2026-07-02 06:58" }
];

const API_BASE = "http://127.0.0.1:8000/api";
const siteLabelMap = {
  US: "美国",
  UK: "英国",
  DE: "德国",
  JP: "日本",
  CA: "加拿大",
  FR: "法国",
  KR: "韩国",
};

const productSortState = { key: "", direction: "desc" };
const reviewSortState = { key: "", direction: "desc" };
const comparisonSortState = { key: "", direction: "desc" };

let products = [
  { tone: "tone-1", name: "记忆棉人体工学坐垫", asin: "B0DXSEAT01", parentAsin: "B0DXSEAT00", sku: "CUS-01-US", store: "US Home Store", site: "美国", platform: "Amazon", category: "Home & Kitchen", price: "$29.99", sales: 642, salesAmount: "$19,253", reviews: 1284, newReviews: 36, rating: 4.1, imageReviews: 93, variantCount: 4, keywords: "seat cushion / office cushion", bsr: "#1,248 / #13", dimensions: "45 x 35 x 7 cm / 1.1 kg", fulfillment: "FBA", sellerCount: 2, buybox: "异常", buyboxSeller: "BestHouse US", adFlags: "SP / 视频", contentFlags: "A+ / 品牌店铺", negative: "12 条", issue: "坐感塌陷 / 尺寸偏小", supplier: "宁波舒垫工厂", launchDate: "2026-03-12", rectify: "处理中" },
  { tone: "tone-2", name: "防漏便携咖啡杯", asin: "B0DXMUG889", parentAsin: "B0DXMUG800", sku: "MUG-02-UK", store: "UK Living", site: "英国", platform: "Amazon", category: "Kitchen & Dining", price: "£18.90", sales: 411, salesAmount: "£7,768", reviews: 986, newReviews: 18, rating: 4.3, imageReviews: 54, variantCount: 3, keywords: "travel mug / leak proof mug", bsr: "#2,904 / #41", dimensions: "510 ml / 370 g", fulfillment: "FBA", sellerCount: 1, buybox: "正常", buyboxSeller: "UK Living", adFlags: "SP", contentFlags: "A+ / 视频", negative: "4 条", issue: "漏水 / 杯盖卡扣", supplier: "厦门啡行", launchDate: "2025-11-09", rectify: "观察中" },
  { tone: "tone-3", name: "不锈钢保温杯 900ml", asin: "B0DXTHERM7", parentAsin: "B0DXTHERM0", sku: "BOT-09-DE", store: "DE Ordnung", site: "德国", platform: "Amazon", category: "Sports & Outdoors", price: "€23.50", sales: 372, salesAmount: "€8,742", reviews: 744, newReviews: 24, rating: 3.9, imageReviews: 48, variantCount: 2, keywords: "thermo bottle / trinkflasche", bsr: "#4,512 / #67", dimensions: "900 ml / 420 g", fulfillment: "FBA", sellerCount: 3, buybox: "正常", buyboxSeller: "Pet Prime DE", adFlags: "SP / SB", contentFlags: "A+", negative: "9 条", issue: "保温差 / 涂层掉色", supplier: "永康饮具厂", launchDate: "2025-08-18", rectify: "待反馈" },
  { tone: "tone-4", name: "瑜伽垫加厚防滑款", asin: "B0DXYOGA88", parentAsin: "B0DXYOGA80", sku: "YOG-07-JP", store: "JP Kitchen", site: "日本", platform: "Amazon", category: "Sports & Fitness", price: "¥3,980", sales: 298, salesAmount: "¥1,186,040", reviews: 522, newReviews: 15, rating: 4.0, imageReviews: 60, variantCount: 2, keywords: "yoga mat / ストレッチマット", bsr: "#3,220 / #28", dimensions: "183 x 61 x 1 cm / 880 g", fulfillment: "FBA", sellerCount: 1, buybox: "正常", buyboxSeller: "JP Kitchen", adFlags: "SP / 视频", contentFlags: "A+ / 品牌故事", negative: "6 条", issue: "异味 / 边缘卷曲", supplier: "南通健身材", launchDate: "2026-01-26", rectify: "处理中" },
  { tone: "tone-5", name: "化妆镜带灯便携折叠款", asin: "B0DXMIRROR", parentAsin: "B0DXMIRR00", sku: "MIR-11-US", store: "CA Comfort", site: "加拿大", platform: "Amazon", category: "Beauty & Personal Care", price: "CA$25.00", sales: 221, salesAmount: "CA$5,525", reviews: 448, newReviews: 11, rating: 4.5, imageReviews: 51, variantCount: 1, keywords: "makeup mirror / led mirror", bsr: "#1,987 / #22", dimensions: "18 x 13 x 3 cm / 520 g", fulfillment: "FBA", sellerCount: 1, buybox: "正常", buyboxSeller: "Petmo", adFlags: "视频", contentFlags: "A+ / 视频", negative: "2 条", issue: "电池续航", supplier: "深圳美妆科技", launchDate: "2026-04-16", rectify: "已整改" }
];

const productColumns = [
  { key: "product", label: "产品", locked: true, visible: true },
  { key: "store", label: "店铺 / 站点", locked: true, visible: true },
  { key: "platform", label: "平台", visible: true },
  { key: "parentAsin", label: "父ASIN", visible: false },
  { key: "category", label: "类目", visible: true },
  { key: "price", label: "价格", visible: true },
  { key: "sales", label: "近30天销量", visible: true },
  { key: "salesAmount", label: "近30天销售额", visible: false },
  { key: "reviews", label: "Review总数", visible: true },
  { key: "newReviews", label: "月新增评分数", visible: false },
  { key: "rating", label: "评分", visible: true },
  { key: "variantCount", label: "变体数", visible: false },
  { key: "keywords", label: "关键词", visible: true },
  { key: "bsr", label: "BSR", visible: true },
  { key: "dimensions", label: "尺寸 / 重量", visible: true },
  { key: "fulfillment", label: "配送方式", visible: false },
  { key: "sellerCount", label: "跟卖卖家", visible: true },
  { key: "buybox", label: "购物车", visible: true },
  { key: "buyboxSeller", label: "BuyBox卖家", visible: false },
  { key: "adFlags", label: "广告标记", visible: false },
  { key: "contentFlags", label: "内容标记", visible: false },
  { key: "launchDate", label: "上架时间", visible: false },
  { key: "negative", label: "新增差评", visible: true },
  { key: "issue", label: "主要差评原因", visible: true },
  { key: "supplier", label: "供应商", visible: true },
  { key: "rectify", label: "整改状态", visible: true }
];

const productColumnStorageKey = "cb-product-columns-v1";

let reviews = [
  { tone: "tone-1", id: "RV-10021", title: "坐两天就塌了", product: "记忆棉人体工学坐垫", store: "US Home Store", site: "美国", platform: "Amazon", stars: 2, hasImage: true, mediaType: "image", reviewUrl: "https://www.amazon.com/product-reviews/B0DXSEAT01", productUrl: "https://www.amazon.com/dp/B0DXSEAT01", content: "刚开始还可以，坐了几天中间明显塌陷，尾椎支撑不够，和图片有差距。", issue: "质量问题", mood: "负面", feedback: "未反馈", rectify: "待反馈", source: "页面补抓", asin: "B0DXSEAT01" },
  { tone: "tone-2", id: "RV-10022", title: "杯盖还是会漏", product: "防漏便携咖啡杯", store: "UK Living", site: "英国", platform: "Amazon", stars: 3, hasImage: true, mediaType: "video", reviewUrl: "https://www.amazon.co.uk/product-reviews/B0DXMUG889", productUrl: "https://www.amazon.co.uk/dp/B0DXMUG889", content: "保温不错，但背包里横放后杯盖附近还是会渗水，不适合通勤。", issue: "使用效果差", mood: "中性", feedback: "已反馈", rectify: "处理中", source: "导入", asin: "B0DXMUG889" },
  { tone: "tone-3", id: "RV-10023", title: "颜色掉漆", product: "不锈钢保温杯 900ml", store: "DE Ordnung", site: "德国", platform: "Amazon", stars: 1, hasImage: true, mediaType: "image", reviewUrl: "https://www.amazon.de/product-reviews/B0DXTHERM7", productUrl: "https://www.amazon.de/dp/B0DXTHERM7", content: "用了不到一周表面开始掉色，图片里看着很高级，实物做工一般。", issue: "掉色", mood: "负面", feedback: "未反馈", rectify: "待反馈", source: "页面补抓", asin: "B0DXTHERM7" },
  { tone: "tone-4", id: "RV-10024", title: "有点味道", product: "瑜伽垫加厚防滑款", store: "JP Kitchen", site: "日本", platform: "Amazon", stars: 2, hasImage: false, mediaType: "none", reviewUrl: "https://www.amazon.co.jp/product-reviews/B0DXYOGA88", productUrl: "https://www.amazon.co.jp/dp/B0DXYOGA88", content: "打开包装后味道比较大，晾了两天才敢使用，厚度尚可。", issue: "异味", mood: "负面", feedback: "已反馈", rectify: "观察中", source: "人工修正", asin: "B0DXYOGA88" },
  { tone: "tone-5", id: "RV-10025", title: "灯光柔和", product: "化妆镜带灯便携折叠款", store: "CA Comfort", site: "加拿大", platform: "Amazon", stars: 5, hasImage: true, mediaType: "image", reviewUrl: "https://www.amazon.ca/product-reviews/B0DXMIRROR", productUrl: "https://www.amazon.ca/dp/B0DXMIRROR", content: "灯光很自然，出差带着方便，折叠后不占地方，充一次电能用很久。", issue: "其他", mood: "正面", feedback: "无需反馈", rectify: "已关闭", source: "导入", asin: "B0DXMIRROR" },
  { tone: "tone-6", id: "RV-10026", title: "尺寸偏小", product: "记忆棉人体工学坐垫", store: "Coupang Seoul", site: "韩国", platform: "Coupang", stars: 2, hasImage: true, mediaType: "video", reviewUrl: "https://www.amazon.com/product-reviews/B0DXSEAT01", productUrl: "https://www.amazon.com/dp/B0DXSEAT01", content: "看图以为会更宽，放在办公室椅子上略小，长时间坐不太稳。", issue: "尺寸问题", mood: "负面", feedback: "已反馈", rectify: "处理中", source: "人工修正", asin: "B0DXSEAT01" }
];

let comparisonData = [
  { store: "US Home Store", site: "美国", sales: 642, salesAmount: "$19,253", score: 4.1, negative: 8.6, volume: 1284, imageReviews: 93, top3: "坐感塌陷 / 尺寸偏小 / 回弹慢", action: "调整内芯密度与文案说明" },
  { store: "UK Living", site: "英国", sales: 411, salesAmount: "£7,768", score: 4.3, negative: 5.1, volume: 816, imageReviews: 48, top3: "尺寸偏小 / 包装褶皱 / 回弹慢", action: "优化尺寸图与包装说明" },
  { store: "DE Ordnung", site: "德国", sales: 372, salesAmount: "€8,742", score: 3.8, negative: 11.9, volume: 604, imageReviews: 52, top3: "坐感塌陷 / 描述不符 / 物流破损", action: "排查批次与物流包装" },
  { store: "Coupang Seoul", site: "韩国", sales: 295, salesAmount: "₩8,410,000", score: 4.0, negative: 7.4, volume: 472, imageReviews: 37, top3: "尺寸偏小 / 坐感偏硬 / 缝线粗糙", action: "本地化尺寸说明，抽检缝线" }
];

const tasks = [
  { id: "SR-2048", product: "记忆棉人体工学坐垫", supplier: "宁波舒垫工厂", issue: "质量问题", evidence: "12 条差评指向坐感塌陷，含 7 条带图", suggestedAction: "先做内芯密度抽检，再给出材料与工艺调整计划", actualRectification: "已增加抽检频次，待回传改良样", priority: "高", status: "处理中", due: "2026-07-08" },
  { id: "SR-2049", product: "防漏便携咖啡杯", supplier: "厦门啡行", issue: "使用效果差", evidence: "5 条评论反馈杯盖横放渗水", suggestedAction: "复核密封圈与卡扣结构，先出问题定位报告", actualRectification: "待供应商反馈", priority: "中", status: "待反馈", due: "2026-07-06" },
  { id: "SR-2050", product: "不锈钢保温杯 900ml", supplier: "永康饮具厂", issue: "掉色", evidence: "德国站 4 条 1 星评论附图", suggestedAction: "补做附着力测试并核查表面喷涂工艺", actualRectification: "待供应商反馈", priority: "高", status: "待反馈", due: "2026-07-05" },
  { id: "SR-2051", product: "瑜伽垫加厚防滑款", supplier: "南通健身材", issue: "异味", evidence: "日本站 6 条差评集中在拆封异味", suggestedAction: "排查材料与包装密封方式，追加散味验证", actualRectification: "观察新批次反馈中", priority: "中", status: "观察中", due: "2026-07-12" },
  { id: "SR-2052", product: "化妆镜带灯便携折叠款", supplier: "深圳美妆科技", issue: "电池续航", evidence: "已完成电池批次替换验证", suggestedAction: "跟进电池批次替换后的稳定性回访", actualRectification: "已完成电池批次替换", priority: "低", status: "已整改", due: "2026-06-28" }
];

const reports = [
  { name: "记忆棉坐垫评论分析报告", type: "产品评论分析", range: "US / UK / DE / KR", time: "2026-07-02 10:30", status: "最新" },
  { name: "多店铺坐垫差评归因对比", type: "多店铺对比", range: "4 店铺同款产品", time: "2026-07-01 18:20", status: "已归档" },
  { name: "6 月供应商整改建议汇总", type: "供应商建议", range: "8 个产品 / 5 家供应商", time: "2026-06-30 17:00", status: "可导出" },
  { name: "北美站购物车异常报告", type: "风险报告", range: "美国 / 加拿大", time: "2026-06-29 09:40", status: "待复核" }
];

let accounts = [
  { name: "系统管理员", email: "admin@cb-monitor.local", role: "管理员", scope: "全部店铺 / 全部模块", stores: ["US Home Store", "UK Living", "JP Kitchen", "CA Comfort"], status: "启用", lastLogin: "2026-07-03 09:12" },
  { name: "产品开发A", email: "pd-a@cb-monitor.local", role: "产品开发", scope: "产品总表 / 评论总表 / 产品开发 / 供应商整改", stores: ["US Home Store", "CA Comfort"], status: "启用", lastLogin: "2026-07-03 08:46" },
  { name: "运营同事B", email: "ops-b@cb-monitor.local", role: "运营", scope: "店铺 / 产品 / 评论 / 报告导出", stores: ["UK Living", "DE Ordnung", "FR Maison"], status: "启用", lastLogin: "2026-07-02 19:35" },
  { name: "韩国数据专员", email: "kr-data@cb-monitor.local", role: "数据录入", scope: "韩国站产品 / 评论导入", stores: ["Coupang Seoul", "Naver Living"], status: "停用", lastLogin: "2026-06-29 14:18" },
];

let roles = [
  { role: "管理员", modules: ["Dashboard", "店铺", "产品", "评论", "对比", "整改", "报告", "设置", "账号管理"], permissions: ["查看", "导入", "导出", "编辑", "删除", "手动更新", "角色分配"] },
  { role: "产品开发", modules: ["Dashboard", "产品", "评论", "对比", "产品开发", "整改", "报告"], permissions: ["查看", "导出", "标记问题", "生成整改建议"] },
  { role: "运营", modules: ["Dashboard", "店铺", "产品", "评论", "报告"], permissions: ["查看", "导入", "导出", "批量分类"] },
  { role: "数据录入", modules: ["产品", "评论", "韩国手动导入"], permissions: ["查看", "导入"] },
  { role: "只读访客", modules: ["Dashboard", "报告"], permissions: ["查看"] },
];

let reviewViewMode = "timeline";

function statusClass(status) {
  if (["正常监控", "已整改", "最新", "可导出", "已关闭"].includes(status)) return "success";
  if (["待补数据", "处理中", "观察中", "中"].includes(status)) return "warn";
  if (["暂停", "异常", "待反馈", "未反馈", "高", "待复核"].includes(status)) return "danger";
  return "neutral";
}

function starString(count) {
  return `${"★".repeat(count)}${"☆".repeat(5 - count)}`;
}

function thumbs(count = 3) {
  return Array.from({ length: count }, (_, index) => `<span class="thumb tone-${(index % 6) + 1}"></span>`).join("");
}

function localizeSite(site) {
  return siteLabelMap[site] || site || "-";
}

function parseNumberLike(value) {
  if (typeof value === "number") return value;
  if (value === null || value === undefined) return Number.NEGATIVE_INFINITY;
  const text = String(value).trim();
  if (!text || text === "-") return Number.NEGATIVE_INFINITY;
  const dateValue = Date.parse(text);
  if (!Number.isNaN(dateValue) && /\d{4}-\d{2}-\d{2}/.test(text)) return dateValue;
  const numeric = Number(text.replace(/,/g, "").replace(/[^\d.-]/g, ""));
  if (!Number.isNaN(numeric) && /[\d]/.test(text)) return numeric;
  return text.toLowerCase();
}

function compareValues(left, right, direction = "asc") {
  const order = direction === "asc" ? 1 : -1;
  const a = parseNumberLike(left);
  const b = parseNumberLike(right);
  if (typeof a === "number" && typeof b === "number") return (a - b) * order;
  return String(a).localeCompare(String(b), "zh-CN") * order;
}

function sortIndicator(state, key) {
  if (state.key !== key) return "";
  return state.direction === "asc" ? " ▲" : " ▼";
}

function splitTerms(text) {
  return String(text || "")
    .split(/[\s,\n，]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildSearchParams(searchText) {
  const params = new URLSearchParams();
  const raw = String(searchText || "").trim();
  if (!raw) return params;
  const terms = splitTerms(raw);
  if (terms.length > 1) {
    params.set("identifiers", raw);
  } else {
    params.set("q", raw);
    params.set("identifiers", raw);
  }
  return params;
}

function applySort(items, state, resolver) {
  if (!state.key) return items.slice();
  return items
    .slice()
    .sort((left, right) => compareValues(resolver(left, state.key), resolver(right, state.key), state.direction));
}

function renderReviewMedia(review, count = 3) {
  if (!review.hasImage) return '<span class="cell-sub">无图 / 无视频</span>';
  const mediaMarkup = Array.from({ length: count }, (_, index) => `
    <span class="thumb media-thumb ${review.tone} ${review.mediaType === "video" ? "is-video" : ""}">
      ${review.mediaType === "video" && index === 0 ? '<span class="media-play">▶</span>' : ""}
    </span>
  `).join("");
  if (review.mediaType === "video") {
    return `
      <a class="thumb-strip media-link" href="${review.reviewUrl || "#"}" target="_blank" rel="noreferrer" title="仅视频跳转原评论查看">
        ${mediaMarkup}
      </a>
      <span class="cell-sub media-hint">视频仅保存封面图，点击跳转原评论观看</span>
    `;
  }
  return `
    <span class="thumb-strip">${mediaMarkup}</span>
    <span class="cell-sub media-hint">图片缩略图本地展示，不默认跳转</span>
  `;
}

function renderDashboard() {
  const riskBody = document.getElementById("dashboard-risk-products");
  const reviewFeed = document.getElementById("dashboard-review-feed");
  const sparkContainer = document.getElementById("dashboard-score-sparks");
  const issues = document.getElementById("dashboard-top-issues");
  if (!riskBody || !reviewFeed || !sparkContainer || !issues) return;

  riskBody.innerHTML = products.map((item) => `
    <tr>
      <td>
        <div class="product-cell">
          <span class="thumb ${item.tone}"></span>
          <div>
            <span class="cell-title">${item.name}</span>
            <span class="cell-sub">${item.asin} · ${item.sku}</span>
          </div>
        </div>
      </td>
      <td>${item.store}</td>
      <td>${item.rating}</td>
      <td>${item.negative}</td>
      <td>${item.imageReviews}</td>
      <td><span class="chip warn">${item.issue}</span></td>
      <td><span class="status ${statusClass(item.rectify)}">${item.rectify}</span></td>
    </tr>
  `).join("");

  reviewFeed.innerHTML = reviews.slice(0, 4).map((review) => `
    <article class="review-card">
      <div class="review-card-head">
        <span class="stars">${starString(review.stars)}</span>
        <span class="chip ${review.stars <= 2 ? "danger" : review.stars === 3 ? "warn" : "success"}">${review.title}</span>
        <span class="chip neutral">${review.store}</span>
        <span class="chip neutral">${review.issue}</span>
      </div>
      <p>${review.content}</p>
      <div>${renderReviewMedia(review)}</div>
    </article>
  `).join("");

  const sparkData = [
    ["美国站", 82, "4.1 / 负评占比 8.6%"],
    ["英国站", 86, "4.3 / 负评占比 5.1%"],
    ["德国站", 71, "3.8 / 负评占比 11.9%"],
    ["日本站", 79, "4.0 / 负评占比 7.2%"],
    ["韩国站", 77, "4.0 / 负评占比 7.4%"]
  ];
  sparkContainer.innerHTML = sparkData.map(([label, value, meta]) => `
    <div class="spark-line">
      <div class="spark-head"><strong>${label}</strong><span>${meta}</span></div>
      <div class="spark-track"><i style="width:${value}%"></i></div>
    </div>
  `).join("");

  const topIssues = [
    ["质量问题", 38],
    ["尺寸问题", 27],
    ["描述不符", 19],
    ["异味", 14],
    ["包装破损", 11]
  ];
  issues.innerHTML = topIssues.map(([name, value]) => `
    <div class="bar-row">
      <span>${name}</span>
      <div><i style="width:${value * 2}%"></i></div>
      <strong>${value}</strong>
    </div>
  `).join("");
}

function renderStores() {
  const body = document.getElementById("stores-table");
  if (!body) return;
  body.innerHTML = stores.map((store, index) => `
    <tr>
      <td>
        <div class="store-cell">
          <span class="thumb tone-${(index % 6) + 1}"></span>
          <div>
            <span class="cell-title">${store.name}</span>
            <span class="cell-sub">负责人：运营-${index + 1}</span>
          </div>
        </div>
      </td>
      <td>${store.platform}</td>
      <td>${store.site}</td>
      <td>${store.seller}</td>
      <td>${store.products}</td>
      <td>${store.reviews}</td>
      <td>${store.rating}</td>
      <td><span class="status ${statusClass(store.status)}">${store.status}</span></td>
      <td>${store.sync}</td>
      <td><a class="link-inline" href="#">查看</a> / <a class="link-inline" href="#">编辑</a></td>
    </tr>
  `).join("");
}

function renderProducts() {
  const body = document.getElementById("products-table");
  const head = document.getElementById("products-table-head");
  if (!body || !head) return;

  const visibleColumns = productColumns.filter((column) => column.visible);
  head.innerHTML = visibleColumns.map((column) => `<th data-col="${column.key}">${column.label}${sortIndicator(productSortState, column.key)}</th>`).join("");

  const sortedProducts = applySort(products, productSortState, getProductSortValue);
  body.innerHTML = sortedProducts.map((item) => `
    <tr>
      ${visibleColumns.map((column) => `<td data-col="${column.key}">${renderProductCell(item, column.key)}</td>`).join("")}
    </tr>
  `).join("");

  head.querySelectorAll("th[data-col]").forEach((cell) => {
    cell.style.cursor = "pointer";
    cell.onclick = () => {
      const key = cell.dataset.col || "";
      if (!key) return;
      if (productSortState.key === key) {
        productSortState.direction = productSortState.direction === "asc" ? "desc" : "asc";
      } else {
        productSortState.key = key;
        productSortState.direction = "desc";
      }
      renderProducts();
    };
  });

  updateProductSummary(sortedProducts);
}

function renderProductColumnPicker() {
  const container = document.getElementById("product-column-options");
  const picker = document.getElementById("product-column-picker");
  const toggle = document.getElementById("toggle-product-columns");
  if (!container || !picker || !toggle) return;

  container.innerHTML = productColumns.map((column) => `
    <label class="column-option" draggable="true" data-column-order="${column.key}">
      <input type="checkbox" data-column="${column.key}" ${column.visible ? "checked" : ""} ${column.locked ? "disabled" : ""} />
      <span>${column.label}</span>
    </label>
  `).join("");

  toggle.onclick = () => {
    picker.classList.toggle("hidden");
  };

  container.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    const key = target.dataset.column;
    if (!key) return;
    const column = productColumns.find((item) => item.key === key);
    if (!column || column.locked) return;
    column.visible = target.checked;
    persistProductColumns();
    renderProducts();
  });

  let draggingKey = null;

  container.querySelectorAll(".column-option").forEach((item) => {
    item.addEventListener("dragstart", () => {
      draggingKey = item.dataset.columnOrder;
      item.classList.add("dragging");
    });

    item.addEventListener("dragend", () => {
      draggingKey = null;
      item.classList.remove("dragging");
      container.querySelectorAll(".column-option").forEach((option) => option.classList.remove("drop-target"));
    });

    item.addEventListener("dragover", (event) => {
      event.preventDefault();
      if (!draggingKey || draggingKey === item.dataset.columnOrder) return;
      container.querySelectorAll(".column-option").forEach((option) => option.classList.remove("drop-target"));
      item.classList.add("drop-target");
    });

    item.addEventListener("drop", (event) => {
      event.preventDefault();
      const targetKey = item.dataset.columnOrder;
      if (!draggingKey || !targetKey || draggingKey === targetKey) return;
      reorderProductColumns(draggingKey, targetKey);
      persistProductColumns();
      renderProductColumnPicker();
      renderProducts();
    });
  });
}

function renderProductCell(item, key) {
  const cells = {
    product: `
      <div class="product-cell">
        <span class="thumb ${item.tone}"></span>
        <div>
          <span class="cell-title">${item.name}</span>
          <span class="cell-sub">${item.asin} · ${item.sku}</span>
        </div>
      </div>
    `,
    store: `${item.store}<span class="cell-sub">${item.site}</span>`,
    platform: item.platform,
    parentAsin: item.parentAsin,
    category: item.category,
    price: item.price,
    sales: item.sales,
    salesAmount: item.salesAmount,
    reviews: item.reviews,
    newReviews: item.newReviews,
    rating: `${item.rating}<span class="cell-sub">带图 ${item.imageReviews}</span>`,
    variantCount: item.variantCount,
    keywords: item.keywords,
    bsr: item.bsr,
    dimensions: item.dimensions,
    fulfillment: item.fulfillment,
    sellerCount: item.sellerCount,
    buybox: `<span class="status ${item.buybox === "正常" ? "success" : "danger"}">${item.buybox}</span>`,
    buyboxSeller: item.buyboxSeller,
    adFlags: item.adFlags,
    contentFlags: item.contentFlags,
    launchDate: item.launchDate,
    negative: `<span class="chip ${item.negative === "2 条" ? "neutral" : "danger"}">${item.negative}</span>`,
    issue: item.issue,
    supplier: item.supplier,
    rectify: `<span class="status ${statusClass(item.rectify)}">${item.rectify}</span>`,
  };
  return cells[key] ?? "";
}

function getProductSortValue(item, key) {
  const values = {
    product: item.name,
    store: `${item.store} ${item.site}`,
    platform: item.platform,
    parentAsin: item.parentAsin,
    category: item.category,
    price: item.price,
    sales: item.sales,
    salesAmount: item.salesAmount,
    reviews: item.reviews,
    newReviews: item.newReviews,
    rating: item.rating,
    variantCount: item.variantCount,
    keywords: item.keywords,
    bsr: item.bsr,
    dimensions: item.dimensions,
    fulfillment: item.fulfillment,
    sellerCount: item.sellerCount,
    buybox: item.buybox,
    buyboxSeller: item.buyboxSeller,
    adFlags: item.adFlags,
    contentFlags: item.contentFlags,
    launchDate: item.launchDate,
    negative: item.negative,
    issue: item.issue,
    supplier: item.supplier,
    rectify: item.rectify,
  };
  return values[key] ?? "";
}

function updateProductSummary(items) {
  const total = document.getElementById("products-summary-total");
  const site = document.getElementById("products-summary-site");
  const negative = document.getElementById("products-summary-negative");
  const buybox = document.getElementById("products-summary-buybox");
  const supplier = document.getElementById("products-summary-supplier");
  if (!total || !site || !negative || !buybox || !supplier) return;

  total.textContent = `产品数 ${items.length}`;
  const activeSite = document.getElementById("products-site-filter")?.selectedOptions?.[0]?.textContent || "全部站点";
  site.textContent = `${activeSite} ${items.length}`;
  negative.textContent = `带新增差评 ${items.filter((item) => parseNumberLike(item.negative) > 0).length}`;
  buybox.textContent = `购物车异常 ${items.filter((item) => item.buybox !== "正常").length}`;
  supplier.textContent = `需供应商跟进 ${items.filter((item) => item.rectify !== "已整改" && item.rectify !== "已关闭").length}`;
}

function reorderProductColumns(draggingKey, targetKey) {
  const fromIndex = productColumns.findIndex((column) => column.key === draggingKey);
  const toIndex = productColumns.findIndex((column) => column.key === targetKey);
  if (fromIndex === -1 || toIndex === -1) return;
  const [column] = productColumns.splice(fromIndex, 1);
  productColumns.splice(toIndex, 0, column);
}

function persistProductColumns() {
  localStorage.setItem(
    productColumnStorageKey,
    JSON.stringify(productColumns.map((column) => ({ key: column.key, visible: column.visible })))
  );
}

function restoreProductColumns() {
  const saved = localStorage.getItem(productColumnStorageKey);
  if (!saved) return;
  try {
    const parsed = JSON.parse(saved);
    const savedMap = new Map(parsed.map((item) => [item.key, item]));
    const reordered = parsed
      .map((item) => productColumns.find((column) => column.key === item.key))
      .filter(Boolean);
    const missing = productColumns.filter((column) => !savedMap.has(column.key));
    productColumns.splice(0, productColumns.length, ...reordered, ...missing);
    productColumns.forEach((column) => {
      if (savedMap.has(column.key)) {
        const savedColumn = savedMap.get(column.key);
        column.visible = column.locked ? true : Boolean(savedColumn.visible);
      }
    });
  } catch (error) {
    console.warn("Failed to restore product column settings", error);
  }
}

function renderReviews() {
  const body = document.getElementById("reviews-table");
  if (!body) return;
  if (reviewViewMode === "product" && reviews[0]?.recent_reviews) {
    const sortedGroups = applySort(reviews, reviewSortState, getReviewGroupSortValue);
    body.innerHTML = sortedGroups.map((group) => `
      <tr>
        <td>
          <div class="review-meta">
            <span class="thumb tone-1"></span>
            <div>
              <span class="cell-title">${group.asin || "未识别ASIN"}</span>
              <span class="cell-sub">${group.product_title || "未命名产品"}</span>
              <span class="cell-sub">最近评论：${group.latest_reviewed_at || "未记录"}</span>
            </div>
          </div>
        </td>
        <td>
          <span class="cell-title">${(group.stores || []).join(" / ") || "未识别店铺"}</span>
          <span class="cell-sub">${(group.sites || []).join(" / ") || "未识别站点"}</span>
          <span class="cell-sub">评论数 ${group.review_count} · 差评 ${group.negative_review_count}</span>
        </td>
        <td>${(group.sites || []).join(" / ")}<span class="cell-sub">聚合视图</span></td>
        <td><span class="stars">${starString(Math.min(5, Math.max(1, group.recent_reviews?.[0]?.star_rating || 3)))}</span></td>
        <td>${group.recent_reviews?.[0] ? renderReviewMedia(mapReviewFromApi(group.recent_reviews[0])) : '<span class="cell-sub">无图 / 无视频</span>'}</td>
        <td>${(group.recent_reviews || []).slice(0, 3).map((item) => `<span class="cell-sub">${item.review_title || "无标题"}：${item.review_content || ""}</span>`).join("")}</td>
        <td>${group.recent_reviews?.[0]?.product_url ? `<a class="link-inline" href="${group.recent_reviews[0].product_url}" target="_blank" rel="noreferrer">产品链接</a>` : ""}</td>
        <td><span class="chip neutral">聚合</span></td>
        <td><span class="chip neutral">${(group.recent_reviews || []).map((item) => item.issue_category).filter(Boolean).slice(0, 2).join(" / ") || "待分类"}</span></td>
        <td><span class="status neutral">产品聚合</span></td>
        <td><span class="status ${(group.supplier_task_statuses || []).length ? "warn" : "neutral"}">${(group.supplier_task_statuses || []).join(" / ") || "未生成任务"}</span></td>
        <td><span class="status neutral">查看子评论</span></td>
      </tr>
    `).join("");
    bindReviewSort();
    updateReviewSummary(sortedGroups, true);
    return;
  }
  const sortedReviews = applySort(reviews, reviewSortState, getReviewSortValue);
  body.innerHTML = sortedReviews.map((review) => `
    <tr>
      <td>
        <div class="review-meta">
          <span class="thumb ${review.tone}"></span>
          <div>
            <span class="cell-title">${review.id}</span>
            <span class="cell-sub">${review.title}</span>
            <span class="cell-sub">评论人：Demo User</span>
          </div>
        </div>
      </td>
      <td>
        <span class="cell-title">${review.product}</span>
        <span class="cell-sub">${review.store}</span>
        <span class="cell-sub">${review.asin}</span>
      </td>
      <td>${review.site}<span class="cell-sub">${review.platform}</span></td>
      <td><span class="stars">${starString(review.stars)}</span></td>
      <td>${renderReviewMedia(review)}</td>
      <td>${review.content}</td>
      <td><a class="link-inline" href="${review.productUrl || "#"}" target="_blank" rel="noreferrer">产品链接</a><span class="cell-sub"><a class="link-inline" href="${review.reviewUrl || "#"}" target="_blank" rel="noreferrer">评论链接</a></span></td>
      <td><span class="chip neutral">${review.source}</span></td>
      <td><span class="chip ${review.issue === "其他" ? "neutral" : "warn"}">${review.issue}</span></td>
      <td><span class="status ${review.mood === "正面" ? "success" : review.mood === "中性" ? "warn" : "danger"}">${review.mood}</span></td>
      <td><span class="status ${statusClass(review.feedback)}">${review.feedback}</span>${review.supplierTaskCode ? `<span class="cell-sub">任务 ${review.supplierTaskCode}</span>` : ""}</td>
      <td><span class="status ${statusClass(review.rectify)}">${review.rectify}</span>${review.supplierTaskStatus ? `<span class="cell-sub">${review.supplierTaskStatus}${review.supplierTaskNotes ? ` · ${review.supplierTaskNotes}` : ""}</span>` : ""}</td>
    </tr>
  `).join("");
  bindReviewSort();
  updateReviewSummary(sortedReviews, false);
}

function getReviewSortValue(item, key) {
  const values = {
    id: item.reviewedAt || item.id,
    product: `${item.product} ${item.store} ${item.asin}`,
    site: `${item.site} ${item.platform}`,
    stars: item.stars,
    hasImage: item.hasImage ? 1 : 0,
    content: item.content,
    source: item.source,
    issue: item.issue,
    mood: item.mood,
    feedback: item.feedback,
    rectify: item.rectify,
  };
  return values[key] ?? "";
}

function getReviewGroupSortValue(item, key) {
  const values = {
    id: item.latest_reviewed_at || item.asin,
    product: `${item.product_title} ${item.asin}`,
    site: (item.sites || []).join(" "),
    stars: item.recent_reviews?.[0]?.star_rating || 0,
    hasImage: item.recent_reviews?.some((review) => review.has_images || review.review_images) ? 1 : 0,
    content: (item.recent_reviews || []).map((review) => review.review_content || "").join(" "),
    source: "聚合",
    issue: (item.recent_reviews || []).map((review) => review.issue_category || "").join(" "),
    mood: item.negative_review_count,
    feedback: (item.supplier_task_statuses || []).join(" "),
    rectify: (item.supplier_task_statuses || []).join(" "),
  };
  return values[key] ?? "";
}

function bindReviewSort() {
  const headers = document.querySelectorAll(".review-master th[data-sort]");
  if (!headers.length) return;
  headers.forEach((header) => {
    const key = header.dataset.sort || "";
    header.style.cursor = "pointer";
    const baseLabel = header.textContent.replace(/[▲▼]\s*$/, "").trim();
    header.textContent = `${baseLabel}${sortIndicator(reviewSortState, key)}`;
    header.onclick = () => {
      if (!key) return;
      if (reviewSortState.key === key) {
        reviewSortState.direction = reviewSortState.direction === "asc" ? "desc" : "asc";
      } else {
        reviewSortState.key = key;
        reviewSortState.direction = "desc";
      }
      renderReviews();
    };
  });
}

function updateReviewSummary(items, isGrouped) {
  const total = document.getElementById("reviews-summary-total");
  const negative = document.getElementById("reviews-summary-negative");
  const media = document.getElementById("reviews-summary-media");
  const feedback = document.getElementById("reviews-summary-feedback");
  const recent = document.getElementById("reviews-summary-new");
  if (!total || !negative || !media || !feedback || !recent) return;

  if (isGrouped) {
    const allReviews = items.flatMap((group) => group.recent_reviews || []);
    total.textContent = `产品组 ${items.length}`;
    negative.textContent = `聚合差评 ${items.reduce((sum, group) => sum + (group.negative_review_count || 0), 0)}`;
    media.textContent = `含图/视频组 ${items.filter((group) => (group.recent_reviews || []).some((review) => review.has_images || review.review_images)).length}`;
    feedback.textContent = `已生成任务组 ${items.filter((group) => (group.supplier_task_statuses || []).length).length}`;
    recent.textContent = `示例评论 ${allReviews.length}`;
    return;
  }

  total.textContent = `评论总数 ${items.length}`;
  negative.textContent = `1~2 星 ${items.filter((item) => item.stars <= 2).length}`;
  media.textContent = `带图评论 ${items.filter((item) => item.hasImage).length}`;
  feedback.textContent = `未反馈供应商 ${items.filter((item) => item.feedback === "未反馈").length}`;
  recent.textContent = `近期待处理 ${items.filter((item) => item.rectify !== "已关闭" && item.rectify !== "已整改").length}`;
}

function renderComparison() {
  const cards = document.getElementById("comparison-cards");
  const scoreBars = document.getElementById("comparison-score-bars");
  const negativeBars = document.getElementById("comparison-negative-bars");
  const volumeBars = document.getElementById("comparison-volume-bars");
  const issueGrid = document.getElementById("comparison-issue-grid");
  const table = document.getElementById("comparison-table");
  if (!cards || !scoreBars || !negativeBars || !volumeBars || !issueGrid || !table) return;

  const sortedComparison = applySort(comparisonData, comparisonSortState, getComparisonSortValue);

  cards.innerHTML = sortedComparison.map((item, index) => `
    <article class="comparison-card">
      <span class="chip ${index === 2 ? "danger" : "neutral"}">${item.store}</span>
      <h3>${item.site}站</h3>
      <div class="numbers">
        <div><span class="cell-sub">近30天销量</span><strong>${item.sales}</strong></div>
        <div><span class="cell-sub">近30天销售额</span><strong>${item.salesAmount}</strong></div>
        <div><span class="cell-sub">评分</span><strong>${item.score}</strong></div>
        <div><span class="cell-sub">差评占比</span><strong>${item.negative}%</strong></div>
        <div><span class="cell-sub">评论总数</span><strong>${item.volume}</strong></div>
        <div><span class="cell-sub">带图评论</span><strong>${item.imageReviews}</strong></div>
      </div>
    </article>
  `).join("");

  const maxVolume = Math.max(...sortedComparison.map((i) => Number(i.volume) || 0), 1);
  scoreBars.innerHTML = sortedComparison.map((item) => `
    <div class="bar-item"><span>${item.store}</span><div><i style="width:${item.score * 20}%"></i></div><strong>${item.score}</strong></div>
  `).join("");
  negativeBars.innerHTML = sortedComparison.map((item) => `
    <div class="bar-item"><span>${item.store}</span><div><i style="width:${item.negative * 7}%"></i></div><strong>${item.negative}%</strong></div>
  `).join("");
  volumeBars.innerHTML = sortedComparison.map((item) => `
    <div class="bar-item"><span>${item.store}</span><div><i style="width:${(item.volume / maxVolume) * 100}%"></i></div><strong>${item.volume}</strong></div>
  `).join("");
  issueGrid.innerHTML = [
    ["坐感塌陷", "3 店铺共同出现"],
    ["尺寸偏小", "US / UK / KR"],
    ["回弹慢", "US / UK"],
    ["物流破损", "仅 DE 站集中"],
  ].map(([issue, note]) => `<div class="issue-pill"><strong>${issue}</strong><span>${note}</span></div>`).join("");

  table.innerHTML = sortedComparison.map((item) => `
    <tr>
      <td>${item.store}</td>
      <td>${item.site}</td>
      <td>${item.sales}</td>
      <td>${item.salesAmount}</td>
      <td>${item.score}</td>
      <td>${item.negative}%</td>
      <td>${item.volume}</td>
      <td>${item.imageReviews}</td>
      <td>${item.top3}</td>
      <td>${item.action}</td>
    </tr>
  `).join("");

  document.querySelectorAll("#comparison-table").forEach(() => {
    document.querySelectorAll("th[data-sort]").forEach((header) => {
      const key = header.dataset.sort || "";
      const baseLabel = header.textContent.replace(/[▲▼]\s*$/, "").trim();
      header.textContent = `${baseLabel}${sortIndicator(comparisonSortState, key)}`;
      header.style.cursor = "pointer";
      header.onclick = () => {
        if (!key) return;
        if (comparisonSortState.key === key) {
          comparisonSortState.direction = comparisonSortState.direction === "asc" ? "desc" : "asc";
        } else {
          comparisonSortState.key = key;
          comparisonSortState.direction = "desc";
        }
        renderComparison();
      };
    });
  });
}

function getComparisonSortValue(item, key) {
  return item[key] ?? "";
}

function renderDetail() {
  const feed = document.getElementById("detail-review-feed");
  if (!feed) return;
  feed.innerHTML = reviews.slice(0, 4).map((review) => `
    <article class="review-card">
      <div class="review-card-head">
        <span class="stars">${starString(review.stars)}</span>
        <span class="chip ${review.issue === "其他" ? "neutral" : "warn"}">${review.issue}</span>
        <span class="chip neutral">${review.site}</span>
      </div>
      <p>${review.content}</p>
      <div>${renderReviewMedia(review)}</div>
    </article>
  `).join("");
}

function renderTasks() {
  const board = document.getElementById("task-board");
  const table = document.getElementById("tasks-table");
  if (!board || !table) return;
  const columns = ["待反馈", "处理中", "观察中"];
  board.innerHTML = columns.map((name) => `
    <section class="kanban-column">
      <h3>${name}</h3>
      ${tasks.filter((task) => task.status === name).map((task) => `
        <article class="task-card">
          <div class="review-card-head">
            <strong>${task.id}</strong>
            <span class="chip ${statusClass(task.priority)}">${task.priority}优先</span>
          </div>
          <p>${task.product}</p>
          <p>${task.issue} · ${task.supplier}</p>
          <span class="cell-sub">建议：${task.suggestedAction}</span>
          <span class="cell-sub">截止：${task.due}</span>
        </article>
      `).join("") || '<p class="cell-sub">当前无任务</p>'}
    </section>
  `).join("");

  table.innerHTML = tasks.map((task) => `
    <tr>
      <td>${task.id}</td>
      <td>${task.product}</td>
      <td>${task.supplier}</td>
      <td>${task.issue}</td>
      <td>${task.evidence}</td>
      <td>${task.suggestedAction}</td>
      <td>${task.actualRectification}</td>
      <td><span class="status ${statusClass(task.priority)}">${task.priority}</span></td>
      <td><span class="status ${statusClass(task.status)}">${task.status}</span></td>
      <td>${task.due}</td>
    </tr>
  `).join("");
}

function renderReports() {
  const cards = document.getElementById("report-cards");
  const table = document.getElementById("reports-table");
  if (!cards || !table) return;
  const reportTypes = [
    ["产品评论分析报告", "按产品聚焦评分结构、问题分类、典型差评证据和优化建议"],
    ["同款多店铺对比报告", "按同款产品比较各店铺评分、差评占比、问题归因和建议动作"],
    ["差评原因统计报告", "按问题分类汇总 TOP 原因、占比和整改优先级"],
    ["供应商整改建议报告", "按供应商整理问题、证据、动作建议和状态跟踪"]
  ];
  cards.innerHTML = reportTypes.map(([title, desc], index) => `
    <article class="report-card">
      <span class="chip ${index === 1 ? "warn" : "neutral"}">模板 ${index + 1}</span>
      <h3>${title}</h3>
      <p>${desc}</p>
      <a class="link-inline" href="#">预览模板</a>
    </article>
  `).join("");

  table.innerHTML = reports.map((report) => `
    <tr>
      <td>${report.name}</td>
      <td>${report.type}</td>
      <td>${report.range}</td>
      <td>${report.time}</td>
      <td><span class="status ${statusClass(report.status)}">${report.status}</span></td>
      <td><a class="link-inline" href="#">Markdown</a> / <a class="link-inline" href="#">Excel</a></td>
    </tr>
  `).join("");
}

function renderAccountManagement() {
  const accountTable = document.getElementById("accounts-table");
  const rolesTable = document.getElementById("roles-table");
  if (!accountTable || !rolesTable) return;

  accountTable.innerHTML = accounts.map((account) => `
    <tr>
      <td>
        <span class="cell-title">${account.name}</span>
        <span class="cell-sub">${account.email}</span>
      </td>
      <td><span class="chip ${account.role === "管理员" ? "danger" : account.role === "产品开发" ? "warn" : "neutral"}">${account.role}</span></td>
      <td>${account.scope}</td>
      <td>${(account.stores || []).join(" / ")}</td>
      <td><span class="status ${account.status === "启用" ? "success" : "danger"}">${account.status}</span></td>
      <td>${account.lastLogin}</td>
      <td>重置密码 / 调整角色 / ${account.status === "启用" ? "可停用" : "可启用"}</td>
    </tr>
  `).join("");

  rolesTable.innerHTML = roles.map((role) => `
    <tr>
      <td>${role.role}</td>
      <td>${role.modules.join(" / ")}</td>
      <td>${role.permissions.join(" / ")}</td>
    </tr>
  `).join("");

  const total = document.getElementById("accounts-summary-total");
  const active = document.getElementById("accounts-summary-active");
  const pd = document.getElementById("accounts-summary-pd");
  const disabled = document.getElementById("accounts-summary-disabled");
  if (total) total.textContent = `账号数 ${accounts.length}`;
  if (active) active.textContent = `启用中 ${accounts.filter((item) => item.status === "启用").length}`;
  if (pd) pd.textContent = `产品开发 ${accounts.filter((item) => item.role === "产品开发").length}`;
  if (disabled) disabled.textContent = `停用 ${accounts.filter((item) => item.status !== "启用").length}`;
}

function renderSourceCapabilities(items) {
  const table = document.getElementById("source-capabilities-table");
  if (!table) return;
  table.innerHTML = items.map((item) => `
    <tr>
      <td>${item.platform}</td>
      <td>${item.coverage}</td>
      <td>${item.product_mode}</td>
      <td>${item.review_mode}</td>
      <td><span class="chip ${item.cloud_ready ? "success" : "warn"}">${item.automation_level}</span></td>
    </tr>
  `).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  restoreProductColumns();
  renderDashboard();
  renderStores();
  renderProducts();
  renderProductColumnPicker();
  renderReviews();
  renderComparison();
  renderDetail();
  renderTasks();
  renderReports();
  renderAccountManagement();
  hydrateLiveData();
  hydrateScheduleSettings();
  hydrateOpsInsights();
  hydrateAdminData();
  bindProductFilters();
  bindReviewFilters();
  bindReviewViewSwitch();
  bindComparisonSubmit();
  bindManualRefresh();
});

function bindReviewViewSwitch() {
  const buttons = document.querySelectorAll("[data-review-view]");
  if (!buttons.length) return;
  buttons.forEach((button) => {
    button.addEventListener("click", async () => {
      buttons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      reviewViewMode = button.getAttribute("data-review-view") || "timeline";
      await hydrateReviews();
      if (reviewViewMode === "negative") {
        reviews = reviews.filter((item) => ("recent_reviews" in item ? true : item.stars <= 3));
      }
      renderReviews();
    });
  });
}

function bindProductFilters() {
  const button = document.getElementById("products-apply-button");
  if (!button) return;
  button.addEventListener("click", async () => {
    await hydrateProducts();
  });
}

function bindReviewFilters() {
  const button = document.getElementById("reviews-apply-button");
  if (!button) return;
  button.addEventListener("click", async () => {
    await hydrateReviews();
  });
}

function bindComparisonSubmit() {
  const page = document.body.dataset.page;
  if (page !== "comparison") return;
  const button = document.getElementById("comparison-apply-button");
  if (!button) return;
  button.addEventListener("click", async () => {
    await hydrateComparison();
  });
}

function bindManualRefresh() {
  const buttons = document.querySelectorAll("[data-refresh-target]");
  if (!buttons.length) return;
  buttons.forEach((button) => {
    button.addEventListener("click", async () => {
      const target = button.getAttribute("data-refresh-target");
      if (!target) return;
      const status = document.getElementById("manual-refresh-status");
      if (status) status.textContent = `正在提交 ${target} 手动更新任务...`;
      try {
        const params = new URLSearchParams({ target, source_mode: "standard" });
        const data = await fetchJson(`/ops/manual-refresh?${params.toString()}`, { method: "POST" });
        if (status) status.textContent = `${target}：${data.message}`;
      } catch (error) {
        if (status) status.textContent = `${target}：提交失败，当前仍可先使用导入方式补数。`;
      }
    });
  });
}

async function hydrateLiveData() {
  const page = document.body.dataset.page;
  if (page === "products") await hydrateProducts();
  if (page === "reviews") await hydrateReviews();
  if (page === "comparison") await hydrateComparison();
  if (page === "supplier-tasks") await hydrateTasks();
}

async function fetchJson(path, options = undefined) {
  const response = await fetch(`${API_BASE}${path}`, options);
  if (!response.ok) throw new Error(`Failed to fetch ${path}`);
  return response.json();
}

async function hydrateProducts() {
  try {
    const params = buildSearchParams(document.getElementById("products-search-input")?.value);
    params.set("limit", "100");
    const platform = document.getElementById("products-platform-filter")?.value;
    const siteCode = document.getElementById("products-site-filter")?.value;
    const storeName = document.getElementById("products-store-filter")?.value;
    if (platform) params.set("platform", platform);
    if (siteCode) params.set("site_code", siteCode);
    if (storeName) params.set("store_name", storeName);
    const data = await fetchJson(`/products?${params.toString()}`);
    if (!data.items?.length) return;
    products = data.items.map(mapProductFromApi);
    renderProducts();
  } catch (error) {
    console.warn("Products API unavailable, fallback to mock data", error);
  }
}

async function hydrateReviews() {
  try {
    const mode = reviewViewMode === "negative" ? "timeline" : reviewViewMode;
    const params = buildSearchParams(document.getElementById("reviews-search-input")?.value);
    params.set("limit", "100");
    params.set("view_mode", mode);
    const platform = document.getElementById("reviews-platform-filter")?.value;
    const siteCode = document.getElementById("reviews-site-filter")?.value;
    const storeName = document.getElementById("reviews-store-filter")?.value;
    if (platform) params.set("platform", platform);
    if (siteCode) params.set("site_code", siteCode);
    if (storeName) params.set("store_name", storeName);
    const data = await fetchJson(`/reviews?${params.toString()}`);
    if (!data.items?.length) return;
    reviews = mode === "product" ? data.items : data.items.map(mapReviewFromApi);
    if (reviewViewMode === "negative") {
      reviews = reviews.filter((item) => item.stars <= 3);
    }
    reviews = filterReviewsLocally(reviews, mode === "product");
    renderReviews();
  } catch (error) {
    console.warn("Reviews API unavailable, fallback to mock data", error);
  }
}

async function hydrateComparison() {
  try {
    const textarea = document.getElementById("comparison-input");
    const raw = textarea?.value?.trim() || "B0DXSEAT01";
    const params = new URLSearchParams({ limit: "20" });
    const mode = document.getElementById("comparison-mode")?.value || "parent";
    const scope = document.getElementById("comparison-scope")?.value || "";
    const period = document.getElementById("comparison-period")?.value || "all";
    if (mode === "parent") {
      params.set("parent_asin", splitTerms(raw)[0] || raw);
    } else if (mode === "asin") {
      params.set("asins", raw);
    } else if (mode === "sku") {
      params.set("skus", raw);
    } else {
      params.set("identifiers", raw);
    }
    if (scope && scope !== "all") params.set("platform", scope);
    const data = await fetchJson(`/products/compare?${params.toString()}`);
    if (!data.items?.length) return;
    comparisonData = data.items.map(mapComparisonFromApi);
    const note = document.getElementById("comparison-notes");
    if (note) {
      note.textContent = period === "all"
        ? (data.notes || "当前指标已按系统支持范围返回")
        : `${period} 视图已切换；${data.notes || "销量主字段仍以近30天快照为主"}`;
    }
    renderComparison();
  } catch (error) {
    console.warn("Comparison API unavailable, fallback to mock data", error);
  }
}

async function hydrateTasks() {
  try {
    const data = await fetchJson("/supplier-tasks?limit=100");
    if (!data.items?.length) return;
    tasks.splice(0, tasks.length, ...data.items.map(mapTaskFromApi));
    renderTasks();
  } catch (error) {
    console.warn("Supplier tasks API unavailable, fallback to mock data", error);
  }
}

async function hydrateScheduleSettings() {
  const defaultTimes = document.getElementById("schedule-default-times");
  const maxTimes = document.getElementById("schedule-max-times");
  if (!defaultTimes || !maxTimes) return;
  try {
    const data = await fetchJson("/ops/schedule-settings");
    defaultTimes.textContent = `${(data.default_times || []).join(" / ")} 自动更新产品、趋势、报告缓存`;
    maxTimes.textContent = `最多 ${data.max_schedule_times || 3} 个，建议只加重点时段，不做高频轮询`;
  } catch (error) {
    console.warn("Schedule settings API unavailable, fallback to static text", error);
  }
}

async function hydrateOpsInsights() {
  const page = document.body.dataset.page;
  if (page !== "settings") return;
  try {
    const [sources, deployment] = await Promise.all([
      fetchJson("/ops/source-capabilities"),
      fetchJson("/ops/deployment-profile"),
    ]);
    if (sources.items?.length) {
      renderSourceCapabilities(sources.items);
    }
    const profile = document.getElementById("deployment-profile");
    if (profile) {
      profile.innerHTML = `
        <div><strong>适用规模</strong><span>${deployment.target_scale || "个人 / 2~5 人小团队"}</span></div>
        <div><strong>服务器</strong><span>${deployment.minimum_server || "2核2G 即可"}</span></div>
        <div><strong>运行栈</strong><span>${(deployment.runtime || []).join(" / ") || "FastAPI / SQLite / Nginx / systemd"}</span></div>
        <div><strong>证书</strong><span>${deployment.ssl_plan || "Let's Encrypt 免费证书"}</span></div>
        <div><strong>图片策略</strong><span>${deployment.storage_strategy || "缩略图优先，视频只留封面图和链接"}</span></div>
      `;
    }
  } catch (error) {
    console.warn("Ops insight API unavailable, fallback to static settings copy", error);
  }
}

async function hydrateAdminData() {
  const page = document.body.dataset.page;
  if (page !== "account-management") return;
  try {
    const [userData, roleData, securityData] = await Promise.all([
      fetchJson("/admin/users"),
      fetchJson("/admin/roles"),
      fetchJson("/admin/security"),
    ]);
    if (userData.items?.length) {
      accounts = userData.items.map((item) => ({
        name: item.name,
        email: item.email,
        role: item.role,
        scope: item.scope,
        stores: item.stores || [],
        status: item.status,
        lastLogin: item.last_login || "-",
      }));
    }
    if (roleData.items?.length) {
      roles = roleData.items.map((item) => ({
        role: item.role,
        modules: item.modules || [],
        permissions: item.permissions || [],
      }));
    }
    const note = document.getElementById("accounts-note");
    if (note && userData.notes) note.textContent = userData.notes;
    const backendAdvice = document.getElementById("accounts-summary-backend");
    if (backendAdvice && securityData.deploy_mode) backendAdvice.textContent = `后台建议：${securityData.deploy_mode}`;
    const security = document.getElementById("security-settings");
    if (security) {
      security.innerHTML = `
        <div><strong>登录方式</strong><span>${securityData.login_mode || "账号密码登录"}</span></div>
        <div><strong>部署方式</strong><span>${securityData.deploy_mode || "轻量后台即可"}</span></div>
        <div><strong>密码策略</strong><span>${securityData.password_policy || "8位以上，含字母和数字"}</span></div>
        <div><strong>二次验证</strong><span>${securityData.mfa || "V1 可不启用"}</span></div>
        <div><strong>会话策略</strong><span>${securityData.session_policy || "7天内保持登录"}</span></div>
      `;
    }
    renderAccountManagement();
  } catch (error) {
    console.warn("Admin API unavailable, fallback to local mock data", error);
  }
}

function filterReviewsLocally(items, isGrouped) {
  const stars = document.getElementById("reviews-stars-filter")?.value || "";
  const media = document.getElementById("reviews-media-filter")?.value || "";
  const issue = document.getElementById("reviews-issue-filter")?.value || "";
  const feedback = document.getElementById("reviews-feedback-filter")?.value || "";
  const period = document.getElementById("reviews-period-filter")?.value || "all";

  if (isGrouped) {
    return items.filter((group) => {
      const latest = group.latest_reviewed_at ? Date.parse(group.latest_reviewed_at) : null;
      if (period !== "all" && latest && !matchesPeriod(latest, period)) return false;
      if (issue && !(group.recent_reviews || []).some((review) => review.issue_category === issue)) return false;
      if (media === "with-media" && !(group.recent_reviews || []).some((review) => review.has_images || review.review_images)) return false;
      if (media === "without-media" && (group.recent_reviews || []).some((review) => review.has_images || review.review_images)) return false;
      return true;
    });
  }

  return items.filter((item) => {
    if (stars === "1-2" && item.stars > 2) return false;
    if (stars === "3" && item.stars !== 3) return false;
    if (stars === "4-5" && item.stars < 4) return false;
    if (media === "with-media" && !item.hasImage) return false;
    if (media === "without-media" && item.hasImage) return false;
    if (issue && item.issue !== issue) return false;
    if (feedback && item.feedback !== feedback) return false;
    if (period !== "all" && item.reviewedAt && !matchesPeriod(Date.parse(item.reviewedAt), period)) return false;
    return true;
  });
}

function matchesPeriod(timestamp, period) {
  if (!timestamp || Number.isNaN(timestamp)) return true;
  const dayMap = { "30d": 30, "60d": 60, "90d": 90, "180d": 180 };
  const days = dayMap[period];
  if (!days) return true;
  const diffMs = Date.now() - timestamp;
  return diffMs <= days * 24 * 60 * 60 * 1000;
}

function mapProductFromApi(item) {
  return {
    tone: "tone-1",
    name: item.title || "未命名产品",
    asin: item.asin || "-",
    parentAsin: item.parent_asin || "-",
    sku: item.sku || item.department_item_no || "-",
    store: item.store_name || "未识别店铺",
    site: localizeSite(item.site_code),
    platform: item.platform || "-",
    category: item.category_name || item.category_path || "-",
    price: item.price_amount ? `${item.price_currency || ""}${item.price_amount}` : "-",
    sales: item.monthly_sales ?? "-",
    salesAmount: item.monthly_revenue ? `${item.price_currency || ""}${item.monthly_revenue}` : "-",
    reviews: item.review_count ?? "-",
    newReviews: "-",
    rating: item.rating ?? "-",
    imageReviews: "-",
    variantCount: item.variation_count ?? "-",
    keywords: [item.keyword_total, item.keyword_organic, item.keyword_ads].filter((value) => value !== null && value !== undefined).join(" / ") || "-",
    bsr: [item.bsr_main, item.bsr_sub].filter((value) => value !== null && value !== undefined).join(" / ") || "-",
    dimensions: [item.size_text, item.weight_text].filter(Boolean).join(" / ") || "-",
    fulfillment: item.fulfillment_type || "-",
    sellerCount: item.seller_count ?? "-",
    buybox: item.buybox_seller ? "正常" : "待补",
    buyboxSeller: item.buybox_seller || "-",
    adFlags: "-",
    contentFlags: "-",
    negative: "-",
    issue: "-",
    supplier: item.supplier_name || item.supplier_factory || "-",
    launchDate: item.launch_date || "-",
    rectify: item.status || "待补",
  };
}

function mapReviewFromApi(item) {
  return {
    tone: "tone-1",
    id: item.review_external_id || `RV-${item.id || "N/A"}`,
    title: item.review_title || "无标题评论",
    product: item.product_title || "未命名产品",
    store: item.store_name || "未识别店铺",
    site: localizeSite(item.site_code),
    platform: item.platform || "-",
    stars: item.star_rating || 3,
    hasImage: Boolean(item.has_images || item.review_images),
    mediaType: String(item.review_images || "").toLowerCase().includes("video") ? "video" : (item.has_images ? "image" : "none"),
    reviewUrl: item.review_url || "#",
    productUrl: item.product_url || "#",
    content: item.review_content || "暂无评论内容",
    issue: item.issue_category || "待分类",
    mood: item.sentiment || (item.is_negative_review ? "负面" : "中性"),
    feedback: item.feedback_to_supplier ? "已反馈" : "未反馈",
    rectify: item.rectification_status || "待反馈",
    source: item.source_type || "导入",
    asin: item.asin || "-",
    reviewedAt: item.reviewed_at || "",
    supplierTaskCode: item.supplier_task_code || "",
    supplierTaskStatus: item.supplier_task_status || "",
    supplierTaskNotes: item.supplier_task_notes || "",
  };
}

function mapComparisonFromApi(item) {
  return {
    store: item.store_name || "未识别店铺",
    site: localizeSite(item.site_code),
    sales: item.recent_sales ?? "-",
    salesAmount: item.recent_revenue ? `${item.price_currency || ""}${item.recent_revenue}` : "-",
    score: item.rating ?? "-",
    negative: item.negative_ratio ?? 0,
    volume: item.review_total ?? item.review_count ?? 0,
    imageReviews: item.image_review_total ?? "-",
    top3: item.supplier_name || item.category_name || "待补评论问题",
    action: item.buybox_seller ? `关注 ${item.buybox_seller}` : "待生成建议动作",
  };
}

function mapTaskFromApi(item) {
  return {
    id: item.task_code || `SR-${item.id}`,
    product: item.product_title || "未命名产品",
    supplier: item.supplier_name || "待补供应商",
    issue: item.issue_category || "其他",
    evidence: item.evidence_summary || "-",
    suggestedAction: item.suggested_action || "待补建议方案",
    actualRectification: item.actual_rectification || "待补实际整改",
    priority: item.priority === "high" ? "高" : item.priority === "medium" ? "中" : "低",
    status: item.status === "pending_feedback" ? "待反馈" : item.status === "in_progress" ? "处理中" : item.status === "observing" ? "观察中" : item.status === "resolved" ? "已整改" : item.status,
    due: item.due_date || "-",
  };
}
