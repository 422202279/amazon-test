const APP_ENV = window.__APP_ENV__ || "production";
const API_BASE = window.__API_BASE__ || "/api";

const demoStores = [
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

let allStores = APP_ENV === "demo" ? demoStores.slice() : [];
let stores = allStores.slice();
const AUTH_TOKEN_KEY = "cb-auth-token";
const AUTH_USER_KEY = "cb-auth-user";
const ISSUE_TAXONOMY_KEY = "cb-issue-taxonomy-v1";
const DEFAULT_ISSUE_TAXONOMY = ["待分类", "尺寸问题", "质量问题", "包装破损", "描述不符", "使用效果差", "掉色", "异味", "材质问题", "安装困难", "其他"];
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
let currentUser = null;
let activeEditorSubmit = null;
let activeTaskGenerationRows = [];
let issueTaxonomy = loadIssueTaxonomy();
let dashboardNewsPage = 1;
const dashboardNewsPageSize = 4;
let comparisonViewMode = "sales";
let reportFilterMode = "all";
let taskStatusFilter = "all";
let taskProductCatalogLoaded = false;
const selectedProductRecordIds = new Set();
const RECENT_TASK_CODES_KEY = "cb-recent-generated-task-codes";

const demoDashboardNewsItems = [
  { title: "亚马逊欧洲站包装与回收责任新要求", tag: "政策", summary: "关注法国、德国包装回收合规，涉及宠物类目包装标识与回收责任。", url: "https://sell.amazon.com" },
  { title: "Amazon Review 展示逻辑与权重变化观察", tag: "平台", summary: "重点关注低星评论、带图评论和近30天新增评论对转化的影响。", url: "https://sellercentral.amazon.com" },
  { title: "Coupang 店铺页商品展示节奏变化", tag: "韩国", summary: "韩国站建议继续以人工校验样本为主，避免把公开页当自动主链路。", url: "https://www.coupang.com" },
  { title: "Naver Smart Store 宠物类目内容规范提醒", tag: "韩国", summary: "关注本地化标题、敏感词、配送承诺和评价展示差异。", url: "https://smartstore.naver.com" },
  { title: "日本站夏季物流延迟与温控类商品风险", tag: "物流", summary: "夏季对宠物用品运输时效、包装耐热性和差评率波动影响较明显。", url: "https://www.amazon.co.jp" },
  { title: "北美宠物用品差评高频词周观察", tag: "市场", summary: "质量、尺寸、异味、描述不符仍是最常见的四大类问题。", url: "https://www.amazon.com" },
  { title: "加拿大站新上架宠物喂食器竞争观察", tag: "市场", summary: "自动喂食器类目竞争加快，需同时关注评分、BSR 和带图评论比例。", url: "https://www.amazon.ca" },
  { title: "法国站近期 VAT 与包装义务提醒", tag: "政策", summary: "正式部署前建议把法国站数据源、价格币种和包装责任一并校验。", url: "https://www.amazon.fr" },
];
const dashboardNewsItems = APP_ENV === "demo" ? demoDashboardNewsItems : [];

const demoProducts = [
  { tone: "tone-1", name: "记忆棉人体工学坐垫", asin: "B0DXSEAT01", parentAsin: "B0DXSEAT00", sku: "CUS-01-US", store: "US Home Store", site: "美国", platform: "Amazon", category: "Home & Kitchen", price: "$29.99", sales: 642, salesAmount: "$19,253", reviews: 1284, newReviews: 36, rating: 4.1, imageReviews: 93, variantCount: 4, keywords: "seat cushion / office cushion", bsr: "#1,248 / #13", dimensions: "45 x 35 x 7 cm / 1.1 kg", fulfillment: "FBA", sellerCount: 2, buybox: "异常", buyboxSeller: "BestHouse US", adFlags: "SP / 视频", contentFlags: "A+ / 品牌店铺", negative: "12 条", issue: "坐感塌陷 / 尺寸偏小", supplier: "宁波舒垫工厂", launchDate: "2026-03-12", rectify: "处理中" },
  { tone: "tone-2", name: "防漏便携咖啡杯", asin: "B0DXMUG889", parentAsin: "B0DXMUG800", sku: "MUG-02-UK", store: "UK Living", site: "英国", platform: "Amazon", category: "Kitchen & Dining", price: "£18.90", sales: 411, salesAmount: "£7,768", reviews: 986, newReviews: 18, rating: 4.3, imageReviews: 54, variantCount: 3, keywords: "travel mug / leak proof mug", bsr: "#2,904 / #41", dimensions: "510 ml / 370 g", fulfillment: "FBA", sellerCount: 1, buybox: "正常", buyboxSeller: "UK Living", adFlags: "SP", contentFlags: "A+ / 视频", negative: "4 条", issue: "漏水 / 杯盖卡扣", supplier: "厦门啡行", launchDate: "2025-11-09", rectify: "观察中" },
  { tone: "tone-3", name: "不锈钢保温杯 900ml", asin: "B0DXTHERM7", parentAsin: "B0DXTHERM0", sku: "BOT-09-DE", store: "DE Ordnung", site: "德国", platform: "Amazon", category: "Sports & Outdoors", price: "€23.50", sales: 372, salesAmount: "€8,742", reviews: 744, newReviews: 24, rating: 3.9, imageReviews: 48, variantCount: 2, keywords: "thermo bottle / trinkflasche", bsr: "#4,512 / #67", dimensions: "900 ml / 420 g", fulfillment: "FBA", sellerCount: 3, buybox: "正常", buyboxSeller: "Pet Prime DE", adFlags: "SP / SB", contentFlags: "A+", negative: "9 条", issue: "保温差 / 涂层掉色", supplier: "永康饮具厂", launchDate: "2025-08-18", rectify: "待反馈" },
  { tone: "tone-4", name: "瑜伽垫加厚防滑款", asin: "B0DXYOGA88", parentAsin: "B0DXYOGA80", sku: "YOG-07-JP", store: "JP Kitchen", site: "日本", platform: "Amazon", category: "Sports & Fitness", price: "¥3,980", sales: 298, salesAmount: "¥1,186,040", reviews: 522, newReviews: 15, rating: 4.0, imageReviews: 60, variantCount: 2, keywords: "yoga mat / ストレッチマット", bsr: "#3,220 / #28", dimensions: "183 x 61 x 1 cm / 880 g", fulfillment: "FBA", sellerCount: 1, buybox: "正常", buyboxSeller: "JP Kitchen", adFlags: "SP / 视频", contentFlags: "A+ / 品牌故事", negative: "6 条", issue: "异味 / 边缘卷曲", supplier: "南通健身材", launchDate: "2026-01-26", rectify: "处理中" },
  { tone: "tone-5", name: "化妆镜带灯便携折叠款", asin: "B0DXMIRROR", parentAsin: "B0DXMIRR00", sku: "MIR-11-US", store: "CA Comfort", site: "加拿大", platform: "Amazon", category: "Beauty & Personal Care", price: "CA$25.00", sales: 221, salesAmount: "CA$5,525", reviews: 448, newReviews: 11, rating: 4.5, imageReviews: 51, variantCount: 1, keywords: "makeup mirror / led mirror", bsr: "#1,987 / #22", dimensions: "18 x 13 x 3 cm / 520 g", fulfillment: "FBA", sellerCount: 1, buybox: "正常", buyboxSeller: "Petmo", adFlags: "视频", contentFlags: "A+ / 视频", negative: "2 条", issue: "电池续航", supplier: "深圳美妆科技", launchDate: "2026-04-16", rectify: "已整改" }
];
let products = APP_ENV === "demo" ? demoProducts.slice() : [];

const productColumns = [
  { key: "product", label: "产品", locked: true, visible: true },
  { key: "localizedTitle", label: "中文解释", visible: true },
  { key: "store", label: "店铺 / 站点", locked: true, visible: true },
  { key: "platform", label: "平台", visible: true },
  { key: "parentAsin", label: "父ASIN", visible: false },
  { key: "category", label: "类目", visible: true },
  { key: "price", label: "价格（原币种）", visible: true },
  { key: "sales", label: "近30天销量", visible: true },
  { key: "salesAmount", label: "近30天销售额", visible: false },
  { key: "reviews", label: "Review总数 / 新增", visible: true },
  { key: "newReviews", label: "近30天新增Review", visible: false },
  { key: "rating", label: "评分", visible: true },
  { key: "variantCount", label: "变体数", visible: false },
  { key: "keywords", label: "关键词", visible: true },
  { key: "bsr", label: "BSR（大类/小类）", visible: true },
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

const demoReviews = [
  { tone: "tone-1", id: "RV-10021", title: "坐两天就塌了", product: "记忆棉人体工学坐垫", store: "US Home Store", site: "美国", platform: "Amazon", stars: 2, hasImage: true, mediaType: "image", reviewUrl: "https://www.amazon.com/product-reviews/B0DXSEAT01", productUrl: "https://www.amazon.com/dp/B0DXSEAT01", content: "刚开始还可以，坐了几天中间明显塌陷，尾椎支撑不够，和图片有差距。", issue: "质量问题", mood: "负面", feedback: "未反馈", rectify: "待反馈", source: "页面补抓", asin: "B0DXSEAT01" },
  { tone: "tone-2", id: "RV-10022", title: "杯盖还是会漏", product: "防漏便携咖啡杯", store: "UK Living", site: "英国", platform: "Amazon", stars: 3, hasImage: true, mediaType: "video", reviewUrl: "https://www.amazon.co.uk/product-reviews/B0DXMUG889", productUrl: "https://www.amazon.co.uk/dp/B0DXMUG889", content: "保温不错，但背包里横放后杯盖附近还是会渗水，不适合通勤。", issue: "使用效果差", mood: "中性", feedback: "已反馈", rectify: "处理中", source: "导入", asin: "B0DXMUG889" },
  { tone: "tone-3", id: "RV-10023", title: "颜色掉漆", product: "不锈钢保温杯 900ml", store: "DE Ordnung", site: "德国", platform: "Amazon", stars: 1, hasImage: true, mediaType: "image", reviewUrl: "https://www.amazon.de/product-reviews/B0DXTHERM7", productUrl: "https://www.amazon.de/dp/B0DXTHERM7", content: "用了不到一周表面开始掉色，图片里看着很高级，实物做工一般。", issue: "掉色", mood: "负面", feedback: "未反馈", rectify: "待反馈", source: "页面补抓", asin: "B0DXTHERM7" },
  { tone: "tone-4", id: "RV-10024", title: "有点味道", product: "瑜伽垫加厚防滑款", store: "JP Kitchen", site: "日本", platform: "Amazon", stars: 2, hasImage: false, mediaType: "none", reviewUrl: "https://www.amazon.co.jp/product-reviews/B0DXYOGA88", productUrl: "https://www.amazon.co.jp/dp/B0DXYOGA88", content: "打开包装后味道比较大，晾了两天才敢使用，厚度尚可。", issue: "异味", mood: "负面", feedback: "已反馈", rectify: "观察中", source: "人工修正", asin: "B0DXYOGA88" },
  { tone: "tone-5", id: "RV-10025", title: "灯光柔和", product: "化妆镜带灯便携折叠款", store: "CA Comfort", site: "加拿大", platform: "Amazon", stars: 5, hasImage: true, mediaType: "image", reviewUrl: "https://www.amazon.ca/product-reviews/B0DXMIRROR", productUrl: "https://www.amazon.ca/dp/B0DXMIRROR", content: "灯光很自然，出差带着方便，折叠后不占地方，充一次电能用很久。", issue: "其他", mood: "正面", feedback: "无需反馈", rectify: "已关闭", source: "导入", asin: "B0DXMIRROR" },
  { tone: "tone-6", id: "RV-10026", title: "尺寸偏小", product: "记忆棉人体工学坐垫", store: "Coupang Seoul", site: "韩国", platform: "Coupang", stars: 2, hasImage: true, mediaType: "video", reviewUrl: "https://www.amazon.com/product-reviews/B0DXSEAT01", productUrl: "https://www.amazon.com/dp/B0DXSEAT01", content: "看图以为会更宽，放在办公室椅子上略小，长时间坐不太稳。", issue: "尺寸问题", mood: "负面", feedback: "已反馈", rectify: "处理中", source: "人工修正", asin: "B0DXSEAT01" }
];
let reviews = APP_ENV === "demo" ? demoReviews.slice() : [];

const demoComparisonData = [
  { store: "US Home Store", site: "美国", sales: 642, salesAmount: "$19,253", score: 4.1, negative: 8.6, volume: 1284, imageReviews: 93, top3: "坐感塌陷 / 尺寸偏小 / 回弹慢", action: "调整内芯密度与文案说明" },
  { store: "UK Living", site: "英国", sales: 411, salesAmount: "£7,768", score: 4.3, negative: 5.1, volume: 816, imageReviews: 48, top3: "尺寸偏小 / 包装褶皱 / 回弹慢", action: "优化尺寸图与包装说明" },
  { store: "DE Ordnung", site: "德国", sales: 372, salesAmount: "€8,742", score: 3.8, negative: 11.9, volume: 604, imageReviews: 52, top3: "坐感塌陷 / 描述不符 / 物流破损", action: "排查批次与物流包装" },
  { store: "Coupang Seoul", site: "韩国", sales: 295, salesAmount: "₩8,410,000", score: 4.0, negative: 7.4, volume: 472, imageReviews: 37, top3: "尺寸偏小 / 坐感偏硬 / 缝线粗糙", action: "本地化尺寸说明，抽检缝线" }
];
let comparisonData = APP_ENV === "demo" ? demoComparisonData.slice() : [];

const demoTasks = [
  { id: "SR-2048", product: "记忆棉人体工学坐垫", supplier: "宁波舒垫工厂", issue: "质量问题", evidence: "12 条差评指向坐感塌陷，含 7 条带图", suggestedAction: "先做内芯密度抽检，再给出材料与工艺调整计划", actualRectification: "已增加抽检频次，待回传改良样", priority: "高", status: "处理中", due: "2026-07-08" },
  { id: "SR-2049", product: "防漏便携咖啡杯", supplier: "厦门啡行", issue: "使用效果差", evidence: "5 条评论反馈杯盖横放渗水", suggestedAction: "复核密封圈与卡扣结构，先出问题定位报告", actualRectification: "待供应商反馈", priority: "中", status: "待反馈", due: "2026-07-06" },
  { id: "SR-2050", product: "不锈钢保温杯 900ml", supplier: "永康饮具厂", issue: "掉色", evidence: "德国站 4 条 1 星评论附图", suggestedAction: "补做附着力测试并核查表面喷涂工艺", actualRectification: "待供应商反馈", priority: "高", status: "待反馈", due: "2026-07-05" },
  { id: "SR-2051", product: "瑜伽垫加厚防滑款", supplier: "南通健身材", issue: "异味", evidence: "日本站 6 条差评集中在拆封异味", suggestedAction: "排查材料与包装密封方式，追加散味验证", actualRectification: "观察新批次反馈中", priority: "中", status: "观察中", due: "2026-07-12" },
  { id: "SR-2052", product: "化妆镜带灯便携折叠款", supplier: "深圳美妆科技", issue: "电池续航", evidence: "已完成电池批次替换验证", suggestedAction: "跟进电池批次替换后的稳定性回访", actualRectification: "已完成电池批次替换", priority: "低", status: "已整改", due: "2026-06-28" }
];
let tasks = APP_ENV === "demo" ? demoTasks.slice() : [];

const demoReports = [
  { name: "记忆棉坐垫评论分析报告", type: "产品评论分析", range: "US / UK / DE / KR", time: "2026-07-02 10:30", status: "最新" },
  { name: "多店铺坐垫差评归因对比", type: "多店铺对比", range: "4 店铺同款产品", time: "2026-07-01 18:20", status: "已归档" },
  { name: "6 月供应商整改建议汇总", type: "供应商建议", range: "8 个产品 / 5 家供应商", time: "2026-06-30 17:00", status: "可导出" },
  { name: "北美站购物车异常报告", type: "风险报告", range: "美国 / 加拿大", time: "2026-06-29 09:40", status: "待复核" }
];
let reports = APP_ENV === "demo" ? demoReports.slice() : [];

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

function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY) || "";
}

function setAuthSession(token, user) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  currentUser = user;
}

function clearAuthSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  currentUser = null;
}

function loadStoredUser() {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    currentUser = JSON.parse(raw);
    return currentUser;
  } catch (error) {
    clearAuthSession();
    return null;
  }
}

