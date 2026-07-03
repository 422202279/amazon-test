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

const products = [
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

const reviews = [
  { tone: "tone-1", id: "RV-10021", title: "坐两天就塌了", product: "记忆棉人体工学坐垫", store: "US Home Store", site: "美国", platform: "Amazon", stars: 2, hasImage: true, mediaType: "image", reviewUrl: "https://www.amazon.com/product-reviews/B0DXSEAT01", productUrl: "https://www.amazon.com/dp/B0DXSEAT01", content: "刚开始还可以，坐了几天中间明显塌陷，尾椎支撑不够，和图片有差距。", issue: "质量问题", mood: "负面", feedback: "未反馈", rectify: "待反馈", source: "页面补抓", asin: "B0DXSEAT01" },
  { tone: "tone-2", id: "RV-10022", title: "杯盖还是会漏", product: "防漏便携咖啡杯", store: "UK Living", site: "英国", platform: "Amazon", stars: 3, hasImage: true, mediaType: "video", reviewUrl: "https://www.amazon.co.uk/product-reviews/B0DXMUG889", productUrl: "https://www.amazon.co.uk/dp/B0DXMUG889", content: "保温不错，但背包里横放后杯盖附近还是会渗水，不适合通勤。", issue: "使用效果差", mood: "中性", feedback: "已反馈", rectify: "处理中", source: "导入", asin: "B0DXMUG889" },
  { tone: "tone-3", id: "RV-10023", title: "颜色掉漆", product: "不锈钢保温杯 900ml", store: "DE Ordnung", site: "德国", platform: "Amazon", stars: 1, hasImage: true, mediaType: "image", reviewUrl: "https://www.amazon.de/product-reviews/B0DXTHERM7", productUrl: "https://www.amazon.de/dp/B0DXTHERM7", content: "用了不到一周表面开始掉色，图片里看着很高级，实物做工一般。", issue: "掉色", mood: "负面", feedback: "未反馈", rectify: "待反馈", source: "页面补抓", asin: "B0DXTHERM7" },
  { tone: "tone-4", id: "RV-10024", title: "有点味道", product: "瑜伽垫加厚防滑款", store: "JP Kitchen", site: "日本", platform: "Amazon", stars: 2, hasImage: false, mediaType: "none", reviewUrl: "https://www.amazon.co.jp/product-reviews/B0DXYOGA88", productUrl: "https://www.amazon.co.jp/dp/B0DXYOGA88", content: "打开包装后味道比较大，晾了两天才敢使用，厚度尚可。", issue: "异味", mood: "负面", feedback: "已反馈", rectify: "观察中", source: "人工修正", asin: "B0DXYOGA88" },
  { tone: "tone-5", id: "RV-10025", title: "灯光柔和", product: "化妆镜带灯便携折叠款", store: "CA Comfort", site: "加拿大", platform: "Amazon", stars: 5, hasImage: true, mediaType: "image", reviewUrl: "https://www.amazon.ca/product-reviews/B0DXMIRROR", productUrl: "https://www.amazon.ca/dp/B0DXMIRROR", content: "灯光很自然，出差带着方便，折叠后不占地方，充一次电能用很久。", issue: "其他", mood: "正面", feedback: "无需反馈", rectify: "已关闭", source: "导入", asin: "B0DXMIRROR" },
  { tone: "tone-6", id: "RV-10026", title: "尺寸偏小", product: "记忆棉人体工学坐垫", store: "Coupang Seoul", site: "韩国", platform: "Coupang", stars: 2, hasImage: true, mediaType: "video", reviewUrl: "https://www.amazon.com/product-reviews/B0DXSEAT01", productUrl: "https://www.amazon.com/dp/B0DXSEAT01", content: "看图以为会更宽，放在办公室椅子上略小，长时间坐不太稳。", issue: "尺寸问题", mood: "负面", feedback: "已反馈", rectify: "处理中", source: "人工修正", asin: "B0DXSEAT01" }
];

const comparisonData = [
  { store: "US Home Store", site: "美国", sales: 642, salesAmount: "$19,253", score: 4.1, negative: 8.6, volume: 1284, imageReviews: 93, top3: "坐感塌陷 / 尺寸偏小 / 回弹慢", action: "调整内芯密度与文案说明" },
  { store: "UK Living", site: "英国", sales: 411, salesAmount: "£7,768", score: 4.3, negative: 5.1, volume: 816, imageReviews: 48, top3: "尺寸偏小 / 包装褶皱 / 回弹慢", action: "优化尺寸图与包装说明" },
  { store: "DE Ordnung", site: "德国", sales: 372, salesAmount: "€8,742", score: 3.8, negative: 11.9, volume: 604, imageReviews: 52, top3: "坐感塌陷 / 描述不符 / 物流破损", action: "排查批次与物流包装" },
  { store: "Coupang Seoul", site: "韩国", sales: 295, salesAmount: "₩8,410,000", score: 4.0, negative: 7.4, volume: 472, imageReviews: 37, top3: "尺寸偏小 / 坐感偏硬 / 缝线粗糙", action: "本地化尺寸说明，抽检缝线" }
];

const tasks = [
  { id: "SR-2048", product: "记忆棉人体工学坐垫", supplier: "宁波舒垫工厂", issue: "质量问题", evidence: "12 条差评指向坐感塌陷，含 7 条带图", priority: "高", status: "处理中", due: "2026-07-08" },
  { id: "SR-2049", product: "防漏便携咖啡杯", supplier: "厦门啡行", issue: "使用效果差", evidence: "5 条评论反馈杯盖横放渗水", priority: "中", status: "待反馈", due: "2026-07-06" },
  { id: "SR-2050", product: "不锈钢保温杯 900ml", supplier: "永康饮具厂", issue: "掉色", evidence: "德国站 4 条 1 星评论附图", priority: "高", status: "待反馈", due: "2026-07-05" },
  { id: "SR-2051", product: "瑜伽垫加厚防滑款", supplier: "南通健身材", issue: "异味", evidence: "日本站 6 条差评集中在拆封异味", priority: "中", status: "观察中", due: "2026-07-12" },
  { id: "SR-2052", product: "化妆镜带灯便携折叠款", supplier: "深圳美妆科技", issue: "电池续航", evidence: "已完成电池批次替换验证", priority: "低", status: "已整改", due: "2026-06-28" }
];

const reports = [
  { name: "记忆棉坐垫评论分析报告", type: "产品评论分析", range: "US / UK / DE / KR", time: "2026-07-02 10:30", status: "最新" },
  { name: "多店铺坐垫差评归因对比", type: "多店铺对比", range: "4 店铺同款产品", time: "2026-07-01 18:20", status: "已归档" },
  { name: "6 月供应商整改建议汇总", type: "供应商建议", range: "8 个产品 / 5 家供应商", time: "2026-06-30 17:00", status: "可导出" },
  { name: "北美站购物车异常报告", type: "风险报告", range: "美国 / 加拿大", time: "2026-06-29 09:40", status: "待复核" }
];

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
  head.innerHTML = visibleColumns.map((column) => `<th data-col="${column.key}">${column.label}</th>`).join("");

  body.innerHTML = products.map((item) => `
    <tr>
      ${visibleColumns.map((column) => `<td data-col="${column.key}">${renderProductCell(item, column.key)}</td>`).join("")}
    </tr>
  `).join("");
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
  body.innerHTML = reviews.map((review) => `
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
      <td><span class="status ${statusClass(review.feedback)}">${review.feedback}</span></td>
      <td><span class="status ${statusClass(review.rectify)}">${review.rectify}</span></td>
    </tr>
  `).join("");
}

function renderComparison() {
  const cards = document.getElementById("comparison-cards");
  const scoreBars = document.getElementById("comparison-score-bars");
  const negativeBars = document.getElementById("comparison-negative-bars");
  const volumeBars = document.getElementById("comparison-volume-bars");
  const issueGrid = document.getElementById("comparison-issue-grid");
  const table = document.getElementById("comparison-table");
  if (!cards || !scoreBars || !negativeBars || !volumeBars || !issueGrid || !table) return;

  cards.innerHTML = comparisonData.map((item, index) => `
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

  const maxVolume = Math.max(...comparisonData.map((i) => i.volume));
  scoreBars.innerHTML = comparisonData.map((item) => `
    <div class="bar-item"><span>${item.store}</span><div><i style="width:${item.score * 20}%"></i></div><strong>${item.score}</strong></div>
  `).join("");
  negativeBars.innerHTML = comparisonData.map((item) => `
    <div class="bar-item"><span>${item.store}</span><div><i style="width:${item.negative * 7}%"></i></div><strong>${item.negative}%</strong></div>
  `).join("");
  volumeBars.innerHTML = comparisonData.map((item) => `
    <div class="bar-item"><span>${item.store}</span><div><i style="width:${(item.volume / maxVolume) * 100}%"></i></div><strong>${item.volume}</strong></div>
  `).join("");
  issueGrid.innerHTML = [
    ["坐感塌陷", "3 店铺共同出现"],
    ["尺寸偏小", "US / UK / KR"],
    ["回弹慢", "US / UK"],
    ["物流破损", "仅 DE 站集中"],
  ].map(([issue, note]) => `<div class="issue-pill"><strong>${issue}</strong><span>${note}</span></div>`).join("");

  table.innerHTML = comparisonData.map((item) => `
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
});