function redirectToLogin() {
  if (document.body.dataset.page !== "login") {
    window.location.href = "./login.html";
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
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
  return `
    <span class="thumb-strip">${mediaMarkup}</span>
    <span class="cell-sub media-hint">${review.mediaType === "video" ? "视频仅保留封面图，不默认跳转，避免跳错评论" : "图片缩略图本地展示，不默认跳转"}</span>
  `;
}

function isExternalUrl(url) {
  return /^https?:\/\//i.test(String(url || ""));
}

function renderExternalLink(url, label) {
  if (!isExternalUrl(url)) return `${label}不可跳转`;
  return `<a class="link-inline" href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${label}</a>`;
}

function currencyLabel(currency) {
  const text = String(currency || "").toUpperCase();
  return {
    USD: "USD",
    GBP: "GBP",
    EUR: "EUR",
    JPY: "JPY",
    CAD: "CAD",
    KRW: "KRW",
    "$": "USD",
    "£": "GBP",
    "€": "EUR",
    "¥": "JPY",
    "CA$": "CAD",
    "₩": "KRW",
  }[text] || text || "-";
}

function formatPriceWithCurrency(amount, currency) {
  if (amount === null || amount === undefined || amount === "") return "-";
  return `${currencyLabel(currency)} ${amount}`;
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
      <td>${item.store}<span class="cell-sub">${item.site}</span></td>
      <td>${item.rating}</td>
      <td>${item.negative}</td>
      <td>${item.imageReviews}</td>
      <td><span class="chip warn">${item.issue}</span></td>
      <td>${item.updatedAt || item.launchDate || "-"}</td>
      <td><span class="status ${statusClass(item.rectify)}">${item.rectify}</span></td>
    </tr>
  `).join("");

  const prioritizedReviews = prioritizeDashboardReviews(reviews).slice(0, 8);
  reviewFeed.innerHTML = prioritizedReviews.map((review, index) => `
    <article class="review-card">
      <div class="review-card-head">
        <span class="stars">${starString(review.stars)}</span>
        ${index < 3 && review.stars <= 3 ? '<span class="chip danger">今日优先</span>' : ""}
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

  const topIssues = calculateTopIssues(reviews);
  const maxIssueValue = Math.max(...topIssues.map(([, value]) => value), 1);
  issues.innerHTML = topIssues.map(([name, value]) => `
    <div class="bar-row">
      <span>${name}</span>
      <div><i style="width:${Math.max(12, Math.round((value / maxIssueValue) * 100))}%"></i></div>
      <strong>${value}</strong>
    </div>
  `).join("");
  renderDashboardNews();
}

function prioritizeDashboardReviews(items) {
  return items
    .slice()
    .sort((left, right) => {
      const leftNegative = left.stars <= 3 ? 1 : 0;
      const rightNegative = right.stars <= 3 ? 1 : 0;
      if (leftNegative !== rightNegative) return rightNegative - leftNegative;
      const leftMedia = left.hasImage ? 1 : 0;
      const rightMedia = right.hasImage ? 1 : 0;
      if (leftMedia !== rightMedia) return rightMedia - leftMedia;
      const leftStars = Number(left.stars || 0);
      const rightStars = Number(right.stars || 0);
      if (leftStars !== rightStars) return leftStars - rightStars;
      const leftTime = Date.parse(left.reviewedAt || "") || 0;
      const rightTime = Date.parse(right.reviewedAt || "") || 0;
      return rightTime - leftTime;
    });
}

function calculateTopIssues(items) {
  const counter = new Map();
  items.forEach((item) => {
    const key = item.issue || "待分类";
    counter.set(key, (counter.get(key) || 0) + 1);
  });
  const ranked = [...counter.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  return ranked.length ? ranked : issueTaxonomy.slice(1, 6).map((name, index) => [name, 12 - index * 2]);
}

function renderDashboardNews() {
  const list = document.getElementById("dashboard-news-list");
  const pageLabel = document.getElementById("dashboard-news-page");
  const prevButton = document.getElementById("dashboard-news-prev");
  const nextButton = document.getElementById("dashboard-news-next");
  const search = (document.getElementById("dashboard-news-search")?.value || "").trim().toLowerCase();
  if (!list || !pageLabel || !prevButton || !nextButton) return;
  const filtered = dashboardNewsItems.filter((item) => {
    if (!search) return true;
    return [item.title, item.tag, item.summary].some((value) => String(value || "").toLowerCase().includes(search));
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / dashboardNewsPageSize));
  dashboardNewsPage = Math.min(dashboardNewsPage, totalPages);
  dashboardNewsPage = Math.max(1, dashboardNewsPage);
  const pageItems = filtered.slice((dashboardNewsPage - 1) * dashboardNewsPageSize, dashboardNewsPage * dashboardNewsPageSize);
  list.innerHTML = pageItems.map((item) => `
    <li>
      <div>
        <a href="${escapeHtml(buildDashboardNewsUrl(item))}" target="_blank" rel="noreferrer">${escapeHtml(item.title)}</a>
        <p>${escapeHtml(item.summary)}</p>
      </div>
      <span>${escapeHtml(item.tag)}</span>
    </li>
  `).join("") || '<li><div><strong>暂无匹配资讯</strong><p>可以换个关键词继续检索。</p></div><span>空</span></li>';
  pageLabel.textContent = `第 ${dashboardNewsPage} / ${totalPages} 页`;
  prevButton.disabled = dashboardNewsPage <= 1;
  nextButton.disabled = dashboardNewsPage >= totalPages;
}

function buildDashboardNewsUrl(item) {
  const query = encodeURIComponent(`${item.title} ${item.tag} 跨境电商 亚马逊`);
  return `https://www.bing.com/search?q=${query}`;
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
            <span class="cell-sub">${store.storePageUrl ? `<a class="link-inline" href="${store.storePageUrl}" target="_blank" rel="noreferrer">店铺链接</a>` : `负责人：运营-${index + 1}`}</span>
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
      <td>${renderRowActions("store", store.recordId)}</td>
    </tr>
  `).join("") || '<tr><td colspan="10" class="empty-state">暂无店铺数据，请先导入或新增店铺。</td></tr>';
  bindStoreRowActions();
}

function renderProducts() {
  const body = document.getElementById("products-table");
  const head = document.getElementById("products-table-head");
  if (!body || !head) return;

  const visibleColumns = productColumns.filter((column) => column.visible);
  head.innerHTML = `<th><input class="table-check" id="products-check-all" type="checkbox" ${sortedSelectionState(products) ? "checked" : ""} /></th>${visibleColumns.map((column) => `<th data-col="${column.key}">${column.label}${sortIndicator(productSortState, column.key)}</th>`).join("")}<th>操作</th>`;

  const sortedProducts = applySort(products, productSortState, getProductSortValue);
  body.innerHTML = sortedProducts.map((item) => `
    <tr>
      <td><input class="table-check" data-product-select="${item.recordId || item.asin}" type="checkbox" ${selectedProductRecordIds.has(item.recordId || item.asin) ? "checked" : ""} /></td>
      ${visibleColumns.map((column) => `<td data-col="${column.key}">${renderProductCell(item, column.key)}</td>`).join("")}
      <td>${renderRowActions("product", item.recordId)}</td>
    </tr>
  `).join("") || `<tr><td colspan="${visibleColumns.length + 2}" class="empty-state">当前筛选条件下暂无产品数据。</td></tr>`;

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
  bindProductSelection();
  bindProductRowActions();
}

function getStoreStatusLabel(status, enabled) {
  if (status === "active" || enabled) return "正常监控";
  if (status === "paused") return "暂停";
  return "待补数据";
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
        ${item.imageUrl ? `<span class="thumb media-thumb product-image-thumb" style="background-image:url('${escapeHtml(item.imageUrl)}'); background-size:cover; background-position:center;"></span>` : `<span class="thumb ${item.tone}"></span>`}
        <div>
          <span class="cell-title">${item.productUrl ? `<a class="link-inline" href="${item.productUrl}" target="_blank" rel="noreferrer">${item.name}</a>` : item.name}</span>
          <span class="cell-sub">${item.asin} · ${item.sku}</span>
          <span class="cell-sub">字段覆盖 ${item.availableFields}/${item.trackedFields} · 来源 ${item.dataSource}</span>
        </div>
      </div>
    `,
    localizedTitle: `<span class="cell-title">${item.localizedTitle || "-"}</span><span class="cell-sub">${item.localizedTitleAuto ? "自动翻译初稿，可人工修正" : "人工维护"}</span>`,
    store: `${item.store}<span class="cell-sub">${item.site}</span>`,
    platform: item.platform,
    parentAsin: item.parentAsin,
    category: item.category,
    price: item.price,
    sales: item.sales,
    salesAmount: item.salesAmount,
    reviews: item.reviews,
    newReviews: item.newReviews,
    rating: `${item.rating}<span class="cell-sub">带图/视频 ${item.imageReviews}</span>`,
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

function comparisonMetric(value, suffix = "") {
  return value === null || value === undefined || value === "" || value === "-" ? "待导入" : `${value}${suffix}`;
}

function comparisonBarWidth(value, scale = 1) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(12, Math.min(100, numeric * scale));
}

function sortedSelectionState(items) {
  if (!items.length) return false;
  return items.every((item) => selectedProductRecordIds.has(item.recordId || item.asin));
}

function bindProductSelection() {
  const checkAll = document.getElementById("products-check-all");
  if (checkAll) {
    checkAll.onchange = () => {
      products.forEach((item) => {
        const key = item.recordId || item.asin;
        if (checkAll.checked) {
          selectedProductRecordIds.add(key);
        } else {
          selectedProductRecordIds.delete(key);
        }
      });
      renderProducts();
    };
  }
  document.querySelectorAll("[data-product-select]").forEach((node) => {
    node.onchange = () => {
      const key = Number(node.getAttribute("data-product-select")) || node.getAttribute("data-product-select");
      if (node.checked) {
        selectedProductRecordIds.add(key);
      } else {
        selectedProductRecordIds.delete(key);
      }
    };
  });
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
        <td><span class="cell-sub">聚合视图不支持直接编辑</span></td>
      </tr>
    `).join("") || '<tr><td colspan="13" class="empty-state">当前筛选条件下暂无评论数据。</td></tr>';
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
      <td><div class="cell-title">${review.content}</div>${review.summaryCn ? `<span class="cell-sub">中文摘要：${review.summaryCn}</span>` : ""}</td>
      <td>${renderExternalLink(review.productUrl, "产品链接")}<span class="cell-sub">${renderExternalLink(review.reviewUrl, "评论链接")}</span></td>
      <td><span class="chip neutral">${review.source}</span></td>
      <td><span class="chip ${review.issue === "其他" ? "neutral" : "warn"}">${review.issue}</span></td>
      <td><span class="status ${review.mood === "正面" ? "success" : review.mood === "中性" ? "warn" : "danger"}">${review.mood}</span></td>
      <td><span class="status ${statusClass(review.feedback)}">${review.feedback}</span>${review.supplierTaskCode ? `<span class="cell-sub"><a class="link-inline" href="./supplier-tasks.html?q=${encodeURIComponent(review.supplierTaskCode)}">任务 ${review.supplierTaskCode}</a></span>` : ""}</td>
      <td><span class="status ${statusClass(review.rectify)}">${review.rectify}</span>${review.supplierTaskStatus ? `<span class="cell-sub">${review.supplierTaskStatus}${review.supplierTaskNotes ? ` · ${review.supplierTaskNotes}` : ""}</span>` : ""}</td>
      <td>${renderRowActions("review", review.recordId)}</td>
    </tr>
  `).join("") || '<tr><td colspan="13" class="empty-state">当前筛选条件下暂无评论数据。</td></tr>';
  bindReviewSort();
  updateReviewSummary(sortedReviews, false);
  bindReviewRowActions();
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
  const issueNotes = buildComparisonIssueNotes(sortedComparison);
  const periodLabel = document.getElementById("comparison-period")?.selectedOptions?.[0]?.textContent || "近30天";
  const heading = document.getElementById("comparison-metric-heading");
  if (heading) heading.textContent = comparisonViewMode === "sales"
    ? "销量 / 销售额对比"
    : comparisonViewMode === "reviews"
      ? "评论 / 差评 / 问题对比"
      : "综合判断与建议动作";

  cards.innerHTML = sortedComparison.map((item, index) => `
    <article class="comparison-card">
      <span class="chip ${index === 2 ? "danger" : "neutral"}">${item.store}</span>
      <h3>${item.site}站</h3>
      <div class="cell-sub">ASIN：${(item.asins || []).map(escapeHtml).join(" · ") || "待补"}</div>
      <div class="numbers">
        <div><span class="cell-sub">${periodLabel}销量</span><strong>${item.sales}</strong></div>
        <div><span class="cell-sub">${periodLabel}销售额</span><strong>${item.salesAmount}</strong></div>
        <div><span class="cell-sub">评分</span><strong>${item.score}</strong></div>
        <div><span class="cell-sub">差评占比</span><strong>${comparisonMetric(item.negative, "%")}</strong></div>
        <div><span class="cell-sub">评论总数</span><strong>${item.volume}</strong></div>
        <div><span class="cell-sub">带图评论</span><strong>${comparisonMetric(item.imageReviews)}</strong></div>
      </div>
    </article>
  `).join("");

  const maxVolume = Math.max(...sortedComparison.map((i) => Number(i.volume) || 0), 1);
  if (comparisonViewMode === "sales") {
    scoreBars.innerHTML = sortedComparison.map((item) => `<div class="bar-item"><span>${item.store}</span><div><i style="width:${Math.max(12, item.score * 20)}%"></i></div><strong>${item.score}</strong></div>`).join("");
    negativeBars.innerHTML = sortedComparison.map((item) => `<div class="bar-item"><span>${item.store}</span><div><i style="width:${comparisonBarWidth(item.negative, 7)}%"></i></div><strong>${comparisonMetric(item.negative, "%")}</strong></div>`).join("");
    volumeBars.innerHTML = sortedComparison.map((item) => `<div class="bar-item"><span>${item.store}</span><div><i style="width:${(item.volume / maxVolume) * 100}%"></i></div><strong>${item.volume}</strong></div>`).join("");
    issueGrid.innerHTML = issueNotes.map(([issue, note]) => `<div class="issue-pill"><strong>${issue}</strong><span>${note}</span></div>`).join("");
  } else if (comparisonViewMode === "reviews") {
    scoreBars.innerHTML = sortedComparison.map((item) => `<div class="bar-item"><span>${item.store}</span><div><i style="width:${comparisonBarWidth(item.imageReviews, 2)}%"></i></div><strong>${comparisonMetric(item.imageReviews)}</strong></div>`).join("");
    negativeBars.innerHTML = sortedComparison.map((item) => `<div class="bar-item"><span>${item.store}</span><div><i style="width:${comparisonBarWidth(item.negative, 7)}%"></i></div><strong>${comparisonMetric(item.negative, "%")}</strong></div>`).join("");
    volumeBars.innerHTML = sortedComparison.map((item) => `<div class="bar-item"><span>${item.store}</span><div><i style="width:${(item.volume / maxVolume) * 100}%"></i></div><strong>${item.volume}</strong></div>`).join("");
    issueGrid.innerHTML = issueNotes.map(([issue, note]) => `<div class="issue-pill"><strong>${issue}</strong><span>${note}</span></div>`).join("");
  } else {
    scoreBars.innerHTML = sortedComparison.map((item) => `<div class="bar-item"><span>${item.store}</span><div><i style="width:${Math.max(12, item.sales / Math.max(...sortedComparison.map((row) => Number(row.sales) || 0), 1) * 100)}%"></i></div><strong>${item.sales}</strong></div>`).join("");
    negativeBars.innerHTML = sortedComparison.map((item) => `<div class="bar-item"><span>${item.store}</span><div><i style="width:${Math.max(12, item.score * 20)}%"></i></div><strong>${item.score}</strong></div>`).join("");
    volumeBars.innerHTML = sortedComparison.map((item) => `<div class="bar-item"><span>${item.store}</span><div><i style="width:${comparisonBarWidth(item.negative, 7)}%"></i></div><strong>${comparisonMetric(item.negative, "%")}</strong></div>`).join("");
    issueGrid.innerHTML = sortedComparison.map((item) => `<div class="issue-pill"><strong>${item.store}</strong><span>${periodLabel}建议：${item.action}</span></div>`).join("");
  }

  table.innerHTML = sortedComparison.map((item) => `
    <tr>
      <td>${item.store}</td>
      <td>${item.site}</td>
      <td>${item.sales}</td>
      <td>${item.salesAmount}</td>
      <td>${item.score}</td>
      <td>${comparisonMetric(item.negative, "%")}</td>
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

  const notes = document.getElementById("comparison-notes");
  const pool = document.getElementById("comparison-pool-chips");
  if (pool) {
    pool.innerHTML = buildComparisonPoolChips();
  }
  if (notes) {
    notes.textContent = comparisonViewMode === "sales"
      ? `${periodLabel}视图：销量 / 销售额 / 评分 / 差评占比联动对比`
      : comparisonViewMode === "reviews"
        ? `${periodLabel}视图：评论总量 / 带图评论 / 差评占比 / 问题分布`
        : `${periodLabel}视图：综合判断按销量、评分、差评占比和建议动作汇总`;
  }
}

function buildComparisonPoolChips() {
  const mode = document.getElementById("comparison-mode")?.value || "auto";
  const raw = document.getElementById("comparison-input")?.value?.trim() || "";
  const terms = splitTerms(raw);
  const scoped = selectedComparisonSites().map((code) => localizeSite(code)).join(" / ") || "全部站点";
  const chips = terms.map((term) => {
    const label = mode === "parent" ? `Parent ASIN: ${term}` : mode === "identifiers" ? `编码: ${term}` : `自动识别: ${term}`;
    return `<span class="chip neutral">${escapeHtml(label)}</span>`;
  });
  chips.push(`<span class="chip warn">当前站点：${escapeHtml(scoped)} · 已聚合 ${comparisonData.length} 个店铺</span>`);
  return chips.join("");
}

function selectedComparisonSites() {
  return [...document.querySelectorAll('#comparison-site-picks input:checked')].map((node) => node.value);
}

function getComparisonSortValue(item, key) {
  return item[key] ?? "";
}

function buildComparisonIssueNotes(items) {
  const issueMap = new Map();
  items.forEach((item) => {
    String(item.top3 || "")
      .split("/")
      .map((part) => part.trim())
      .filter(Boolean)
      .forEach((issue) => {
        if (!issueMap.has(issue)) issueMap.set(issue, []);
        issueMap.get(issue).push(item.site);
      });
  });
  return [...issueMap.entries()]
    .sort((left, right) => right[1].length - left[1].length)
    .slice(0, 4)
    .map(([issue, sites]) => [issue, `${[...new Set(sites)].join(" / ")} 关注`]);
}

function comparisonSummaryScope() {
  return comparisonData.map((item) => `${item.store}-${item.site}`).join(" / ") || "全部店铺";
}

function exportComparisonTable() {
  const headers = ["店铺", "站点", "ASIN", "近30天销量", "近30天销售额", "评分", "差评占比", "评论总数", "带图评论", "主要问题TOP3", "建议动作"];
  const rows = comparisonData.map((item) => [item.store, item.site, (item.asins || []).join(" / "), item.sales, item.salesAmount, item.score, comparisonMetric(item.negative, "%"), item.volume, item.imageReviews, item.top3, item.action]);
  downloadCsv(`comparison-${Date.now()}.csv`, [headers, ...rows]);
}

function renderDetail() {
  const feed = document.getElementById("detail-review-feed");
  if (!feed) return;
  const detailProduct = getCurrentDetailProduct();
  const openLinkButton = document.getElementById("detail-open-product-link");
  const compareButton = document.getElementById("detail-create-comparison");
  const reviewsLink = document.querySelector('.panel-head a[href="./reviews.html"]');
  if (detailProduct && document.body.dataset.page === "product-detail") {
    const titleNode = document.querySelector(".topbar h1");
    const descNode = document.querySelector(".topbar p");
    const cardTitle = document.querySelector(".product-card-large h2");
    const detailGrid = document.querySelector(".detail-grid");
    if (titleNode) titleNode.textContent = "产品详情";
    if (descNode) descNode.textContent = `ASIN: ${detailProduct.asin} · ${detailProduct.name} · ${detailProduct.store}`;
    if (cardTitle) cardTitle.textContent = detailProduct.name;
    if (detailGrid) {
      const metrics = detailGrid.querySelectorAll("strong");
      if (metrics[0]) metrics[0].textContent = detailProduct.store;
      if (metrics[1]) metrics[1].textContent = detailProduct.site;
      if (metrics[2]) metrics[2].textContent = detailProduct.price;
      if (metrics[3]) metrics[3].textContent = detailProduct.variantCount;
      if (metrics[4]) metrics[4].textContent = detailProduct.parentAsin;
      if (metrics[5]) metrics[5].textContent = detailProduct.keywords;
    }
  }
  if (reviewsLink && detailProduct?.asin) {
    reviewsLink.setAttribute("href", `./reviews.html?q=${encodeURIComponent(detailProduct.asin)}`);
  }
  if (openLinkButton) {
    openLinkButton.onclick = () => {
      const link = detailProduct?.productUrl;
      if (link) {
        window.open(link, "_blank", "noopener,noreferrer");
      } else {
        alert("当前产品还没有可用的产品链接。");
      }
    };
  }
  if (compareButton) {
    compareButton.onclick = () => {
      if (!detailProduct) return;
      const params = new URLSearchParams({
        mode: detailProduct.parentAsin && detailProduct.parentAsin !== "-" ? "parent" : "asin",
        input: detailProduct.parentAsin && detailProduct.parentAsin !== "-" ? detailProduct.parentAsin : detailProduct.asin,
        scope: detailProduct.platform !== "Amazon" ? "all" : "",
      });
      window.location.href = `./comparison.html?${params.toString()}`;
    };
  }
  const scopedReviews = reviews
    .filter((review) => review.asin === detailProduct?.asin)
    .slice(0, 6);
  feed.innerHTML = (scopedReviews.length ? scopedReviews : reviews.slice(0, 4)).map((review) => `
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

function getCurrentDetailProduct() {
  const params = new URLSearchParams(window.location.search);
  const asin = params.get("asin");
  if (asin) {
    return products.find((item) => item.asin === asin) || null;
  }
  return products[0] || null;
}

function renderTasks() {
  renderTaskSummary();
  const board = document.getElementById("task-board");
  const table = document.getElementById("tasks-table");
  if (!board || !table) return;
  const recentCodes = new Set(getRecentGeneratedTaskCodes());
  const boardStatuses = ["待反馈", "处理中", "观察中", "已整改"]
    .filter((name) => taskStatusFilter === "all" ? tasks.some((task) => task.status === name) : taskStatusFilter === name);
  board.innerHTML = boardStatuses.map((name) => `
    <section class="kanban-column">
      <h3>${name}</h3>
      ${tasks.filter((task) => task.status === name).map((task) => `
        <article class="task-card ${recentCodes.has(task.id) ? "is-recent" : ""}">
          <div class="review-card-head">
            <strong>${task.id}</strong>
            <span class="chip ${statusClass(task.priority)}">${task.priority}优先</span>
            ${recentCodes.has(task.id) ? '<span class="chip success">本次新建</span>' : ""}
          </div>
          <p>${task.product}</p>
          <p>${task.issue} · ${task.supplier}</p>
          <span class="cell-sub">建议：${task.suggestedAction}</span>
          <span class="cell-sub">截止：${task.due}</span>
        </article>
      `).join("") || '<p class="cell-sub">当前无任务</p>'}
    </section>
  `).join("");

  const visibleTasks = tasks.filter((task) => taskStatusFilter === "all" || task.status === taskStatusFilter);
  table.innerHTML = visibleTasks.map((task) => `
    <tr>
      <td>${task.id}</td>
      <td><span class="cell-title">${task.asin ? `<a class="link-inline" href="./product-detail.html?asin=${encodeURIComponent(task.asin)}">${task.product}</a>` : task.product}</span><span class="cell-sub">${task.asin || "-"}</span></td>
      <td>${task.supplier}</td>
      <td>${task.issue}</td>
      <td><span class="cell-title">${task.evidence}</span><span class="cell-sub">${task.asin ? `<a class="link-inline" href="#" data-task-evidence="${task.recordId || task.id}">查看关联评论</a>` : "暂无关联评论"}</span></td>
      <td>${task.suggestedAction}</td>
      <td>${task.actualRectification}</td>
      <td><span class="status ${statusClass(task.priority)}">${task.priority}</span></td>
      <td><span class="status ${statusClass(task.status)}">${task.status}</span></td>
      <td>${task.due}</td>
      <td>${renderRowActions("task", task.recordId)}</td>
    </tr>
  `).join("");
  bindTaskRowActions();
  bindTaskEvidenceActions();
}

function renderReports() {
  const cards = document.getElementById("report-cards");
  const table = document.getElementById("reports-table");
  if (!cards || !table) return;
  const reportTypes = [
    ["产品评论分析", "按产品聚焦评分结构、问题分类、典型差评证据和优化建议"],
    ["同款多店铺对比", "按同款产品比较各店铺评分、差评占比、问题归因和建议动作"],
    ["差评原因统计", "按问题分类汇总 TOP 原因、占比和整改优先级"],
    ["供应商整改建议", "按供应商整理问题、证据、动作建议和状态跟踪"]
  ];
  cards.innerHTML = reportTypes.map(([title, desc], index) => `
    <article class="report-card">
      <span class="chip ${index === 1 ? "warn" : "neutral"}">模板 ${index + 1}</span>
      <h3>${title}</h3>
      <p>${desc}</p>
      <div class="meta-inline">
        <a class="link-inline" href="#" data-report-template="${title}">预览模板</a>
        <a class="link-inline" href="#" data-report-template-use="${title}">直接使用</a>
      </div>
    </article>
  `).join("");

  const filteredReports = reports.filter((report) => reportFilterMode === "all" || report.type === reportFilterMode);
  table.innerHTML = filteredReports.map((report) => `
    <tr>
      <td>${report.name}</td>
      <td>${report.type}</td>
      <td>${report.range}</td>
      <td>${report.time}</td>
      <td><span class="status ${statusClass(report.status)}">${report.status}</span></td>
      <td>
        ${report.recordId ? `<a class="link-inline" href="#" data-report-preview="${report.recordId}">预览</a> / <a class="link-inline" href="#" data-report-markdown="${report.recordId}">Markdown</a> / <a class="link-inline" href="#" data-report-export="${report.recordId}">表格明细</a>` : '<span class="cell-sub">待生成</span>'}
      </td>
    </tr>
  `).join("");
  document.querySelectorAll("[data-report-template]").forEach((link) => {
    link.onclick = (event) => {
      event.preventDefault();
      previewReportTemplate(link.getAttribute("data-report-template") || "");
    };
  });
  document.querySelectorAll("[data-report-template-use]").forEach((link) => {
    link.onclick = (event) => {
      event.preventDefault();
      const type = link.getAttribute("data-report-template-use") || "";
      toggleReportBuilder(true, type);
    };
  });
  document.querySelectorAll("[data-report-preview]").forEach((link) => {
    link.onclick = async (event) => {
      event.preventDefault();
      try {
        await previewGeneratedReport(Number(link.getAttribute("data-report-preview")));
      } catch (error) {
        alert(`报告预览失败：${error.message}`);
      }
    };
  });
  document.querySelectorAll("[data-report-markdown]").forEach((link) => {
    link.onclick = async (event) => {
      event.preventDefault();
      try {
        await downloadReportMarkdown(Number(link.getAttribute("data-report-markdown")));
      } catch (error) {
        alert(`Markdown 导出失败：${error.message}`);
      }
    };
  });
  document.querySelectorAll("[data-report-export]").forEach((link) => {
    link.onclick = async (event) => {
      event.preventDefault();
      try {
        await exportSingleReportTable(Number(link.getAttribute("data-report-export")));
      } catch (error) {
        alert(`表格明细导出失败：${error.message}`);
      }
    };
  });
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
      <td>${renderRowActions("account", account.recordId)}</td>
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
  bindAccountRowActions();
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

function renderLiveValidation(payload) {
  const sampleTable = document.getElementById("dashboard-live-samples");
  const httpTable = document.getElementById("dashboard-http-checks");
  const fieldsBox = document.getElementById("dashboard-live-fields");
  if (!sampleTable || !httpTable || !fieldsBox) return;

  const sampleRows = [];
  (payload.internal_products || []).forEach((item) => {
    sampleRows.push({
      source: "内部产品表",
      sample: `${item.store_name || "-"} / ${item.asin || "-"} / ${item.title || "-"}`,
      fields: [item.product_url ? "链接" : "", item.rating ? "评分" : "", item.review_count ? "Review数" : "", item.monthly_sales ? "近30天销量" : ""]
        .filter(Boolean)
        .join(" / "),
    });
  });
  (payload.sellersprite_products || []).forEach((item) => {
    sampleRows.push({
      source: "卖家精灵产品表",
      sample: `${item.store_name || "-"} / ${item.asin || "-"} / ${item.title || "-"}`,
      fields: [item.product_url ? "链接" : "", item.price_amount ? "价格" : "", item.rating ? "评分" : "", item.review_count ? "Review数" : ""]
        .filter(Boolean)
        .join(" / "),
    });
  });
  (payload.store_links || []).forEach((item) => {
    sampleRows.push({
      source: "店铺链接表",
      sample: `${item.platform || "-"} / ${item.site_code || "-"} / ${item.store_name || "-"}`,
      fields: item.store_page_url ? "店铺链接" : "待补链接",
    });
  });

  sampleTable.innerHTML = sampleRows.map((item) => `
    <tr>
      <td>${item.source}</td>
      <td>${item.sample}</td>
      <td>${item.fields || "待补字段"}</td>
    </tr>
  `).join("");

  httpTable.innerHTML = (payload.http_checks || []).map((item) => `
    <tr>
      <td>${item.target}</td>
      <td><span class="chip ${item.code === 200 ? "success" : "warn"}">${item.status}</span></td>
      <td>${item.notes}</td>
    </tr>
  `).join("");

  const verifiedFields = payload.verified_fields || {};
  fieldsBox.innerHTML = Object.entries(verifiedFields).map(([key, values]) => `
    <div><strong>${key === "internal_products" ? "内部产品表" : key === "sellersprite_products" ? "卖家精灵产品表" : "店铺链接表"}</strong><span>${values.join(" / ")}</span></div>
  `).join("");
}

function renderRowActions(type, recordId) {
  if (!recordId) return '<span class="cell-sub">本地演示数据</span>';
  return `
    <button class="button ghost mini-action" data-row-action="edit" data-row-type="${type}" data-row-id="${recordId}">编辑</button>
    <button class="button ghost mini-action" data-row-action="delete" data-row-type="${type}" data-row-id="${recordId}">删除</button>
  `;
}

document.addEventListener("DOMContentLoaded", async () => {
  const page = document.body.dataset.page;
  if (page === "login") {
    bindLoginForm();
    if (getAuthToken()) {
      try {
        await fetchJson("/auth/me");
        window.location.href = "./index.html";
      } catch (error) {
        clearAuthSession();
      }
    }
    return;
  }

  loadStoredUser();
  if (!getAuthToken()) {
    redirectToLogin();
    return;
  }

  try {
    currentUser = await fetchJson("/auth/me");
  } catch (error) {
    clearAuthSession();
    redirectToLogin();
    return;
  }

  restoreProductColumns();
  applyInitialPageFilters();
  restorePageState();
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
  renderIssueTaxonomyManager();
  renderIssueFilterOptions();
  renderReportBuilderPreview();
  await hydrateLiveData();
  await hydrateScheduleSettings();
  await hydrateOpsInsights();
  await hydrateAdminData();
  bindStoreFilters();
  bindProductFilters();
  bindReviewFilters();
  updateSiteFilterOptions("products");
  updateSiteFilterOptions("reviews");
  updateStoreFilterOptions("products");
  updateStoreFilterOptions("reviews");
  bindReviewViewSwitch();
  bindComparisonSubmit();
  bindManualRefresh();
  bindCrudActions();
  bindDashboardWidgets();
  bindIssueTaxonomyManager();
  bindComparisonViewSwitch();
  bindComparisonActions();
  bindReportFilterSwitch();
  bindPageStatePersistence();
});

function pageStateKey() {
  return `cb-page-state:${document.body.dataset.page || "unknown"}`;
}

function restorePageState() {
  if (window.location.search) return;
  let state = {};
  try { state = JSON.parse(sessionStorage.getItem(pageStateKey()) || "{}"); } catch (error) { return; }
  document.querySelectorAll("input[id], select[id], textarea[id]").forEach((node) => {
    if (["file", "password"].includes(node.type) || !(node.id in state)) return;
    if (node.type === "checkbox") node.checked = Boolean(state[node.id]);
    else node.value = state[node.id];
  });
}

function bindPageStatePersistence() {
  const save = () => {
    const state = {};
    document.querySelectorAll("input[id], select[id], textarea[id]").forEach((node) => {
      if (["file", "password"].includes(node.type)) return;
      state[node.id] = node.type === "checkbox" ? node.checked : node.value;
    });
    sessionStorage.setItem(pageStateKey(), JSON.stringify(state));
  };
  document.querySelectorAll("input[id], select[id], textarea[id]").forEach((node) => {
    node.addEventListener("change", save);
    node.addEventListener("input", save);
  });
}

function applyInitialPageFilters() {
  const params = new URLSearchParams(window.location.search);
  const page = document.body.dataset.page;
  if (page === "products") {
    const period = params.get("period");
    const prefillSearch = params.get("q");
    if (period && document.getElementById("products-period-filter")) {
      document.getElementById("products-period-filter").value = period;
    }
    if (prefillSearch && document.getElementById("products-search-input")) {
      document.getElementById("products-search-input").value = prefillSearch;
    }
  }
  if (page === "reviews") {
    const period = params.get("period");
    const media = params.get("media");
    const view = params.get("view");
    if (period && document.getElementById("reviews-period-filter")) {
      document.getElementById("reviews-period-filter").value = period;
    }
    if (media && document.getElementById("reviews-media-filter")) {
      document.getElementById("reviews-media-filter").value = media;
    }
    if (view) {
      reviewViewMode = view;
    }
  }
  if (page === "comparison") {
    const mode = params.get("mode");
    const input = params.get("input");
    const scope = params.get("scope");
    const period = params.get("period");
    if (mode && document.getElementById("comparison-mode")) {
      document.getElementById("comparison-mode").value = mode;
    }
    if (input && document.getElementById("comparison-input")) {
      document.getElementById("comparison-input").value = input;
    }
    if (scope !== null && document.getElementById("comparison-scope")) {
      document.getElementById("comparison-scope").value = scope;
    }
    if (period && document.getElementById("comparison-period")) {
      document.getElementById("comparison-period").value = period;
    }
  }
  if (page === "reports") {
    const type = params.get("type");
    const title = params.get("title");
    const scope = params.get("scope");
    const period = params.get("period");
    if (type && document.getElementById("report-builder-type")) {
      document.getElementById("report-builder-type").value = type;
    }
    if (title && document.getElementById("report-builder-title")) {
      document.getElementById("report-builder-title").value = title;
    }
    if (scope && document.getElementById("report-builder-scope")) {
      document.getElementById("report-builder-scope").value = scope;
    }
    if (period && document.getElementById("report-builder-period")) {
      document.getElementById("report-builder-period").value = period;
    }
    if (title || type) {
      document.getElementById("report-builder-section")?.classList.remove("hidden-block");
    }
  }
  if (page === "supplier-tasks") {
    const q = params.get("q");
    if (q && document.getElementById("tasks-search-input")) {
      document.getElementById("tasks-search-input").value = q;
    }
  }
}

function bindLoginForm() {
  const button = document.getElementById("login-submit");
  if (!button) return;
  button.addEventListener("click", async () => {
    const email = document.getElementById("login-email")?.value?.trim() || "";
    const password = document.getElementById("login-password")?.value || "";
    const status = document.getElementById("login-status");
    if (status) status.textContent = "正在登录...";
    try {
      const data = await fetchJson("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setAuthSession(data.token, data.user);
      window.location.href = "./index.html";
    } catch (error) {
      if (status) status.textContent = error.message || "登录失败，请检查账号密码";
    }
  });
}

function bindCrudActions() {
  bindStoreCreate();
  bindProductCreate();
  bindReviewCreate();
  bindReviewImport();
  bindReviewUtilityActions();
  bindTaskCreate();
  bindAccountCreate();
  bindBootstrapLocalData();
  bindUrlCaptureActions();
  bindGenerateTasks();
  bindTaskImport();
  bindTaskExport();
  bindStoreImport();
  bindReportActions();
  bindLogout();
  bindProductActions();
  bindTaskFilters();
}

function bindDashboardWidgets() {
  document.getElementById("dashboard-news-search")?.addEventListener("input", () => {
    dashboardNewsPage = 1;
    renderDashboardNews();
  });
  document.getElementById("dashboard-news-prev")?.addEventListener("click", () => {
    dashboardNewsPage -= 1;
    renderDashboardNews();
  });
  document.getElementById("dashboard-news-next")?.addEventListener("click", () => {
    dashboardNewsPage += 1;
    renderDashboardNews();
  });
}

function bindProductActions() {
  document.getElementById("toggle-product-columns-top")?.addEventListener("click", () => {
    document.getElementById("toggle-product-columns")?.click();
  });
  document.getElementById("products-export-button")?.addEventListener("click", () => {
    const headers = productColumns.filter((column) => column.visible).map((column) => column.label);
    const rows = products.map((item) => productColumns.filter((column) => column.visible).map((column) => {
      const text = renderProductCell(item, column.key).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      return text;
    }));
    downloadCsv(`products-${Date.now()}.csv`, [headers, ...rows]);
  });
  document.getElementById("products-compare-button")?.addEventListener("click", () => {
    const selectedItems = products.filter((item) => selectedProductRecordIds.has(item.recordId || item.asin));
    if (!selectedItems.length) {
      alert("请先勾选至少 1 个产品再进入对比。");
      return;
    }
    const identifiers = selectedItems.map((item) => item.parentAsin && item.parentAsin !== "-" ? item.parentAsin : item.asin).filter(Boolean);
    const allParent = selectedItems.every((item) => item.parentAsin && item.parentAsin !== "-");
    const mode = allParent ? "parent" : "asin";
    const params = new URLSearchParams();
    params.set("mode", mode);
    params.set("input", identifiers.join(","));
    params.set("scope", selectedItems.some((item) => item.platform !== "Amazon") ? "all" : "");
    window.location.href = `./comparison.html?${params.toString()}`;
  });
}

function bindStoreFilters() {
  const button = document.getElementById("stores-apply-button");
  if (!button) return;
  button.addEventListener("click", async () => {
    await hydrateStores();
  });
}

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
  document.getElementById("products-platform-filter")?.addEventListener("change", () => {
    updateSiteFilterOptions("products");
    updateStoreFilterOptions("products");
  });
  document.getElementById("products-site-filter")?.addEventListener("change", () => updateStoreFilterOptions("products"));
  document.getElementById("products-store-filter")?.addEventListener("change", () => backfillSiteFromStore("products"));
  if (!button) return;
  button.addEventListener("click", async () => {
    await hydrateProducts();
  });
}

function bindReviewFilters() {
  const button = document.getElementById("reviews-apply-button");
  document.getElementById("reviews-platform-filter")?.addEventListener("change", () => {
    updateSiteFilterOptions("reviews");
    updateStoreFilterOptions("reviews");
  });
  document.getElementById("reviews-site-filter")?.addEventListener("change", () => updateStoreFilterOptions("reviews"));
  document.getElementById("reviews-store-filter")?.addEventListener("change", () => backfillSiteFromStore("reviews"));
  if (!button) return;
  button.addEventListener("click", async () => {
    await hydrateReviews();
  });
}

function bindReviewUtilityActions() {
  document.getElementById("reviews-export-button")?.addEventListener("click", () => {
    const flatReviews = reviews.filter((item) => !("recent_reviews" in item));
    const rows = flatReviews.map((item) => [
      item.id,
      item.product,
      item.store,
      item.site,
      item.platform,
      item.stars,
      item.issue,
      item.feedback,
      item.rectify,
      item.content,
    ]);
    downloadCsv(`reviews-${Date.now()}.csv`, [["评论ID", "产品", "店铺", "站点", "平台", "星级", "问题分类", "供应商反馈", "整改状态", "评论内容"], ...rows]);
  });
  document.getElementById("reviews-batch-issue-button")?.addEventListener("click", () => {
    const flatReviews = reviews.filter((item) => !("recent_reviews" in item));
    if (!flatReviews.length) {
      alert("当前没有可批量标记的评论。");
      return;
    }
    openReviewIssueBatchModal(flatReviews);
  });
}

function updateSiteFilterOptions(prefix) {
  const select = document.getElementById(`${prefix}-site-filter`);
  const platform = document.getElementById(`${prefix}-platform-filter`)?.value || "";
  if (!select) return;
  const current = select.value;
  const allowed = platformSites(platform);
  const allowMultiAmazon = platform === "Amazon";
  const options = siteOptions().filter((item) => allowed.includes(item.value));
  select.innerHTML = `<option value="">${allowMultiAmazon ? "全部站点" : platform ? "韩国" : "全部站点"}</option>${options.map((item) => `<option value="${item.value}">${item.label}</option>`).join("")}`;
  select.disabled = Boolean(platform && !allowMultiAmazon && options.length === 1);
  if (allowed.includes(current)) {
    select.value = current;
  } else if (!allowMultiAmazon && options.length === 1) {
    select.value = options[0].value;
  }
}

function updateStoreFilterOptions(prefix) {
  const platform = document.getElementById(`${prefix}-platform-filter`)?.value || "";
  const site = document.getElementById(`${prefix}-site-filter`)?.value || "";
  const select = document.getElementById(`${prefix}-store-filter`);
  if (!select) return;
  const current = select.value;
  const names = allStores
    .filter((item) => !platform || item.platform === platform)
    .filter((item) => !site || reverseLocalizeSite(item.site) === site || item.site === localizeSite(site))
    .map((item) => item.name);
  const unique = [...new Set(names)].sort((a, b) => a.localeCompare(b, "zh-CN"));
  select.innerHTML = `<option value="">全部店铺</option>${unique.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join("")}`;
  if (unique.includes(current)) select.value = current;
}

function backfillSiteFromStore(prefix) {
  const storeName = document.getElementById(`${prefix}-store-filter`)?.value || "";
  if (!storeName) return;
  const matched = allStores.find((item) => item.name === storeName);
  if (!matched) return;
  const siteSelect = document.getElementById(`${prefix}-site-filter`);
  const platformSelect = document.getElementById(`${prefix}-platform-filter`);
  if (siteSelect) siteSelect.value = reverseLocalizeSite(matched.site);
  if (platformSelect) platformSelect.value = matched.platform;
  updateStoreFilterOptions(prefix);
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

function bindComparisonViewSwitch() {
  const buttons = document.querySelectorAll("[data-comparison-view]");
  if (!buttons.length) return;
  buttons.forEach((button) => {
    button.onclick = () => {
      buttons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      comparisonViewMode = button.getAttribute("data-comparison-view") || "sales";
      renderComparison();
    };
  });
}

function bindComparisonActions() {
  document.getElementById("comparison-export-button")?.addEventListener("click", exportComparisonTable);
  document.getElementById("comparison-report-button")?.addEventListener("click", async () => {
    const title = `同款多店铺对比报告-${new Date().toISOString().slice(0, 10)}`;
    try {
      await fetchJson("/reports", { method: "POST", body: JSON.stringify({ report_type: "同款多店铺对比", title, scope: comparisonSummaryScope() }) });
      alert("同款多店铺 Markdown 报告已生成，可到报告中心查看。");
      if (document.body.dataset.page === "comparison") {
        window.location.href = "./reports.html?type=同款多店铺对比&title=" + encodeURIComponent(title) + "#report-builder-section";
      }
    } catch (error) {
      alert(`生成对比报告失败：${error.message}`);
    }
  });
}

function bindReportFilterSwitch() {
  const buttons = document.querySelectorAll("[data-report-filter]");
  if (!buttons.length) return;
  buttons.forEach((button) => {
    button.onclick = () => {
      buttons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      reportFilterMode = button.getAttribute("data-report-filter") || "all";
      renderReports();
    };
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
  await hydrateStoreRegistry();
  if (page === "dashboard") {
    await hydrateProducts();
    await hydrateReviews();
    await hydrateTasks();
  }
  if (page === "stores") await hydrateStores(false);
  if (page === "products") await hydrateProducts();
  if (page === "reviews") await hydrateReviews();
  if (page === "comparison") await hydrateComparison();
  if (page === "product-detail") await hydrateProducts();
  if (page === "supplier-tasks") await hydrateTasks();
  if (page === "reports") await hydrateReports();
}

async function hydrateStoreRegistry() {
  try {
    const data = await fetchJson("/stores");
    allStores = (data.items || []).map(mapStoreFromApi);
    stores = allStores.slice();
    updateSiteFilterOptions("products");
    updateStoreFilterOptions("products");
    updateSiteFilterOptions("reviews");
    updateStoreFilterOptions("reviews");
  } catch (error) {
    allStores = APP_ENV === "demo" ? demoStores.slice() : [];
    stores = allStores.slice();
    console.warn("Stores API unavailable", error);
  }
}

async function hydrateStores(refreshRegistry = true) {
  if (refreshRegistry) await hydrateStoreRegistry();
  try {
    const platform = document.getElementById("stores-platform-filter")?.value || "";
    const status = document.getElementById("stores-status-filter")?.value || "";
    const search = (document.getElementById("stores-search-input")?.value || "").trim().toLowerCase();
    stores = allStores
      .filter((item) => !platform || item.platform === platform)
      .filter((item) => !status || item.rawStatus === status)
      .filter((item) => {
        if (!search) return true;
        return [item.name, item.site, item.seller].some((value) => String(value || "").toLowerCase().includes(search));
      });
    renderStores();
  } catch (error) {
    stores = [];
    renderStores();
    console.warn("Stores filter unavailable", error);
  }
}

async function fetchJson(path, options = undefined) {
  const headers = new Headers(options?.headers || {});
  if (!headers.has("Content-Type") && options?.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const token = getAuthToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (response.status === 401) {
    clearAuthSession();
    redirectToLogin();
    throw new Error("登录已失效，请重新登录");
  }
  if (!response.ok) {
    let message = `Failed to fetch ${path}`;
    try {
      const errorBody = await response.json();
      message = errorBody.detail || message;
    } catch (error) {
      // ignore non-json error body
    }
    throw new Error(message);
  }
  return response.json();
}

async function hydrateProducts() {
  try {
    const params = buildSearchParams(document.getElementById("products-search-input")?.value);
    params.set("limit", "100");
    const platform = document.getElementById("products-platform-filter")?.value;
    const siteCode = document.getElementById("products-site-filter")?.value;
    const storeName = document.getElementById("products-store-filter")?.value;
    const buybox = document.getElementById("products-buybox-filter")?.value || "";
    const rectify = document.getElementById("products-rectify-filter")?.value || "";
    const risk = document.getElementById("products-risk-filter")?.value || "";
    const period = document.getElementById("products-period-filter")?.value || "all";
    params.set("period", period);
    if (platform) params.set("platform", platform);
    if (siteCode) params.set("site_code", siteCode);
    if (storeName) params.set("store_name", storeName);
    const data = await fetchJson(`/products?${params.toString()}`);
    products = (data.items || [])
      .map(mapProductFromApi)
      .filter((item) => !platform || item.platform === platform)
      .filter((item) => !siteCode || reverseLocalizeSite(item.site) === siteCode)
      .filter((item) => !storeName || item.store === storeName)
      .filter((item) => !buybox || item.buybox === buybox)
      .filter((item) => !rectify || item.rectify === rectify)
      .filter((item) => !risk || matchesProductRisk(item, risk));
    renderProducts();
    if (document.body.dataset.page === "dashboard") renderDashboard();
  } catch (error) {
    products = [];
    renderProducts();
    console.warn("Products API unavailable", error);
  }
}

function matchesProductRisk(item, risk) {
  const rating = Number(item.rating || 0);
  const buyboxRisk = item.buybox === "异常";
  const rectifyRisk = ["待反馈", "处理中"].includes(item.rectify);
  if (risk === "high") return rating > 0 && rating < 3.8 || buyboxRisk;
  if (risk === "medium") return rectifyRisk || (rating >= 3.8 && rating < 4.2);
  if (risk === "low") return rating >= 4.2 && item.buybox === "正常";
  return true;
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
    reviews = mode === "product" ? (data.items || []) : (data.items || []).map(mapReviewFromApi);
    if (reviewViewMode === "negative") {
      reviews = reviews.filter((item) => item.stars <= 3);
    }
    reviews = mode === "product"
      ? reviews
        .filter((item) => !platform || (item.recent_reviews || []).some((review) => review.platform === platform))
        .filter((item) => !siteCode || (item.sites || []).includes(localizeSite(siteCode)))
        .filter((item) => !storeName || (item.stores || []).includes(storeName))
      : reviews
        .filter((item) => !platform || item.platform === platform)
        .filter((item) => !siteCode || reverseLocalizeSite(item.site) === siteCode)
        .filter((item) => !storeName || item.store === storeName);
    reviews = filterReviewsLocally(reviews, mode === "product");
    renderReviews();
    if (document.body.dataset.page === "dashboard") renderDashboard();
  } catch (error) {
    reviews = [];
    renderReviews();
    console.warn("Reviews API unavailable", error);
  }
}

async function hydrateComparison() {
  try {
    const textarea = document.getElementById("comparison-input");
    const raw = textarea?.value?.trim() || "B0DXSEAT01";
    const params = new URLSearchParams({ limit: "20" });
    const mode = document.getElementById("comparison-mode")?.value || "auto";
    const period = document.getElementById("comparison-period")?.value || "all";
    const terms = splitTerms(raw);
    if (mode === "parent") {
      params.set("parent_asin", splitTerms(raw)[0] || raw);
    } else if (mode === "identifiers") {
      params.set("identifiers", raw);
    } else {
      if (terms.length === 1 && /^[A-Z0-9]{10}$/i.test(terms[0])) {
        params.set("parent_asin", terms[0]);
      } else if (terms.length && terms.every((term) => /^[A-Z0-9]{10}$/i.test(term))) {
        params.set("asins", raw);
      } else if (terms.length && terms.every((term) => !/^[A-Z0-9]{10}$/i.test(term))) {
        params.set("skus", raw);
      } else {
        params.set("identifiers", raw);
      }
    }
    const data = await fetchJson(`/products/compare?${params.toString()}`);
    const siteCodes = selectedComparisonSites();
    const matchedItems = (data.items || [])
      .filter((item) => !siteCodes.length || siteCodes.includes(item.site_code))
      .map(mapComparisonFromApi);
    comparisonData = groupComparisonByStore(matchedItems);
    const note = document.getElementById("comparison-notes");
    if (note) {
      note.textContent = period === "all"
        ? (data.notes || "当前指标已按系统支持范围返回")
        : `${period} 视图已切换；${data.notes || "销量主字段仍以近30天快照为主"}`;
    }
    renderComparison();
  } catch (error) {
    comparisonData = [];
    renderComparison();
    console.warn("Comparison API unavailable", error);
  }
}

function groupComparisonByStore(items) {
  const groups = new Map();
  items.forEach((item) => {
    const key = `${item.store}|${item.site}`;
    const group = groups.get(key) || {
      ...item,
      asins: [],
      sales: 0,
      salesAmountValue: 0,
      volume: 0,
      imageReviews: 0,
      scoreWeight: 0,
      scoreTotal: 0,
      negativeWeight: 0,
      negativeTotal: 0,
      issueSet: new Set(),
    };
    const volume = Number(item.volume) || 0;
    const sales = Number(item.sales) || 0;
    group.asins.push(item.asin || item.sku || "待补编码");
    group.sales += sales;
    group.salesAmountValue += Number(item.salesAmountValue) || 0;
    group.volume += volume;
    group.imageReviews += Number(item.imageReviews) || 0;
    if (Number.isFinite(Number(item.score))) {
      group.scoreTotal += Number(item.score) * Math.max(volume, 1);
      group.scoreWeight += Math.max(volume, 1);
    }
    if (Number.isFinite(Number(item.negative))) {
      group.negativeTotal += Number(item.negative) * Math.max(volume, 1);
      group.negativeWeight += Math.max(volume, 1);
    }
    String(item.top3 || "").split("/").map((value) => value.trim()).filter(Boolean).forEach((value) => group.issueSet.add(value));
    groups.set(key, group);
  });
  return [...groups.values()].map((group) => ({
    ...group,
    asins: [...new Set(group.asins)],
    sales: group.sales || "-",
    salesAmount: group.salesAmountValue ? `${group.currency || ""}${group.salesAmountValue.toFixed(2)}` : "-",
    score: group.scoreWeight ? (group.scoreTotal / group.scoreWeight).toFixed(2) : "-",
    negative: group.negativeWeight ? Number((group.negativeTotal / group.negativeWeight).toFixed(2)) : null,
    volume: group.volume || "-",
    imageReviews: group.imageReviews || "待导入",
    top3: [...group.issueSet].slice(0, 3).join(" / ") || "待导入真实评论",
  }));
}

async function hydrateTasks() {
  try {
    const params = new URLSearchParams({ limit: "100" });
    const search = document.getElementById("tasks-search-input")?.value?.trim() || "";
    if (search) params.set("q", search);
    const data = await fetchJson(`/supplier-tasks?${params.toString()}`);
    tasks.splice(0, tasks.length, ...(data.items || []).map(mapTaskFromApi));
    renderTasks();
    if (document.body.dataset.page === "dashboard") renderDashboard();
  } catch (error) {
    tasks = [];
    renderTasks();
    console.warn("Supplier tasks API unavailable", error);
  }
}

function bindTaskFilters() {
  const button = document.getElementById("tasks-apply-button");
  if (!button) return;
  button.addEventListener("click", async () => {
    await hydrateTasks();
  });
}

function renderTaskSummary() {
  const container = document.getElementById("tasks-summary");
  if (!container) return;
  const order = ["待反馈", "处理中", "观察中", "已整改"];
  const entries = order
    .map((status) => [status, tasks.filter((task) => task.status === status).length])
    .filter(([, total]) => total > 0);
  container.innerHTML = entries.map(([status, total]) => `
    <button class="kanban-stat ${taskStatusFilter === status ? "active" : ""}" data-task-status-filter="${status}" type="button">
      <span>${status}</span>
      <strong>${total}</strong>
    </button>
  `).join("") + `<button class="kanban-stat ${taskStatusFilter === "all" ? "active" : ""}" data-task-status-filter="all" type="button"><span>全部任务</span><strong>${tasks.length}</strong></button>`;
  document.querySelectorAll("[data-task-status-filter]").forEach((node) => {
    node.onclick = () => {
      taskStatusFilter = node.getAttribute("data-task-status-filter") || "all";
      renderTasks();
    };
  });
}

function bindTaskEvidenceActions() {
  document.querySelectorAll("[data-task-evidence]").forEach((node) => {
    node.onclick = async (event) => {
      event.preventDefault();
      const key = node.getAttribute("data-task-evidence");
      const task = tasks.find((item) => String(item.recordId || item.id) === String(key));
      if (!task) return;
      await openTaskEvidenceModal(task);
    };
  });
}

async function openTaskEvidenceModal(task) {
  let matchedReviews = reviews.filter((item) => !("recent_reviews" in item) && item.asin === task.asin);
  if (!matchedReviews.length) {
    try {
      const data = await fetchJson(`/reviews?limit=20&q=${encodeURIComponent(task.asin)}`);
      matchedReviews = (data.items || []).map(mapReviewFromApi).filter((item) => item.asin === task.asin);
    } catch (error) {
      matchedReviews = [];
    }
  }
  openEditorModal({
    title: `${task.id} 关联评论`,
    subtitle: `${task.product} · ${task.issue} · ${task.supplier}`,
    fields: [{ key: "preview", label: "评论证据", type: "textarea", full: true, readonly: true }],
    values: {
      preview: matchedReviews.length
        ? matchedReviews.map((item) => `${item.reviewedAt || "-"} | ${item.stars}星 | ${item.title}\n${item.content}`).join("\n\n")
        : `${task.evidence}\n\n当前未查到更细的关联评论，可继续去评论总表按 ASIN 检索。`,
    },
    saveLabel: "关闭",
    onSubmit: async () => closeEditorModal(),
  });
}

async function hydrateReports() {
  try {
    const data = await fetchJson("/reports?limit=100");
    reports = (data.items || []).map(mapReportFromApi);
    renderReports();
  } catch (error) {
    reports = [];
    renderReports();
    console.warn("Reports API unavailable", error);
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
  if (!["settings", "dashboard"].includes(page)) return;
  try {
    const requests = [
      fetchJson("/ops/source-capabilities"),
      fetchJson("/ops/deployment-profile"),
    ];
    if (page === "dashboard") {
      requests.push(fetchJson("/ops/live-validation"));
    }
    const [sources, deployment, liveValidation] = await Promise.all(requests);
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
    if (page === "dashboard" && liveValidation) {
      renderLiveValidation(liveValidation);
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
        recordId: item.id,
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

function bindBootstrapLocalData() {
  const button = document.getElementById("products-bootstrap-button");
  if (!button) return;
  button.addEventListener("click", async () => {
    button.disabled = true;
    button.textContent = "导入中...";
    try {
      await fetchJson("/ops/bootstrap-local-data", { method: "POST" });
      await hydrateProducts();
      alert("本地真实产品/店铺/销量数据已导入，可以开始筛选和编辑。");
    } catch (error) {
      alert(`导入失败：${error.message}`);
    } finally {
      button.disabled = false;
      button.textContent = "导入本地真实数据";
    }
  });
}

function buildUrlCapturePayload() {
  const url = document.getElementById("url-capture-input")?.value?.trim();
  if (!url) {
    alert("请先粘贴产品链接");
    return null;
  }
  return {
    url,
    store_name: document.getElementById("url-capture-store")?.value?.trim() || null,
    supplier_name: document.getElementById("url-capture-supplier")?.value?.trim() || null,
    supplier_factory: document.getElementById("url-capture-factory")?.value?.trim() || null,
  };
}

function renderUrlCaptureResult(item) {
  const table = document.getElementById("url-capture-table");
  if (!table || !item) return;
  const price = item.price_amount ? `${item.price_currency || ""} ${item.price_amount}`.trim() : "-";
  const statusMeta = captureStatusMeta(item.capture_status, item.capture_note);
  table.innerHTML = `
    <tr>
      <td>${escapeHtml(item.platform || "-")}</td>
      <td>${escapeHtml(localizeSite(item.site_code) || item.site_code || "-")}</td>
      <td><div class="product-cell">${item.image_url ? `<span class="thumb media-thumb product-image-thumb" style="background-image:url('${escapeHtml(item.image_url)}'); background-size:cover; background-position:center;"></span>` : `<span class="thumb tone-1"></span>`}<div><div class="cell-main">${escapeHtml(item.title || "-")}</div><div class="cell-sub"><a href="${escapeHtml(item.product_url || "#")}" target="_blank" rel="noreferrer">打开商品页</a></div></div></div></td>
      <td>${escapeHtml(item.asin || item.sku || "-")}</td>
      <td>${escapeHtml(price)}</td>
      <td>${escapeHtml(item.rating ?? "-")}</td>
      <td>${escapeHtml(item.review_count ?? "-")}</td>
      <td><span class="status ${statusMeta.statusClass}">${escapeHtml(statusMeta.label)}</span></td>
      <td>${escapeHtml(statusMeta.note)}</td>
    </tr>
  `;
}

function captureStatusMeta(status, note) {
  if (status === "ok") {
    return { label: "公开页已识别", note: note || "标题、链接等字段已抓取，可直接写入产品库。", statusClass: "success" };
  }
  if (status === "partial") {
    return { label: "部分字段待补", note: note || "公开页只拿到部分字段，建议结合导出表补全。", statusClass: "warn" };
  }
  return { label: "公开页受限", note: note || "当前环境无法稳定读取公开页，建议用导出表或手工补录。", statusClass: "danger" };
}

function bindUrlCaptureActions() {
  const previewButton = document.getElementById("url-capture-preview-button");
  const importButton = document.getElementById("url-capture-import-button");
  if (!previewButton || !importButton) return;

  previewButton.addEventListener("click", async () => {
    const payload = buildUrlCapturePayload();
    if (!payload) return;
    previewButton.disabled = true;
    previewButton.textContent = "预览中...";
    try {
      const data = await fetchJson("/ops/url-product-preview", { method: "POST", body: JSON.stringify(payload) });
      renderUrlCaptureResult(data.item);
    } catch (error) {
      alert(`链接预览失败：${error.message}`);
    } finally {
      previewButton.disabled = false;
      previewButton.textContent = "预览链接数据";
    }
  });

  importButton.addEventListener("click", async () => {
    const payload = buildUrlCapturePayload();
    if (!payload) return;
    importButton.disabled = true;
    importButton.textContent = "写入中...";
    try {
      const data = await fetchJson("/ops/url-product-import", { method: "POST", body: JSON.stringify(payload) });
      renderUrlCaptureResult(data.item);
      await hydrateProducts();
      alert(data.action === "updated" ? "已更新到产品库" : "已写入产品库");
    } catch (error) {
      alert(`写入失败：${error.message}`);
    } finally {
      importButton.disabled = false;
      importButton.textContent = "写入产品库";
    }
  });
}

function bindGenerateTasks() {
  const button = document.getElementById("reviews-generate-tasks-button") || document.getElementById("tasks-generate-button");
  if (!button) return;
  button.addEventListener("click", async () => {
    if (document.body.dataset.page === "reviews") {
      openReviewTaskGenerationModal();
      return;
    }
    try {
      const result = await fetchJson("/supplier-tasks/generate-from-reviews?limit=100", { method: "POST" });
      await hydrateTasks();
      alert(`整改任务已处理完成。\n新建：${result.created || 0} 条\n补全：${result.updated || 0} 条\n可继续到整改任务页确认和补充。`);
    } catch (error) {
      alert(`生成失败：${error.message}`);
    }
  });
}

function bindLogout() {
  const button = document.getElementById("logout-button");
  if (!button) return;
  button.addEventListener("click", async () => {
    try {
      await fetchJson("/auth/logout", { method: "POST" });
    } catch (error) {
      // ignore network error on logout
    }
    clearAuthSession();
    redirectToLogin();
  });
}

function bindProductCreate() {
  const button = document.getElementById("products-create-button");
  if (!button) return;
  button.addEventListener("click", async () => {
    openProductEditor();
  });
}

function bindReviewCreate() {
  const button = document.getElementById("reviews-create-button");
  if (!button) return;
  button.addEventListener("click", async () => {
    openReviewEditor();
  });
}

function bindReviewImport() {
  const button = document.getElementById("reviews-import-button");
  const fileInput = document.getElementById("reviews-import-file");
  if (!button || !fileInput) return;
  button.onclick = () => fileInput.click();
  fileInput.onchange = async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    button.disabled = true;
    button.textContent = "导入中...";
    try {
      const result = await fetchJson("/reviews/upload", { method: "POST", body: form });
      await hydrateReviews();
      alert(`真实评论已导入：新增 ${result.created || 0} 条，更新 ${result.updated || 0} 条。`);
    } catch (error) {
      alert(`评论导入失败：${error.message}`);
    } finally {
      button.disabled = false;
      button.textContent = "导入评论文件";
      fileInput.value = "";
    }
  };
}

function bindTaskCreate() {
  const button = document.getElementById("tasks-create-button");
  if (!button) return;
  button.addEventListener("click", async () => {
    await openTaskEditor();
  });
}

function bindTaskImport() {
  const button = document.getElementById("tasks-import-button");
  const fileInput = document.getElementById("tasks-import-file");
  if (!button || !fileInput) return;
  button.onclick = () => fileInput.click();
  fileInput.onchange = async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    const data = new FormData();
    data.append("file", file);
    button.disabled = true;
    button.textContent = "导入中...";
    try {
      const result = await fetchJson("/supplier-tasks/import", { method: "POST", body: data });
      await hydrateTasks();
      alert(`整改任务已导入：新增 ${result.created || 0} 条，更新 ${result.updated || 0} 条。`);
    } catch (error) {
      alert(`导入失败：${error.message}`);
    } finally {
      button.disabled = false;
      button.textContent = "导入整改表";
      fileInput.value = "";
    }
  };
}

function bindTaskExport() {
  document.getElementById("tasks-export-button")?.addEventListener("click", () => {
    const headers = ["任务编号", "ASIN", "产品标题", "供应商", "问题分类", "证据摘要", "建议方案", "实际整改", "优先级", "状态", "截止日期", "备注"];
    const rows = tasks.map((item) => [item.id, item.asin, item.product, item.supplier, item.issue, item.evidence, item.suggestedAction, item.actualRectification, item.priority, item.status, item.due, ""]);
    downloadCsv(`supplier-tasks-${Date.now()}.csv`, [headers, ...rows]);
  });
}

function bindAccountCreate() {
  const button = document.getElementById("accounts-create-button");
  if (!button) return;
  button.addEventListener("click", async () => {
    openAccountEditor();
  });
}

function bindProductRowActions() {
  document.querySelectorAll('[data-row-type="product"]').forEach((button) => {
    button.onclick = async () => {
      const id = Number(button.getAttribute("data-row-id"));
      const action = button.getAttribute("data-row-action");
      const target = products.find((item) => item.recordId === id);
      if (!target) return;
      if (action === "edit") {
        openProductEditor(target);
        return;
      }
      if (confirm(`确认删除产品：${target.name}？`)) {
        await fetchJson(`/products/${id}`, { method: "DELETE" });
        await hydrateProducts();
      }
    };
  });
}

function bindReviewRowActions() {
  document.querySelectorAll('[data-row-type="review"]').forEach((button) => {
    button.onclick = async () => {
      const id = Number(button.getAttribute("data-row-id"));
      const action = button.getAttribute("data-row-action");
      const target = reviews.find((item) => item.recordId === id);
      if (!target) return;
      if (action === "edit") {
        openReviewEditor(target);
        return;
      }
      if (confirm(`确认删除评论：${target.title || target.id}？`)) {
        await fetchJson(`/reviews/${id}`, { method: "DELETE" });
        await hydrateReviews();
      }
    };
  });
}

function ensureEditorModal() {
  let modal = document.getElementById("record-editor-modal");
  if (modal) return modal;
  modal = document.createElement("div");
  modal.id = "record-editor-modal";
  modal.className = "editor-modal";
  modal.innerHTML = `
    <div class="editor-modal-card">
      <div class="editor-modal-head">
        <div>
          <h3 id="editor-modal-title">编辑记录</h3>
          <p id="editor-modal-subtitle">支持一次性修改整行字段。</p>
        </div>
        <button class="editor-modal-close" id="editor-modal-close" type="button">×</button>
      </div>
      <div class="editor-modal-body">
        <form id="editor-modal-form" class="editor-form-grid"></form>
      </div>
      <div class="editor-modal-actions">
        <button class="button ghost" id="editor-modal-cancel" type="button">取消</button>
        <button class="button primary" id="editor-modal-save" type="button">保存</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeEditorModal();
  });
  document.getElementById("editor-modal-close")?.addEventListener("click", closeEditorModal);
  document.getElementById("editor-modal-cancel")?.addEventListener("click", closeEditorModal);
  document.getElementById("editor-modal-save")?.addEventListener("click", async () => {
    if (!activeEditorSubmit) return;
    try {
      await activeEditorSubmit();
    } catch (error) {
      console.warn("editor submit blocked", error);
    }
  });
  return modal;
}

function closeEditorModal() {
  const modal = document.getElementById("record-editor-modal");
  if (!modal) return;
  modal.classList.remove("open");
  const saveButton = document.getElementById("editor-modal-save");
  if (saveButton) saveButton.textContent = "保存";
  activeEditorSubmit = null;
}

function openEditorModal({ title, subtitle, fields, values, onSubmit, onReady, saveLabel = "保存" }) {
  const modal = ensureEditorModal();
  const titleNode = document.getElementById("editor-modal-title");
  const subtitleNode = document.getElementById("editor-modal-subtitle");
  const form = document.getElementById("editor-modal-form");
  const saveButton = document.getElementById("editor-modal-save");
  if (!form) return;
  if (titleNode) titleNode.textContent = title;
  if (subtitleNode) subtitleNode.textContent = subtitle;
  if (saveButton) saveButton.textContent = saveLabel;
  form.innerHTML = fields.map((field) => renderEditorField(field, values[field.key])).join("");
  activeEditorSubmit = async () => {
    const formData = collectEditorFormData(fields);
    await onSubmit(formData);
    closeEditorModal();
  };
  modal.classList.add("open");
  if (onReady) onReady(form, fields, values);
}

function renderEditorField(field, value) {
  if (field.type === "section") {
    return `<div class="section"><strong>${escapeHtml(field.label)}</strong><p>${escapeHtml(field.hint || "")}</p></div>`;
  }
  const classes = [field.full ? "full" : "", field.triple ? "triple" : "", field.required ? "required" : "", field.disabled ? "disabled" : ""].filter(Boolean).join(" ");
  const hint = field.hint ? `<small class="field-hint">${escapeHtml(field.hint)}</small>` : "";
  const datalist = field.datalist ? `<datalist id="${escapeHtml(field.datalist)}">${(field.options || []).map((option) => `<option value="${escapeHtml(option.value ?? option)}"></option>`).join("")}</datalist>` : "";
  if (field.type === "textarea") {
    return `<label class="${classes}"><span>${field.label}</span><textarea data-editor-key="${field.key}" ${field.required ? "required" : ""} ${field.disabled ? "disabled" : ""} ${field.readonly ? "readonly" : ""}>${escapeHtml(value ?? "")}</textarea>${hint}</label>`;
  }
  if (field.type === "select") {
    return `<label class="${classes}"><span>${field.label}</span><select data-editor-key="${field.key}" ${field.required ? "required" : ""} ${field.disabled ? "disabled" : ""}>${(field.options || []).map((option) => `<option value="${escapeHtml(option.value)}"${String(value ?? "") === String(option.value) ? " selected" : ""}>${escapeHtml(option.label)}</option>`).join("")}</select>${hint}</label>`;
  }
  if (field.type === "dimension") {
    const parsed = parseDimensionInput(value || "");
    return `<label class="${classes}"><span>${field.label}</span><div class="editor-grid-inline"><input data-editor-key="${field.key}_length" type="number" step="0.01" placeholder="长" value="${escapeHtml(parsed.length || "")}" /><input data-editor-key="${field.key}_width" type="number" step="0.01" placeholder="宽" value="${escapeHtml(parsed.width || "")}" /><input data-editor-key="${field.key}_height" type="number" step="0.01" placeholder="高" value="${escapeHtml(parsed.height || "")}" /></div>${hint}</label>`;
  }
  if (field.type === "weight") {
    const parsed = parseWeightInput(value || "");
    return `<label class="${classes}"><span>${field.label}</span><div class="editor-grid-inline"><input data-editor-key="${field.key}_value" type="number" step="0.01" placeholder="重量数值" value="${escapeHtml(parsed.value || "")}" /><select data-editor-key="${field.key}_unit"><option value="kg"${parsed.unit === "kg" ? " selected" : ""}>kg</option><option value="g"${parsed.unit === "g" ? " selected" : ""}>g</option></select><input data-editor-key="${field.key}_preview" type="text" value="${escapeHtml(parsed.preview || "")}" disabled /></div>${hint}</label>`;
  }
  return `<label class="${classes}"><span>${field.label}</span><input data-editor-key="${field.key}" list="${escapeHtml(field.datalist || "")}" type="${field.type || "text"}" value="${escapeHtml(value ?? "")}" ${field.required ? "required" : ""} ${field.disabled ? "disabled" : ""} ${field.readonly ? "readonly" : ""} />${datalist}${hint}</label>`;
}

function collectEditorFormData(fields) {
  const result = {};
  fields.forEach((field) => {
    if (field.type === "section") return;
    if (field.type === "dimension") {
      result[field.key] = formatDimensionInput({
        length: document.querySelector(`[data-editor-key="${field.key}_length"]`)?.value || "",
        width: document.querySelector(`[data-editor-key="${field.key}_width"]`)?.value || "",
        height: document.querySelector(`[data-editor-key="${field.key}_height"]`)?.value || "",
      });
      return;
    }
    if (field.type === "weight") {
      result[field.key] = formatWeightInput({
        value: document.querySelector(`[data-editor-key="${field.key}_value"]`)?.value || "",
        unit: document.querySelector(`[data-editor-key="${field.key}_unit"]`)?.value || "kg",
      });
      return;
    }
    const node = document.querySelector(`[data-editor-key="${field.key}"]`);
    result[field.key] = node?.value ?? "";
  });
  return result;
}

function productEditorFields() {
  return [
    { type: "section", label: "基础信息", hint: "平台、站点、店铺、标题是主档基础字段；Amazon 手工新增时建议填写 ASIN。" },
    { key: "title", label: "产品标题", full: true, required: true },
    { key: "localized_title", label: "中文解释", full: true, hint: "可手动修改；留空时系统会自动给一个中文解释占位。" },
    { key: "platform", label: "平台", type: "select", options: platformOptions(), required: true },
    { key: "site_code", label: "站点", type: "select", options: siteOptions(), required: true },
    { key: "store_name", label: "店铺名", required: true, datalist: "product-store-options", options: storeOptionValues() },
    { key: "asin", label: "ASIN", hint: "Amazon 建议严格 10 位字母数字；韩国站可为空。" },
    { key: "parent_asin", label: "父 ASIN", hint: "父子体可能相同，也可能为空。" },
    { key: "sku", label: "SKU" },
    { key: "department_item_no", label: "部门货号" },
    { key: "brand", label: "品牌", hint: "若已有同店铺产品，会优先带出最近使用的品牌。" },
    { key: "category_name", label: "类目" },
    { key: "product_url", label: "产品链接", full: true, hint: "若填了产品链接，后续可以优先尝试补主图和标题。" },
    { key: "image_url", label: "主图链接", full: true, hint: "可先留空；后续优先通过产品链接自动补主图。" },
    { type: "section", label: "经营数据", hint: "销量、评分、评论数一般以后端导入或同步结果为准，管理员也可临时修正。" },
    { key: "price_amount", label: "价格数字", type: "number" },
    { key: "price_currency", label: "币种", type: "select", options: currencyOptions(), disabled: true, hint: "按站点自动带出，不单独手选。" },
    { key: "monthly_sales", label: "近30天销量", type: "number" },
    { key: "monthly_revenue", label: "近30天销售额", type: "number" },
    { key: "review_count", label: "Review总数", type: "number" },
    { key: "rating", label: "评分", type: "number" },
    { key: "variation_count", label: "变体数", type: "number" },
    { key: "seller_count", label: "跟卖卖家数", type: "number" },
    { key: "buybox_seller", label: "BuyBox卖家" },
    { key: "fulfillment_type", label: "配送方式", type: "select", options: fulfillmentOptions() },
    { type: "section", label: "规格与供应商", hint: "尺寸建议标准化成 cm，重量建议标准化成 kg 或 g；供应商优先复用已有名称。" },
    { key: "size_text", label: "尺寸（cm）", type: "dimension", triple: true, hint: "系统会自动拼成“长 x 宽 x 高 cm”格式。" },
    { key: "weight_text", label: "重量", type: "weight", triple: true, hint: "请明确 kg 或 g，避免只写数字造成歧义。" },
    { key: "supplier_name", label: "供应商", datalist: "supplier-options", options: supplierOptionValues() },
    { key: "supplier_factory", label: "工厂 / 生产方", hint: "若与供应商相同，可留空，保存时默认补成同名。" },
    { key: "status", label: "状态", type: "select", options: productStatusOptions() },
  ];
}

function reviewEditorFields() {
  return [
    { key: "review_title", label: "评论标题", full: true },
    { key: "review_summary_cn", label: "中文摘要", type: "textarea", full: true },
    { key: "platform", label: "平台", type: "select", options: platformOptions() },
    { key: "site_code", label: "站点", type: "select", options: siteOptions() },
    { key: "store_name", label: "店铺名" },
    { key: "asin", label: "ASIN" },
    { key: "product_title", label: "产品标题", full: true },
    { key: "review_external_id", label: "评论外部ID" },
    { key: "star_rating", label: "星级", type: "select", options: starOptions() },
    { key: "issue_category", label: "问题分类", type: "select", options: issueOptions() },
    { key: "sentiment", label: "情绪", type: "select", options: sentimentOptions() },
    { key: "feedback_to_supplier", label: "是否反馈供应商", type: "select", options: yesNoOptions() },
    { key: "rectification_status", label: "整改状态", type: "select", options: rectificationStatusOptions() },
    { key: "review_url", label: "评论链接", full: true },
    { key: "product_url", label: "产品链接", full: true },
    { key: "review_images", label: "图片/视频标记" },
    { key: "source_type", label: "数据来源" },
    { key: "reviewed_at", label: "评论时间" },
    { key: "review_content", label: "评论内容", type: "textarea", full: true },
  ];
}

function openProductEditor(source = null) {
  const values = buildProductEditorValues(source);
  openEditorModal({
    title: source ? "编辑产品" : "新增产品",
    subtitle: "可一次性修改整行字段；重新抓取时系统应按平台+站点+ASIN/链接优先更新同一条记录。",
    fields: productEditorFields(),
    values,
    onReady: bindProductEditorInteractions,
    onSubmit: async (formData) => {
      const validationMessage = validateProductForm(formData);
      if (validationMessage) {
        alert(validationMessage);
        throw new Error(validationMessage);
      }
      const payload = productPayloadFromForm(formData);
      try {
        if (source?.recordId) {
          await fetchJson(`/products/${source.recordId}`, { method: "PUT", body: JSON.stringify(payload) });
        } else {
          await fetchJson("/products", { method: "POST", body: JSON.stringify(payload) });
        }
        await hydrateProducts();
      } catch (error) {
        alert(`保存产品失败：${error.message}`);
      }
    },
  });
}

function openReviewEditor(source = null) {
  const values = buildReviewEditorValues(source);
  openEditorModal({
    title: source ? "编辑评论" : "新增评论",
    subtitle: "评论原文优先保留；问题分类、是否反馈供应商、整改状态支持人工修正。",
    fields: reviewEditorFields(),
    values,
    onSubmit: async (formData) => {
      const payload = reviewPayloadFromForm(formData);
      try {
        if (source?.recordId) {
          await fetchJson(`/reviews/${source.recordId}`, { method: "PUT", body: JSON.stringify(payload) });
        } else {
          await fetchJson("/reviews", { method: "POST", body: JSON.stringify(payload) });
        }
        await hydrateReviews();
      } catch (error) {
        alert(`保存评论失败：${error.message}`);
      }
    },
  });
}

function buildProductEditorValues(source = null) {
  return source ? {
    title: source.name || "",
    localized_title: source.localizedTitle || "",
    platform: source.platform || "Amazon",
    site_code: reverseLocalizeSite(source.site) || "US",
    store_name: source.store || "",
    asin: source.asin || "",
    parent_asin: source.parentAsin === "-" ? "" : (source.parentAsin || ""),
    sku: source.sku === "-" ? "" : (source.sku || ""),
    department_item_no: "",
    brand: inferBrandForStore(source.store, reverseLocalizeSite(source.site), source.platform),
    category_name: source.category === "-" ? "" : (source.category || ""),
    product_url: source.productUrl || "",
    image_url: "",
    price_amount: stripToNumeric(source.price || ""),
    price_currency: detectCurrencySymbol(source.price || "$"),
    monthly_sales: source.sales === "-" ? "" : (source.sales || ""),
    monthly_revenue: stripToNumeric(source.salesAmount || ""),
    review_count: source.reviews === "-" ? "" : (source.reviews || ""),
    rating: source.rating === "-" ? "" : (source.rating || ""),
    variation_count: source.variantCount === "-" ? "" : (source.variantCount || ""),
    seller_count: source.sellerCount === "-" ? "" : (source.sellerCount || ""),
    buybox_seller: source.buyboxSeller === "-" ? "" : (source.buyboxSeller || ""),
    fulfillment_type: source.fulfillment === "-" ? "" : (source.fulfillment || ""),
    size_text: source.dimensions === "-" ? "" : extractSizeFromDimensions(source.dimensions || ""),
    weight_text: source.dimensions === "-" ? "" : extractWeightFromDimensions(source.dimensions || ""),
    supplier_name: source.supplier === "-" ? "" : (source.supplier || ""),
    supplier_factory: source.supplier === "-" ? "" : (source.supplier || ""),
    status: source.rectify || "正常监控",
  } : {
    title: "",
    localized_title: "",
    platform: "Amazon",
    site_code: "US",
    store_name: "",
    asin: "",
    parent_asin: "",
    sku: "",
    department_item_no: "",
    brand: inferBrandForStore("", "US", "Amazon"),
    category_name: "",
    product_url: "",
    image_url: "",
    price_amount: "",
    price_currency: "USD",
    monthly_sales: "",
    monthly_revenue: "",
    review_count: "",
    rating: "",
    variation_count: "",
    seller_count: "",
    buybox_seller: "",
    fulfillment_type: "",
    size_text: "",
    weight_text: "",
    supplier_name: "",
    supplier_factory: "",
    status: "正常监控",
  };
}

function buildReviewEditorValues(source = null) {
  return source ? {
    review_title: source.title || "",
    review_summary_cn: source.summaryCn || "",
    platform: source.platform || "Amazon",
    site_code: reverseLocalizeSite(source.site) || "US",
    store_name: source.store || "",
    asin: source.asin === "-" ? "" : (source.asin || ""),
    product_title: source.product || "",
    review_external_id: source.id || "",
    star_rating: String(source.stars || 3),
    issue_category: source.issue || "待分类",
    sentiment: source.mood || "中性",
    feedback_to_supplier: source.feedback === "已反馈" ? "yes" : "no",
    rectification_status: source.rectify || "待反馈",
    review_url: source.reviewUrl || "",
    product_url: source.productUrl || "",
    review_images: source.mediaType === "video" ? "video" : (source.hasImage ? "image" : ""),
    source_type: source.source || "手动录入",
    reviewed_at: source.reviewedAt || new Date().toISOString(),
    review_content: source.content || "",
  } : {
    review_title: "",
    review_summary_cn: "",
    platform: "Amazon",
    site_code: "US",
    store_name: "",
    asin: "",
    product_title: "",
    review_external_id: "",
    star_rating: "3",
    issue_category: "待分类",
    sentiment: "中性",
    feedback_to_supplier: "no",
    rectification_status: "待反馈",
    review_url: "",
    product_url: "",
    review_images: "",
    source_type: "手动录入",
    reviewed_at: new Date().toISOString(),
    review_content: "",
  };
}

function productPayloadFromForm(data) {
  const siteCurrency = currencyForSite(data.site_code);
  return {
    platform: data.platform,
    site_code: data.site_code,
    store_name: data.store_name || "",
    department_item_no: data.department_item_no || "",
    sku: data.sku || "",
    asin: data.asin || "",
    parent_asin: data.parent_asin || "",
    title: data.title || "",
    localized_title: data.localized_title || "",
    brand: data.brand || inferBrandForStore(data.store_name, data.site_code, data.platform) || "",
    category_path: "",
    category_name: data.category_name || "",
    product_url: data.product_url || "",
    image_url: data.image_url || "",
    price_amount: data.price_amount ? Number(data.price_amount) : null,
    price_currency: siteCurrency || data.price_currency || "",
    monthly_sales: data.monthly_sales ? Number(data.monthly_sales) : null,
    monthly_revenue: data.monthly_revenue ? Number(data.monthly_revenue) : null,
    review_count: data.review_count ? Number(data.review_count) : null,
    rating: data.rating ? Number(data.rating) : null,
    qa_count: null,
    variation_count: data.variation_count ? Number(data.variation_count) : null,
    seller_count: data.seller_count ? Number(data.seller_count) : null,
    buybox_seller: data.buybox_seller || "",
    fulfillment_type: data.fulfillment_type || "",
    keyword_total: null,
    keyword_organic: null,
    keyword_ads: null,
    bsr_main: null,
    bsr_sub: null,
    weight_text: data.weight_text || "",
    size_text: data.size_text || "",
    package_weight_text: "",
    package_size_text: "",
    supplier_name: data.supplier_name || "",
    supplier_factory: data.supplier_factory || data.supplier_name || "",
    status: data.status || "正常监控",
  };
}

function reviewPayloadFromForm(data) {
  const imageMark = String(data.review_images || "").toLowerCase();
  return {
    platform: data.platform,
    site_code: data.site_code,
    store_name: data.store_name || "",
    asin: data.asin || "",
    product_title: data.product_title || "",
    review_external_id: data.review_external_id || "",
    review_url: data.review_url || "",
    product_url: data.product_url || "",
    star_rating: data.star_rating ? Number(data.star_rating) : null,
    review_title: data.review_title || "",
    review_content: data.review_content || "",
    review_summary_cn: data.review_summary_cn || "",
    review_images: data.review_images || "",
    reviewer_name: "Local User",
    review_country: data.site_code || "US",
    review_language: "zh",
    is_verified_purchase: true,
    helpful_count: 0,
    has_images: imageMark === "image" || imageMark === "video",
    is_negative_review: data.star_rating ? Number(data.star_rating) <= 3 : false,
    issue_category: data.issue_category || "待分类",
    sentiment: data.sentiment || "中性",
    feedback_to_supplier: data.feedback_to_supplier === "yes",
    rectification_status: data.rectification_status || "待反馈",
    source_type: data.source_type || "手动录入",
    reviewed_at: data.reviewed_at || new Date().toISOString(),
  };
}

function platformOptions() {
  return [
    { value: "Amazon", label: "Amazon" },
    { value: "Coupang", label: "Coupang" },
    { value: "Naver", label: "Naver" },
  ];
}

function siteOptions() {
  return [
    { value: "US", label: "美国" },
    { value: "UK", label: "英国" },
    { value: "DE", label: "德国" },
    { value: "JP", label: "日本" },
    { value: "CA", label: "加拿大" },
    { value: "FR", label: "法国" },
    { value: "KR", label: "韩国" },
  ];
}

function currencyOptions() {
  return [
    { value: "USD", label: "USD" },
    { value: "GBP", label: "GBP" },
    { value: "EUR", label: "EUR" },
    { value: "JPY", label: "JPY" },
    { value: "CAD", label: "CAD" },
    { value: "KRW", label: "KRW" },
  ];
}

function productStatusOptions() {
  return ["正常监控", "待补数据", "暂停"].map((value) => ({ value, label: value }));
}

function fulfillmentOptions() {
  return [
    { value: "", label: "待补" },
    { value: "FBA", label: "FBA" },
    { value: "FBM", label: "FBM" },
    { value: "SFP", label: "SFP" },
  ];
}

function starOptions() {
  return [1, 2, 3, 4, 5].map((value) => ({ value: String(value), label: `${value} 星` }));
}

function issueOptions() {
  return issueTaxonomy.map((value) => ({ value, label: value }));
}

function sentimentOptions() {
  return ["正面", "中性", "负面"].map((value) => ({ value, label: value }));
}

function yesNoOptions() {
  return [
    { value: "no", label: "未反馈" },
    { value: "yes", label: "已反馈" },
  ];
}

function rectificationStatusOptions() {
  return ["待反馈", "处理中", "观察中", "已整改", "已关闭"].map((value) => ({ value, label: value }));
}

function loadIssueTaxonomy() {
  try {
    const stored = JSON.parse(localStorage.getItem(ISSUE_TAXONOMY_KEY) || "null");
    if (Array.isArray(stored) && stored.length) return stored;
  } catch (error) {
    console.warn("loadIssueTaxonomy failed", error);
  }
  return DEFAULT_ISSUE_TAXONOMY.slice();
}

function saveIssueTaxonomy() {
  localStorage.setItem(ISSUE_TAXONOMY_KEY, JSON.stringify(issueTaxonomy));
}

function renderIssueTaxonomyManager() {
  const list = document.getElementById("issue-taxonomy-list");
  if (!list) return;
  list.innerHTML = issueTaxonomy.map((item) => `
    <span class="taxonomy-pill">
      <span>${escapeHtml(item)}</span>
      ${DEFAULT_ISSUE_TAXONOMY.includes(item) ? "" : `<button type="button" data-issue-remove="${escapeHtml(item)}">×</button>`}
    </span>
  `).join("");
}

function renderIssueFilterOptions() {
  const select = document.getElementById("reviews-issue-filter");
  if (!select) return;
  const current = select.value;
  select.innerHTML = `<option value="">全部分类</option>${issueTaxonomy.filter((item) => item !== "待分类").map((item) => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`).join("")}`;
  if (issueTaxonomy.includes(current)) select.value = current;
}

function bindIssueTaxonomyManager() {
  const addButton = document.getElementById("issue-taxonomy-add");
  const resetButton = document.getElementById("issue-taxonomy-reset");
  const input = document.getElementById("issue-taxonomy-input");
  if (addButton && input) {
    addButton.onclick = () => {
      const value = input.value.trim();
      if (!value) return;
      if (!issueTaxonomy.includes(value)) {
        issueTaxonomy.push(value);
        saveIssueTaxonomy();
        renderIssueTaxonomyManager();
        renderIssueFilterOptions();
        renderDashboard();
      }
      input.value = "";
      bindIssueTaxonomyManager();
    };
  }
  if (resetButton) {
    resetButton.onclick = () => {
      issueTaxonomy = DEFAULT_ISSUE_TAXONOMY.slice();
      saveIssueTaxonomy();
      renderIssueTaxonomyManager();
      renderIssueFilterOptions();
      renderDashboard();
      bindIssueTaxonomyManager();
    };
  }
  document.querySelectorAll("[data-issue-remove]").forEach((button) => {
    button.onclick = () => {
      const value = button.getAttribute("data-issue-remove");
      issueTaxonomy = issueTaxonomy.filter((item) => item !== value);
      saveIssueTaxonomy();
      renderIssueTaxonomyManager();
      renderIssueFilterOptions();
      renderDashboard();
      bindIssueTaxonomyManager();
    };
  });
}

function storeOptionValues() {
  return allStores.map((item) => ({ value: item.name }));
}

function supplierOptionValues() {
  const values = [
    ...products.map((item) => item.supplier).filter(Boolean),
    ...tasks.map((item) => item.supplier).filter(Boolean),
  ].filter((item) => item && item !== "-");
  return [...new Set(values)].sort((a, b) => a.localeCompare(b, "zh-CN")).map((value) => ({ value }));
}

function currencyForSite(siteCode) {
  return { US: "USD", UK: "GBP", DE: "EUR", FR: "EUR", JP: "JPY", CA: "CAD", KR: "KRW" }[siteCode] || "";
}

function platformSites(platform) {
  if (platform === "Amazon") return ["US", "UK", "DE", "JP", "CA", "FR"];
  if (platform === "Coupang" || platform === "Naver") return ["KR"];
  return ["US", "UK", "DE", "JP", "CA", "FR", "KR"];
}

function inferBrandForStore(storeName, siteCode, platform) {
  const matched = products.find((item) => item.store === storeName && reverseLocalizeSite(item.site) === siteCode && item.platform === platform && item.brand);
  return matched?.brand || "";
}

function parseDimensionInput(text) {
  const values = String(text || "").match(/[\d.]+/g) || [];
  return { length: values[0] || "", width: values[1] || "", height: values[2] || "" };
}

function formatDimensionInput({ length, width, height }) {
  const values = [length, width, height].map((item) => String(item || "").trim()).filter(Boolean);
  return values.length ? `${values.join(" x ")} cm` : "";
}

function parseWeightInput(text) {
  const normalized = String(text || "").trim();
  const value = normalized.match(/[\d.]+/)?.[0] || "";
  const unit = /\bg\b/i.test(normalized) && !/\bkg\b/i.test(normalized) ? "g" : "kg";
  return { value, unit, preview: value ? `${value} ${unit}` : "" };
}

function formatWeightInput({ value, unit }) {
  const numeric = String(value || "").trim();
  return numeric ? `${numeric} ${unit || "kg"}` : "";
}

function extractSizeFromDimensions(text) {
  const parts = String(text || "").split("/").map((item) => item.trim());
  return parts[0] || "";
}

function extractWeightFromDimensions(text) {
  const parts = String(text || "").split("/").map((item) => item.trim());
  return parts[1] || "";
}

function validateProductForm(data) {
  if (!data.title?.trim()) return "产品标题为必填项。";
  if (!data.platform?.trim()) return "平台为必填项。";
  if (!data.site_code?.trim()) return "站点为必填项。";
  if (!data.store_name?.trim()) return "店铺名为必填项。";
  if (data.platform === "Amazon" && !/^[A-Z0-9]{10}$/i.test(String(data.asin || "").trim())) {
    return "Amazon 产品请填写 10 位 ASIN。";
  }
  if (data.parent_asin && data.platform === "Amazon" && !/^[A-Z0-9]{10}$/i.test(String(data.parent_asin || "").trim())) {
    return "父 ASIN 格式不正确，请检查是否为 10 位字母数字。";
  }
  if (!platformSites(data.platform).includes(data.site_code)) {
    return "当前平台与站点组合不匹配，请重新选择。";
  }
  if (!String(data.product_url || "").trim() && data.platform !== "Amazon" && !String(data.asin || "").trim()) {
    return "韩国站等非 Amazon 产品至少需要填写产品链接。";
  }
  return "";
}

function bindProductEditorInteractions() {
  const platformNode = document.querySelector('[data-editor-key="platform"]');
  const siteNode = document.querySelector('[data-editor-key="site_code"]');
  const storeNode = document.querySelector('[data-editor-key="store_name"]');
  const currencyNode = document.querySelector('[data-editor-key="price_currency"]');
  const brandNode = document.querySelector('[data-editor-key="brand"]');
  const weightValueNode = document.querySelector('[data-editor-key="weight_text_value"]');
  const weightUnitNode = document.querySelector('[data-editor-key="weight_text_unit"]');
  const weightPreviewNode = document.querySelector('[data-editor-key="weight_text_preview"]');
  const sync = () => {
    const platform = platformNode?.value || "Amazon";
    const allowedSites = platformSites(platform);
    if (siteNode) {
      [...siteNode.options].forEach((option) => {
        option.hidden = option.value ? !allowedSites.includes(option.value) : false;
      });
      if (!allowedSites.includes(siteNode.value)) siteNode.value = allowedSites[0] || "US";
    }
    if (currencyNode) currencyNode.value = currencyForSite(siteNode?.value || "US") || "USD";
    if (storeNode) {
      const matched = stores.filter((item) => item.platform === platform && reverseLocalizeSite(item.site) === (siteNode?.value || "US"));
      storeNode.setAttribute("list", "product-store-options");
      const datalist = document.getElementById("product-store-options");
      if (datalist) {
        datalist.innerHTML = matched.map((item) => `<option value="${escapeHtml(item.name)}"></option>`).join("");
      }
    }
    if (brandNode && !brandNode.value.trim()) {
      brandNode.value = inferBrandForStore(storeNode?.value || "", siteNode?.value || "US", platform) || "";
    }
  };
  const syncWeightPreview = () => {
    if (weightPreviewNode) weightPreviewNode.value = formatWeightInput({ value: weightValueNode?.value || "", unit: weightUnitNode?.value || "kg" });
  };
  platformNode?.addEventListener("change", sync);
  siteNode?.addEventListener("change", sync);
  storeNode?.addEventListener("change", sync);
  weightValueNode?.addEventListener("input", syncWeightPreview);
  weightUnitNode?.addEventListener("change", syncWeightPreview);
  sync();
  syncWeightPreview();
}

function bindTaskRowActions() {
  document.querySelectorAll('[data-row-type="task"]').forEach((button) => {
    button.onclick = async () => {
      const id = Number(button.getAttribute("data-row-id"));
      const action = button.getAttribute("data-row-action");
      const target = tasks.find((item) => item.recordId === id);
      if (!target) return;
      if (action === "edit") {
        await openTaskEditor(target);
        return;
      }
      if (confirm(`确认删除整改任务：${target.id}？`)) {
        await fetchJson(`/supplier-tasks/${id}`, { method: "DELETE" });
        await hydrateTasks();
      }
    };
  });
}

function bindAccountRowActions() {
  document.querySelectorAll('[data-row-type="account"]').forEach((button) => {
    button.onclick = async () => {
      const id = Number(button.getAttribute("data-row-id"));
      const action = button.getAttribute("data-row-action");
      const target = accounts.find((item) => item.recordId === id);
      if (!target) return;
      if (action === "edit") {
        openAccountEditor(target);
        return;
      }
      if (confirm(`确认删除账号：${target.email}？`)) {
        await fetchJson(`/admin/users/${id}`, { method: "DELETE" });
        await hydrateAdminData();
      }
    };
  });
}

function bindStoreRowActions() {
  document.querySelectorAll('[data-row-type="store"]').forEach((button) => {
    button.onclick = async () => {
      const id = Number(button.getAttribute("data-row-id"));
      const action = button.getAttribute("data-row-action");
      const target = stores.find((item) => item.recordId === id);
      if (!target) return;
      if (action === "edit") {
        openStoreEditor(target);
        return;
      }
      if (confirm(`确认删除店铺：${target.name}？`)) {
        await fetchJson(`/stores/${id}`, { method: "DELETE" });
        await hydrateStores();
      }
    };
  });
}

function promptProductPayload(source = null) {
  const title = prompt("产品标题", source?.name || "");
  if (!title) return null;
  const platform = prompt("平台", source?.platform || "Amazon") || "Amazon";
  const siteCode = prompt("站点代码（US/UK/DE/JP/CA/FR/KR）", reverseLocalizeSite(source?.site) || "US") || "US";
  const storeName = prompt("店铺名", source?.store || "") || "";
  const asin = prompt("ASIN", source?.asin || "") || "";
  const sku = prompt("SKU", source?.sku || "") || "";
  const priceAmount = prompt("价格数字", stripToNumeric(source?.price || "")) || "";
  const rating = prompt("评分", source?.rating || "") || "";
  return {
    platform,
    site_code: siteCode,
    store_name: storeName,
    asin,
    sku,
    title,
    category_name: source?.category || "",
    product_url: source?.productUrl || "",
    price_amount: priceAmount ? Number(priceAmount) : null,
    price_currency: detectCurrencySymbol(source?.price || "$"),
    monthly_sales: Number(source?.sales || 0) || null,
    monthly_revenue: stripToNumeric(source?.salesAmount || "") ? Number(stripToNumeric(source.salesAmount)) : null,
    review_count: Number(source?.reviews || 0) || null,
    rating: rating ? Number(rating) : null,
    variation_count: Number(source?.variantCount || 0) || null,
    seller_count: Number(source?.sellerCount || 0) || null,
    buybox_seller: source?.buyboxSeller || "",
    fulfillment_type: source?.fulfillment || "",
    keyword_total: null,
    keyword_organic: null,
    keyword_ads: null,
    bsr_main: null,
    bsr_sub: null,
    weight_text: source?.dimensions || "",
    size_text: source?.dimensions || "",
    package_weight_text: "",
    package_size_text: "",
    supplier_name: source?.supplier || "",
    supplier_factory: source?.supplier || "",
    status: source?.rectify || "正常监控",
    parent_asin: source?.parentAsin || "",
    brand: "",
    category_path: "",
    image_url: "",
    department_item_no: "",
    qa_count: null,
  };
}

function promptStorePayload(source = null) {
  const name = prompt("店铺名", source?.name || "");
  if (!name) return null;
  return {
    name,
    platform: prompt("平台", source?.platform || "Amazon") || "Amazon",
    site_code: prompt("站点代码（US/UK/DE/JP/CA/FR/KR）", reverseLocalizeSite(source?.site) || "US") || "US",
    country_code: prompt("国家代码", source?.countryCode || reverseLocalizeSite(source?.site) || "") || "",
    seller_identifier: prompt("Seller ID / 店铺标识", source?.seller || "") || "",
    store_page_url: prompt("店铺链接", source?.storePageUrl || "") || "",
    status: prompt("状态（active/paused）", source?.rawStatus || "active") || "active",
    data_source: prompt("数据来源", source?.dataSource || "internal_store_links") || "internal_store_links",
    notes: prompt("备注", source?.notes || "") || "",
    is_enabled: (prompt("是否启用（yes/no）", source?.enabled ? "yes" : "yes") || "yes") === "yes",
  };
}

function storeEditorFields() {
  return [
    { type: "section", label: "基础信息", hint: "店铺名、平台、站点、状态为必填；韩国平台默认只允许韩国站点。" },
    { key: "name", label: "店铺名", required: true },
    { key: "platform", label: "平台", type: "select", options: platformOptions(), required: true },
    { key: "site_code", label: "站点", type: "select", options: siteOptions(), required: true },
    { key: "country_code", label: "国家代码", required: true, disabled: true, hint: "由站点自动带出，不能手工修改。" },
    { key: "seller_identifier", label: "Seller ID / 店铺标识" },
    { key: "store_page_url", label: "店铺链接", full: true },
    { key: "status", label: "状态", type: "select", options: [{ value: "active", label: "启用" }, { value: "paused", label: "暂停" }], required: true },
    { key: "data_source", label: "数据来源", type: "select", options: [{ value: "manual_sheet", label: "表格导入" }, { value: "internal_store_links", label: "店铺链接表" }, { value: "manual", label: "手动维护" }], required: true },
    { key: "is_enabled", label: "是否启用", type: "select", options: [{ value: "yes", label: "启用" }, { value: "no", label: "停用" }], required: true },
    { key: "notes", label: "备注", type: "textarea", full: true },
  ];
}

function openStoreEditor(source = null) {
  const values = source ? {
    name: source.name || "",
    platform: source.platform || "Amazon",
    site_code: reverseLocalizeSite(source.site) || "US",
    country_code: source.countryCode || reverseLocalizeSite(source.site) || "",
    seller_identifier: source.seller === "-" ? "" : (source.seller || ""),
    store_page_url: source.storePageUrl || "",
    status: source.rawStatus || "active",
    data_source: source.dataSource || "manual_sheet",
    is_enabled: source.enabled ? "yes" : "no",
    notes: source.notes || "",
  } : {
    name: "",
    platform: "Amazon",
    site_code: "US",
    country_code: "US",
    seller_identifier: "",
    store_page_url: "",
    status: "active",
    data_source: "manual",
    is_enabled: "yes",
    notes: "",
  };
  openEditorModal({
    title: source ? "编辑店铺" : "新增店铺",
    subtitle: "新增和修改都使用整表单；平台切换后会联动可选站点。",
    fields: storeEditorFields(),
    values,
    onReady: bindStoreEditorInteractions,
    onSubmit: async (formData) => {
      const payload = {
        name: formData.name || "",
        platform: formData.platform || "Amazon",
        site_code: formData.site_code || "US",
        country_code: formData.country_code || formData.site_code || "US",
        seller_identifier: formData.seller_identifier || "",
        store_page_url: formData.store_page_url || "",
        status: formData.status || "active",
        data_source: formData.data_source || "manual",
        notes: formData.notes || "",
        is_enabled: formData.is_enabled === "yes",
      };
      if (!payload.name.trim()) throw new Error("店铺名不能为空");
      if (!platformSites(payload.platform).includes(payload.site_code)) throw new Error("平台与站点不匹配");
      if (!payload.country_code.trim()) throw new Error("国家代码不能为空");
      if (source?.recordId) {
        await fetchJson(`/stores/${source.recordId}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await fetchJson("/stores", { method: "POST", body: JSON.stringify(payload) });
      }
      await hydrateStores();
    },
  });
}

function bindStoreEditorInteractions() {
  const platformNode = document.querySelector('[data-editor-key="platform"]');
  const siteNode = document.querySelector('[data-editor-key="site_code"]');
  const countryNode = document.querySelector('[data-editor-key="country_code"]');
  const sync = () => {
    const platform = platformNode?.value || "Amazon";
    const allowed = platformSites(platform);
    if (siteNode) {
      [...siteNode.options].forEach((option) => {
        option.hidden = option.value ? !allowed.includes(option.value) : false;
      });
      if (!allowed.includes(siteNode.value)) siteNode.value = allowed[0] || "US";
    }
    if (countryNode) countryNode.value = siteNode?.value || "US";
  };
  platformNode?.addEventListener("change", sync);
  siteNode?.addEventListener("change", sync);
  sync();
}

function buildReportBuilderPayload() {
  const title = document.getElementById("report-builder-title")?.value?.trim() || "";
  const reportType = document.getElementById("report-builder-type")?.value || "产品评论分析";
  const scopeNote = document.getElementById("report-builder-scope")?.value?.trim() || "";
  const period = document.getElementById("report-builder-period")?.value || "30d";
  const scopeSites = collectReportBuilderSites();
  const modules = [...document.querySelectorAll('#report-builder-modules input:checked')].map((item) => item.value);
  const formats = [...document.querySelectorAll('#report-builder-formats input:checked')].map((item) => item.value);
  if (!title) {
    alert("请先填写报告标题");
    return null;
  }
  if (!scopeSites.length) {
    alert("请至少勾选 1 个覆盖站点");
    return null;
  }
  return {
    report_type: reportType,
    title,
    scope: `${scopeSites.join("/")} | 周期:${period} | 模块:${modules.join("/") || "summary"} | 格式:${formats.join("/") || "markdown"}${scopeNote ? ` | 备注:${scopeNote}` : ""}`,
  };
}

function renderReportBuilderPreview() {
  const body = document.getElementById("report-builder-preview");
  if (!body) return;
  const modules = [...document.querySelectorAll('#report-builder-modules input:checked')].map((item) => item.value);
  const formats = [...document.querySelectorAll('#report-builder-formats input:checked')].map((item) => item.value);
  const scopeSites = collectReportBuilderSites();
  const periodText = document.getElementById("report-builder-period")?.selectedOptions?.[0]?.textContent || "近30天";
  const mapping = {
    summary: ["摘要结论", `${scopeSites.join(" / ") || "全部站点"}的核心指标概览、异常提醒、重点差评摘要`, formats.join(" / ") || "Markdown"],
    product_table: ["产品表格", `${periodText}产品总表关键字段、销量、评分、链接`, formats.includes("table") ? "表格明细 + Markdown" : "Markdown"],
    review_table: ["评论表格", `${periodText}评论内容、问题分类、是否反馈供应商、整改状态`, formats.includes("table") ? "表格明细 + Markdown" : "Markdown"],
    comparison_table: ["多店铺对比表", `${periodText}销量、销售额、评分、差评占比、TOP问题`, formats.includes("table") ? "表格明细 + Markdown" : "Markdown"],
    issue_chart: ["问题分类统计", `${periodText} TOP5 问题分类与站点分布`, "Markdown"],
    supplier_tasks: ["整改任务跟进", `供应商任务状态、建议方案、实际整改、截止时间`, formats.includes("table") ? "表格明细 + Markdown" : "Markdown"],
  };
  body.innerHTML = modules.map((key) => {
    const [label, content, output] = mapping[key] || [key, "待定义", formats.join(" / ")];
    return `<tr><td>${label}</td><td>${content}</td><td>${output}</td></tr>`;
  }).join("") || '<tr><td colspan="3">请至少勾选一个模块</td></tr>';
}

function exportReportsTable() {
  const headers = ["报告名称", "类型", "覆盖范围", "生成时间", "状态"];
  const rows = reports
    .filter((report) => reportFilterMode === "all" || report.type === reportFilterMode)
    .map((report) => [report.name, report.type, report.range, report.time, report.status]);
  downloadCsv(`reports-${Date.now()}.csv`, [headers, ...rows]);
}

function collectReportBuilderSites() {
  const checked = [...document.querySelectorAll('#report-builder-scopes input:checked')].map((item) => item.value);
  return checked.map((code) => localizeSite(code));
}

function toggleReportBuilder(forceOpen = true, reportType = "") {
  const section = document.getElementById("report-builder-section");
  if (!section) return;
  section.classList.toggle("hidden-block", !forceOpen);
  if (reportType && document.getElementById("report-builder-type")) {
    document.getElementById("report-builder-type").value = reportType;
  }
  syncReportBuilderByType();
  renderReportBuilderPreview();
  if (forceOpen) {
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    document.getElementById("report-builder-title")?.focus();
  }
}

function syncReportBuilderByType() {
  const type = document.getElementById("report-builder-type")?.value || "产品评论分析";
  const defaults = {
    "产品评论分析": ["summary", "product_table", "review_table", "issue_chart"],
    "同款多店铺对比": ["summary", "comparison_table", "review_table", "issue_chart"],
    "差评原因统计": ["summary", "review_table", "issue_chart"],
    "供应商整改建议": ["summary", "review_table", "supplier_tasks"],
  };
  const active = new Set(defaults[type] || defaults["产品评论分析"]);
  document.querySelectorAll('#report-builder-modules input').forEach((node) => {
    node.checked = active.has(node.value);
  });
}

function previewReportTemplate(reportType) {
  openEditorModal({
    title: `${reportType}模板预览`,
    subtitle: "这里先看模板结构和典型输出，不直接生成数据。",
    fields: [{ key: "preview", label: "模板预览", type: "textarea", full: true, readonly: true }],
    values: {
      preview: buildReportTemplateText(reportType),
    },
    saveLabel: "关闭",
    onSubmit: async () => closeEditorModal(),
  });
}

function buildReportTemplateText(reportType) {
  const templates = {
    "产品评论分析": "1. 核心概览\n2. 产品基础信息\n3. 近周期评分/评论变化\n4. 重点差评原文与中文摘要\n5. 问题分类TOP5\n6. 建议动作",
    "同款多店铺对比": "1. 同款组概览\n2. 多店铺销量/销售额/评分对比\n3. 差评占比与带图评论对比\n4. 各站点主要问题TOP3\n5. 综合判断与建议动作",
    "差评原因统计": "1. 差评总量\n2. 各问题分类占比\n3. 各站点差评聚集点\n4. 典型证据评论\n5. 优先处理建议",
    "供应商整改建议": "1. 供应商问题汇总\n2. 证据评论与星级\n3. 建议整改方案\n4. 实际整改跟踪\n5. 截止时间与责任状态",
  };
  return templates[reportType] || "暂无模板说明";
}

async function previewGeneratedReport(reportId) {
  if (!reportId) return;
  const data = await fetchJson(`/reports/${reportId}/snapshot`);
  openEditorModal({
    title: data.title || "报告预览",
    subtitle: `${data.report_type || "-"} · ${data.scope || "全部范围"} · ${data.created_at || ""}`,
    fields: [{ key: "preview", label: "报告正文", type: "textarea", full: true, readonly: true }],
    values: {
      preview: data.markdown_content || "暂无正文",
    },
    saveLabel: "关闭",
    onSubmit: async () => closeEditorModal(),
  });
}

async function downloadReportMarkdown(reportId) {
  if (!reportId) return;
  const token = getAuthToken();
  const response = await fetch(`${API_BASE}/reports/${reportId}/markdown`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(text || "Markdown 导出失败");
  }
  downloadTextFile(`report-${reportId}.md`, text, "text/markdown;charset=utf-8");
}

async function exportSingleReportTable(reportId) {
  if (!reportId) return;
  const data = await fetchJson(`/reports/${reportId}/snapshot`);
  const snapshot = data.snapshot || {};
  const summaryRows = [
    ["报告标题", data.title || ""],
    ["报告类型", data.report_type || ""],
    ["覆盖范围", data.scope || ""],
    ["生成时间", data.created_at || ""],
    ["产品数", snapshot.product_total || 0],
    ["评论数", snapshot.review_total || 0],
    ["差评数", snapshot.negative_total || 0],
    ["整改任务数", snapshot.task_total || 0],
    ["未关闭整改任务", snapshot.task_open || 0],
  ];
  const productRows = snapshot.product_rows || [];
  const reviewRows = snapshot.review_rows || [];
  if (!productRows.length && !reviewRows.length) {
    downloadCsv(`report-detail-${reportId}.csv`, [["字段", "值"], ...summaryRows]);
    return;
  }
  const productHeaders = Object.keys(productRows[0] || {});
  const reviewHeaders = Object.keys(reviewRows[0] || {});
  const rows = [
    ["报告摘要"],
    ...summaryRows,
    [],
    ["产品完整明细"],
    productHeaders,
    ...productRows.map((row) => productHeaders.map((key) => row[key] ?? "")),
  ];
  if (reviewRows.length) rows.push([], ["评论证据明细"], reviewHeaders, ...reviewRows.map((row) => reviewHeaders.map((key) => row[key] ?? "")));
  downloadCsv(`report-detail-${reportId}.csv`, rows);
}

function downloadTextFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

function downloadCsv(filename, rows) {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

function bindStoreCreate() {
  const button = document.getElementById("stores-create-button");
  if (!button) return;
  button.addEventListener("click", async () => {
    openStoreEditor();
  });
}

function bindStoreImport() {
  const button = document.getElementById("stores-import-button");
  if (!button) return;
  button.addEventListener("click", async () => {
    button.disabled = true;
    button.textContent = "导入中...";
    try {
      await fetchJson("/stores/import/internal", { method: "POST" });
      await hydrateStores();
      alert("店铺主档已导入");
    } catch (error) {
      alert(`导入店铺失败：${error.message}`);
    } finally {
      button.disabled = false;
      button.textContent = "导入店铺主档";
    }
  });
}

function bindReportActions() {
  const createButton = document.getElementById("reports-create-button");
  const refreshButton = document.getElementById("reports-refresh-button");
  const builderPreviewButton = document.getElementById("report-builder-preview-button");
  const builderCreateButton = document.getElementById("report-builder-create-button");
  const builderCloseButton = document.getElementById("report-builder-close-button");
  if (createButton) {
    createButton.addEventListener("click", () => {
      toggleReportBuilder(true);
    });
  }
  if (refreshButton) {
    refreshButton.addEventListener("click", async () => {
      await hydrateReports();
    });
  }
  if (builderPreviewButton) {
    builderPreviewButton.onclick = () => {
      renderReportBuilderPreview();
      previewReportTemplate(document.getElementById("report-builder-type")?.value || "产品评论分析");
    };
  }
  if (builderCreateButton) {
    builderCreateButton.onclick = async () => {
      const payload = buildReportBuilderPayload();
      if (!payload) return;
      try {
        const created = await fetchJson("/reports", { method: "POST", body: JSON.stringify(payload) });
        await hydrateReports();
        renderReportBuilderPreview();
        await previewGeneratedReport(created.id);
      } catch (error) {
        alert(`生成报告失败：${error.message}`);
      }
    };
  }
  if (builderCloseButton) {
    builderCloseButton.onclick = () => toggleReportBuilder(false);
  }
  document.querySelectorAll("#report-builder-section input, #report-builder-section select").forEach((node) => {
    node.addEventListener("change", renderReportBuilderPreview);
    node.addEventListener("input", renderReportBuilderPreview);
  });
  document.getElementById("report-builder-type")?.addEventListener("change", () => {
    syncReportBuilderByType();
    renderReportBuilderPreview();
  });
  if (window.location.hash === "#report-builder-section" || new URLSearchParams(window.location.search).get("title")) {
    toggleReportBuilder(true, document.getElementById("report-builder-type")?.value || "");
  }
}

function promptReviewPayload(source = null) {
  const title = prompt("评论标题", source?.title || "");
  if (title === null) return null;
  return {
    platform: prompt("平台", source?.platform || "Amazon") || "Amazon",
    site_code: prompt("站点代码", reverseLocalizeSite(source?.site) || "US") || "US",
    store_name: prompt("店铺名", source?.store || "") || "",
    asin: prompt("ASIN", source?.asin || "") || "",
    product_title: prompt("产品标题", source?.product || "") || "",
    review_external_id: prompt("评论外部ID", source?.id || "") || "",
    review_url: prompt("评论链接", source?.reviewUrl || "") || "",
    product_url: prompt("产品链接", source?.productUrl || "") || "",
    star_rating: Number(prompt("星级（1-5）", source?.stars || "3") || "3"),
    review_title: title || "",
    review_content: prompt("评论内容", source?.content || "") || "",
    review_images: source?.hasImage ? "image" : "",
    reviewer_name: "Local User",
    review_country: reverseLocalizeSite(source?.site) || "US",
    review_language: "zh",
    is_verified_purchase: true,
    helpful_count: 0,
    has_images: Boolean(source?.hasImage),
    is_negative_review: Number(source?.stars || 3) <= 3,
    issue_category: prompt("问题分类", source?.issue || "待分类") || "待分类",
    sentiment: prompt("情绪（正面/中性/负面）", source?.mood || "中性") || "中性",
    feedback_to_supplier: (prompt("是否反馈供应商（yes/no）", source?.feedback === "已反馈" ? "yes" : "no") || "no") === "yes",
    rectification_status: prompt("整改状态", source?.rectify || "待反馈") || "待反馈",
    source_type: prompt("数据来源", source?.source || "手动录入") || "手动录入",
    reviewed_at: source?.reviewedAt || new Date().toISOString(),
  };
}

function promptTaskPayload(source = null) {
  const taskCode = prompt("任务编号", source?.id || `SR-${Date.now()}`);
  if (!taskCode) return null;
  return {
    task_code: taskCode,
    asin: prompt("ASIN", source?.asin || "") || "",
    product_title: prompt("产品标题", source?.product || "") || "",
    supplier_name: prompt("供应商", source?.supplier || "") || "",
    issue_category: prompt("问题分类", source?.issue || "") || "",
    evidence_summary: prompt("证据摘要", source?.evidence || "") || "",
    status: mapTaskStatusToApi(prompt("状态（待反馈/处理中/观察中/已整改）", source?.status || "待反馈") || "待反馈"),
    priority: mapTaskPriorityToApi(prompt("优先级（高/中/低）", source?.priority || "中") || "中"),
    due_date: prompt("截止日期（YYYY-MM-DD）", source?.due && source.due !== "-" ? source.due : "") || null,
    suggested_action: prompt("建议方案", source?.suggestedAction || "") || "",
    actual_rectification: prompt("实际整改", source?.actualRectification || "") || "",
    notes: "",
  };
}

function taskEditorFields() {
  return [
    { type: "section", label: "基础信息", hint: "任务编号可自动生成；产品、ASIN、问题类型建议明确填全，方便后续评论联动。" },
    { key: "task_code", label: "任务编号", required: true },
    { key: "asin", label: "ASIN", required: true, datalist: "task-asin-options", options: taskAsinOptionValues(), hint: "输入或选择已有 ASIN 后，会自动带出产品标题和供应商。" },
    { key: "product_title", label: "产品标题", full: true, required: true },
    { key: "supplier_name", label: "供应商", datalist: "task-supplier-options", options: supplierOptionValues(), required: true },
    { key: "issue_category", label: "问题类型", type: "select", options: issueOptions(), required: true },
    { key: "evidence_summary", label: "证据摘要", type: "textarea", full: true, hint: "这里建议写评论证据、站点、星级、是否带图等关键信息。" },
    { key: "suggested_action", label: "建议方案", type: "textarea", full: true },
    { key: "actual_rectification", label: "实际整改", type: "textarea", full: true },
    { key: "priority", label: "优先级", type: "select", options: [{ value: "high", label: "高" }, { value: "medium", label: "中" }, { value: "low", label: "低" }], required: true },
    { key: "status", label: "状态", type: "select", options: [{ value: "pending_feedback", label: "待反馈" }, { value: "in_progress", label: "处理中" }, { value: "observing", label: "观察中" }, { value: "resolved", label: "已整改" }], required: true },
    { key: "due_date", label: "截止日期", type: "date", hint: "请直接用日期选择器。" },
    { key: "notes", label: "备注", type: "textarea", full: true },
  ];
}

async function openTaskEditor(source = null) {
  await ensureTaskProductCatalog();
  const values = source ? {
    task_code: source.id || "",
    asin: source.asin || "",
    product_title: source.product || "",
    supplier_name: source.supplier || "",
    issue_category: source.issue || "待分类",
    evidence_summary: source.evidence || "",
    suggested_action: source.suggestedAction || "",
    actual_rectification: source.actualRectification || "",
    priority: source.priority === "高" ? "high" : source.priority === "低" ? "low" : "medium",
    status: mapTaskStatusToApi(source.status || "待反馈"),
    due_date: source.due && source.due !== "-" ? source.due : "",
    notes: "",
  } : {
    task_code: buildTaskCode("", ""),
    asin: "",
    product_title: "",
    supplier_name: "",
    issue_category: "待分类",
    evidence_summary: "",
    suggested_action: "",
    actual_rectification: "",
    priority: "medium",
    status: "pending_feedback",
    due_date: "",
    notes: "",
  };
  openEditorModal({
    title: source ? "编辑整改任务" : "新建整改任务",
    subtitle: "任务新增和修改都使用整表单；任务编号支持按 ASIN 自动生成。",
    fields: taskEditorFields(),
    values,
    onReady: bindTaskEditorInteractions,
    onSubmit: async (formData) => {
      const payload = {
        task_code: formData.task_code || buildTaskCode(formData.asin, formData.issue_category),
        asin: formData.asin || "",
        product_title: formData.product_title || "",
        supplier_name: formData.supplier_name || "",
        issue_category: formData.issue_category || "待分类",
        evidence_summary: formData.evidence_summary || "",
        status: formData.status || "pending_feedback",
        priority: formData.priority || "medium",
        due_date: formData.due_date || null,
        suggested_action: formData.suggested_action || "",
        actual_rectification: formData.actual_rectification || "",
        notes: formData.notes || "",
      };
      if (!payload.asin.trim()) throw new Error("ASIN 不能为空");
      if (!payload.product_title.trim()) throw new Error("产品标题不能为空");
      if (!payload.supplier_name.trim()) throw new Error("供应商不能为空");
      if (source?.recordId) {
        await fetchJson(`/supplier-tasks/${source.recordId}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await fetchJson("/supplier-tasks", { method: "POST", body: JSON.stringify(payload) });
      }
      await hydrateTasks();
    },
  });
}

function bindTaskEditorInteractions() {
  const asinNode = document.querySelector('[data-editor-key="asin"]');
  const issueNode = document.querySelector('[data-editor-key="issue_category"]');
  const codeNode = document.querySelector('[data-editor-key="task_code"]');
  const sync = () => {
    if (codeNode && !codeNode.dataset.userEdited) {
      codeNode.value = buildTaskCode(asinNode?.value || "", issueNode?.value || "");
    }
  };
  const fillProduct = () => {
    const asin = String(asinNode?.value || "").trim();
    const matched = products.find((item) => item.asin === asin);
    if (!matched) return;
    const titleNode = document.querySelector('[data-editor-key="product_title"]');
    const supplierNode = document.querySelector('[data-editor-key="supplier_name"]');
    if (titleNode && !titleNode.value.trim()) titleNode.value = matched.name || "";
    if (supplierNode && !supplierNode.value.trim() && matched.supplier && matched.supplier !== "-") supplierNode.value = matched.supplier;
  };
  codeNode?.addEventListener("input", () => {
    codeNode.dataset.userEdited = codeNode.value.trim() ? "yes" : "";
  });
  asinNode?.addEventListener("input", () => { sync(); fillProduct(); });
  asinNode?.addEventListener("change", fillProduct);
  issueNode?.addEventListener("change", sync);
  sync();
}

function buildTaskCode(asin, issue) {
  const date = new Date().toISOString().slice(2, 10).replaceAll("-", "");
  const shortAsin = String(asin || "TASK").trim().slice(-6) || "TASK";
  return `SR-${date}-${shortAsin}`;
}

function taskAsinOptionValues() {
  return [...new Set(products.map((item) => item.asin).filter(Boolean))].map((value) => ({ value }));
}

async function ensureTaskProductCatalog() {
  if (taskProductCatalogLoaded) return;
  try {
    const data = await fetchJson("/products?limit=300");
    products = (data.items || []).map(mapProductFromApi);
    taskProductCatalogLoaded = true;
  } catch (error) {
    console.warn("Task product catalog unavailable", error);
  }
}

function getRecentGeneratedTaskCodes() {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_TASK_CODES_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function setRecentGeneratedTaskCodes(codes) {
  localStorage.setItem(RECENT_TASK_CODES_KEY, JSON.stringify(codes.slice(0, 20)));
}

function openReviewIssueBatchModal(targetReviews) {
  openEditorModal({
    title: "批量标记问题分类",
    subtitle: "这一步会把当前筛选结果里的评论统一改成同一个问题分类。",
    fields: [
      { key: "issue_category", label: "目标问题分类", type: "select", options: issueOptions(), required: true },
      { key: "preview", label: "将影响的评论", type: "textarea", full: true, readonly: true },
    ],
    values: {
      issue_category: targetReviews[0]?.issue || "待分类",
      preview: targetReviews.slice(0, 20).map((item) => `${item.id} | ${item.product} | ${item.issue} -> 待修改`).join("\n"),
    },
    onSubmit: async (formData) => {
      const nextIssue = formData.issue_category || "待分类";
      for (const review of targetReviews) {
        if (!review.recordId) continue;
        await fetchJson(`/reviews/${review.recordId}`, {
          method: "PUT",
          body: JSON.stringify(reviewPayloadFromForm({
            platform: review.platform,
            site_code: reverseLocalizeSite(review.site),
            store_name: review.store,
            asin: review.asin,
            product_title: review.product,
            review_external_id: review.id,
            star_rating: String(review.stars),
            issue_category: nextIssue,
            sentiment: review.mood,
            feedback_to_supplier: review.feedback === "已反馈" ? "yes" : "no",
            rectification_status: review.rectify,
            review_url: review.reviewUrl || "",
            product_url: review.productUrl || "",
            review_images: review.mediaType === "video" ? "video" : (review.hasImage ? "image" : ""),
            source_type: review.source || "手动录入",
            reviewed_at: review.reviewedAt || new Date().toISOString(),
            review_content: review.content || "",
            review_title: review.title || "",
            review_summary_cn: review.summaryCn || "",
          })),
        });
      }
      await hydrateReviews();
    },
  });
}

function openReviewTaskGenerationModal() {
  const eligible = reviews
    .filter((item) => !("recent_reviews" in item))
    .filter((item) => Number(item.stars || 0) <= 3)
    .filter((item) => item.feedback !== "已反馈");
  if (!eligible.length) {
    alert("当前筛选结果里没有可生成整改任务的差评。");
    return;
  }
  activeTaskGenerationRows = eligible.map((item) => ({ ...item, checked: true }));
  const modal = ensureEditorModal();
  const titleNode = document.getElementById("editor-modal-title");
  const subtitleNode = document.getElementById("editor-modal-subtitle");
  const form = document.getElementById("editor-modal-form");
  if (!form) return;
  if (titleNode) titleNode.textContent = "从评论生成整改任务";
  if (subtitleNode) subtitleNode.textContent = "默认全选当前可生成的差评；可取消个别记录，再批量生成整改任务并同步评论状态。";
  form.innerHTML = `
    <div class="full">
      <table class="modal-table">
        <thead>
          <tr>
            <th><input id="task-gen-check-all" type="checkbox" checked /></th>
            <th>评论</th>
            <th>产品 / ASIN</th>
            <th>站点</th>
            <th>问题分类</th>
            <th>整改状态</th>
          </tr>
        </thead>
        <tbody>
          ${activeTaskGenerationRows.map((item, index) => `
            <tr>
              <td><input type="checkbox" data-task-gen-row="${index}" checked /></td>
              <td><div class="cell-title">${escapeHtml(item.title)}</div><div class="cell-sub">${escapeHtml(item.content)}</div></td>
              <td><div class="cell-title">${escapeHtml(item.product)}</div><div class="cell-sub">${escapeHtml(item.asin)}</div></td>
              <td>${escapeHtml(item.site)}<div class="cell-sub">${escapeHtml(item.store)}</div></td>
              <td>${escapeHtml(item.issue || "待分类")}</td>
              <td>${escapeHtml(item.rectify || "待反馈")}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
  document.getElementById("task-gen-check-all")?.addEventListener("change", (event) => {
    const checked = Boolean(event.target.checked);
    document.querySelectorAll("[data-task-gen-row]").forEach((node) => {
      node.checked = checked;
    });
  });
  activeEditorSubmit = async () => {
    const selected = activeTaskGenerationRows.filter((_, index) => document.querySelector(`[data-task-gen-row="${index}"]`)?.checked);
    if (!selected.length) throw new Error("请至少勾选一条评论");
    const createdCodes = [];
    for (const review of selected) {
      const taskCode = buildTaskCode(review.asin, review.issue);
      const taskPayload = {
        task_code: taskCode,
        asin: review.asin || "",
        product_title: review.product || "",
        supplier_name: review.supplier || "待补供应商",
        issue_category: review.issue || "待分类",
        evidence_summary: `${review.site} / ${review.store} / ${review.stars}星 / ${review.title} / ${review.content}`.slice(0, 300),
        status: "pending_feedback",
        priority: review.stars <= 1 ? "high" : review.stars === 2 ? "medium" : "low",
        due_date: null,
        suggested_action: "",
        actual_rectification: "",
        notes: `来源评论 ${review.id}`,
      };
      await fetchJson("/supplier-tasks", { method: "POST", body: JSON.stringify(taskPayload) });
      createdCodes.push(taskCode);
      if (review.recordId) {
        await fetchJson(`/reviews/${review.recordId}`, {
          method: "PUT",
          body: JSON.stringify({
            platform: review.platform,
            site_code: reverseLocalizeSite(review.site),
            store_name: review.store,
            asin: review.asin,
            product_title: review.product,
            review_external_id: review.id,
            review_url: review.reviewUrl || "",
            product_url: review.productUrl || "",
            star_rating: review.stars,
            review_title: review.title,
            review_content: review.content,
            review_summary_cn: review.summaryCn || "",
            review_images: review.mediaType === "video" ? "video" : (review.hasImage ? "image" : ""),
            reviewer_name: "Local User",
            review_country: reverseLocalizeSite(review.site) || "US",
            review_language: "zh",
            is_verified_purchase: true,
            helpful_count: 0,
            has_images: Boolean(review.hasImage),
            is_negative_review: Number(review.stars) <= 3,
            issue_category: review.issue || "待分类",
            sentiment: review.mood || "负面",
            feedback_to_supplier: true,
            rectification_status: "待反馈",
            source_type: review.source || "手动录入",
            reviewed_at: review.reviewedAt || new Date().toISOString(),
          }),
        });
      }
    }
    await hydrateReviews();
    await hydrateTasks();
    setRecentGeneratedTaskCodes(createdCodes);
    closeEditorModal();
    alert(`已生成 ${selected.length} 条整改任务，并同步更新对应评论状态。现在到整改任务页可直接看到“本次新建”标记。`);
  };
  modal.classList.add("open");
}

function promptAccountPayload(source = null) {
  const email = prompt("邮箱", source?.email || "");
  if (!email) return null;
  return {
    name: prompt("姓名", source?.name || "") || "",
    email,
    role: prompt("角色", source?.role || "只读访客") || "只读访客",
    scope: prompt("可访问范围", source?.scope || "") || "",
    stores: splitTerms(prompt("绑定店铺（逗号/空格分隔）", (source?.stores || []).join(", ")) || ""),
    status: prompt("状态（启用/停用）", source?.status || "启用") || "启用",
    password: prompt("密码（留空则用默认密码）", "") || undefined,
  };
}

function accountEditorFields() {
  return [
    { type: "section", label: "账号信息", hint: "先做轻量账号管理；角色按模块控制，不细化到字段权限。" },
    { key: "name", label: "姓名", required: true },
    { key: "email", label: "邮箱", type: "email", required: true },
    { key: "role", label: "角色", type: "select", options: roles.map((item) => ({ value: item.role, label: item.role })), required: true },
    { key: "scope", label: "可访问范围", full: true, required: true },
    { key: "stores", label: "绑定店铺", type: "textarea", full: true, hint: "支持逗号、空格或换行分隔多个店铺。" },
    { key: "status", label: "状态", type: "select", options: [{ value: "启用", label: "启用" }, { value: "停用", label: "停用" }], required: true },
    { key: "password", label: "初始密码", type: "text", hint: "仅新增时必填；编辑时留空表示不修改密码。" },
  ];
}

function openAccountEditor(source = null) {
  const values = source ? {
    name: source.name || "",
    email: source.email || "",
    role: source.role || "只读访客",
    scope: source.scope || "",
    stores: (source.stores || []).join("\n"),
    status: source.status || "启用",
    password: "",
  } : {
    name: "",
    email: "",
    role: "只读访客",
    scope: "",
    stores: "",
    status: "启用",
    password: "",
  };
  openEditorModal({
    title: source ? "编辑账号" : "新增账号",
    subtitle: "账号新增、修改统一使用整表单；管理员可直接调整角色、范围、绑定店铺和状态。",
    fields: accountEditorFields(),
    values,
    onSubmit: async (formData) => {
      const payload = {
        name: formData.name || "",
        email: formData.email || "",
        role: formData.role || "只读访客",
        scope: formData.scope || "",
        stores: splitTerms(formData.stores || ""),
        status: formData.status || "启用",
      };
      if (!payload.name.trim()) throw new Error("姓名不能为空");
      if (!payload.email.trim()) throw new Error("邮箱不能为空");
      if (!payload.scope.trim()) throw new Error("可访问范围不能为空");
      if (!source || String(formData.password || "").trim()) {
        payload.password = String(formData.password || "").trim() || "ChangeMe123";
      }
      if (source?.recordId) {
        await fetchJson(`/admin/users/${source.recordId}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await fetchJson("/admin/users", { method: "POST", body: JSON.stringify(payload) });
      }
      await hydrateAdminData();
    },
  });
}

function reverseLocalizeSite(site) {
  const entry = Object.entries(siteLabelMap).find(([, label]) => label === site);
  return entry?.[0] || site || "";
}

function stripToNumeric(text) {
  return String(text || "").replace(/,/g, "").replace(/[^\d.-]/g, "");
}

function detectCurrencySymbol(text) {
  if (String(text).includes("£")) return "GBP";
  if (String(text).includes("€")) return "EUR";
  if (String(text).includes("¥")) return "JPY";
  if (String(text).toUpperCase().includes("CA$")) return "CAD";
  if (String(text).includes("₩")) return "KRW";
  return "USD";
}

function mapTaskStatusToApi(label) {
  if (label === "处理中") return "in_progress";
  if (label === "观察中") return "observing";
  if (label === "已整改") return "resolved";
  return "pending_feedback";
}

function mapTaskPriorityToApi(label) {
  if (label === "高") return "high";
  if (label === "低") return "low";
  return "medium";
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
  const dayMap = { "30d": 30, "60d": 60, "90d": 90, "180d": 180, "365d": 365, "1095d": 1095 };
  const days = dayMap[period];
  if (!days) return true;
  const diffMs = Date.now() - timestamp;
  return diffMs <= days * 24 * 60 * 60 * 1000;
}

function mapProductFromApi(item) {
  return {
    recordId: item.id,
    tone: "tone-1",
    name: item.title || "未命名产品",
    localizedTitle: item.localized_title || "",
    localizedTitleAuto: Boolean(item.localized_title),
    asin: item.asin || "-",
    parentAsin: item.parent_asin || "-",
    sku: item.sku || item.department_item_no || "-",
    store: item.store_name || "未识别店铺",
    site: localizeSite(item.site_code),
    platform: item.platform || "-",
    brand: item.brand || "",
    imageUrl: isExternalUrl(item.image_url) ? item.image_url : "",
    category: item.category_name || item.category_path || "-",
    productUrl: isExternalUrl(item.product_url) ? item.product_url : "",
    price: formatPriceWithCurrency(item.price_amount, item.price_currency),
    sales: item.monthly_sales ?? "-",
    salesAmount: formatPriceWithCurrency(item.monthly_revenue, item.price_currency),
    reviews: item.review_count ?? "-",
    newReviews: "-",
    rating: item.rating ?? "-",
    imageReviews: "-",
    variantCount: item.variation_count ?? "-",
    keywords: [item.keyword_total, item.keyword_organic, item.keyword_ads].filter((value) => value !== null && value !== undefined).join(" / ") || "-",
    bsr: [item.bsr_main ? `大类 ${item.bsr_main}` : "", item.bsr_sub ? `小类 ${item.bsr_sub}` : ""].filter(Boolean).join(" / ") || "-",
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
    updatedAt: item.updated_at || "",
    availableFields: item.data_completeness?.available_fields ?? 0,
    trackedFields: item.data_completeness?.tracked_fields ?? 0,
    dataSource: item.data_completeness?.source || item.source_file || "待补来源",
  };
}

function mapStoreFromApi(item) {
  return {
    recordId: item.id,
    name: item.name || "未命名店铺",
    platform: item.platform || "-",
    site: localizeSite(item.site_code),
    seller: item.seller_identifier || "-",
    products: "-",
    reviews: "-",
    rating: "-",
    status: getStoreStatusLabel(item.status, item.is_enabled),
    rawStatus: item.status || (item.is_enabled ? "active" : "paused"),
    sync: item.updated_at || "-",
    storePageUrl: item.store_page_url || "",
    countryCode: item.country_code || "",
    dataSource: item.data_source || "",
    notes: item.notes || "",
    enabled: Boolean(item.is_enabled),
  };
}

function mapReviewFromApi(item) {
  return {
    recordId: item.id,
    tone: "tone-1",
    id: item.review_external_id || `RV-${item.id || "N/A"}`,
    title: item.review_title || "无标题评论",
    summaryCn: item.review_summary_cn || "",
    product: item.product_title || "未命名产品",
    store: item.store_name || "未识别店铺",
    site: localizeSite(item.site_code),
    platform: item.platform || "-",
    stars: item.star_rating || 3,
    hasImage: Boolean(item.has_images || item.review_images),
    mediaType: String(item.review_images || "").toLowerCase().includes("video") ? "video" : (item.has_images ? "image" : "none"),
    reviewUrl: isExternalUrl(item.review_url) ? item.review_url : "",
    productUrl: isExternalUrl(item.product_url) ? item.product_url : "",
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
    asin: item.asin || "",
    sku: item.sku || "",
    sales: item.recent_sales ?? "-",
    salesAmountValue: item.recent_revenue ?? null,
    currency: item.price_currency || "",
    salesAmount: item.recent_revenue ? `${item.price_currency || ""}${item.recent_revenue}` : "-",
    score: item.rating ?? "-",
    negative: item.negative_ratio,
    volume: item.review_total ?? item.review_count ?? 0,
    imageReviews: item.image_review_total ?? "-",
    top3: item.top_issue_summary || (item.review_data_status === "missing" ? "待导入真实评论" : "暂无问题分类"),
    reviewDataStatus: item.review_data_status || "missing",
    action: item.buybox_seller ? `关注 ${item.buybox_seller}` : "待生成建议动作",
  };
}

function mapTaskFromApi(item) {
  return {
    recordId: item.id,
    id: item.task_code || `SR-${item.id}`,
    asin: item.asin || "",
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

function mapReportFromApi(item) {
  return {
    recordId: item.id,
    name: item.title || "未命名报告",
    type: item.report_type || "-",
    range: item.scope || "全部",
    time: item.created_at || "-",
    status: item.status === "generated" ? "可导出" : item.status || "-",
  };
}
