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
  { tone: "tone-1", name: "记忆棉人体工学坐垫", asin: "B0DXSEAT01", sku: "CUS-01-US", store: "US Home Store", site: "美国", platform: "Amazon", category: "Home & Kitchen", price: "$29.99", sales: 642, reviews: 1284, rating: 4.1, imageReviews: 93, keywords: "seat cushion / office cushion", bsr: "#1,248 / #13", dimensions: "45 x 35 x 7 cm / 1.1 kg", sellerCount: 2, buybox: "异常", negative: "12 条", issue: "坐感塌陷 / 尺寸偏小", supplier: "宁波舒垫工厂", rectify: "处理中" },
  { tone: "tone-2", name: "防漏便携咖啡杯", asin: "B0DXMUG889", sku: "MUG-02-UK", store: "UK Living", site: "英国", platform: "Amazon", category: "Kitchen & Dining", price: "£18.90", sales: 411, reviews: 986, rating: 4.3, imageReviews: 54, keywords: "travel mug / leak proof mug", bsr: "#2,904 / #41", dimensions: "510 ml / 370 g", sellerCount: 1, buybox: "正常", negative: "4 条", issue: "漏水 / 杯盖卡扣", supplier: "厦门啡行", rectify: "观察中" },
  { tone: "tone-3", name: "不锈钢保温杯 900ml", asin: "B0DXTHERM7", sku: "BOT-09-DE", store: "DE Ordnung", site: "德国", platform: "Amazon", category: "Sports & Outdoors", price: "€23.50", sales: 372, reviews: 744, rating: 3.9, imageReviews: 48, keywords: "thermo bottle / trinkflasche", bsr: "#4,512 / #67", dimensions: "900 ml / 420 g", sellerCount: 3, buybox: "正常", negative: "9 条", issue: "保温差 / 涂层掉色", supplier: "永康饮具厂", rectify: "待反馈" },
  { tone: "tone-4", name: "瑜伽垫加厚防滑款", asin: "B0DXYOGA88", sku: "YOG-07-JP", store: "JP Kitchen", site: "日本", platform: "Amazon", category: "Sports & Fitness", price: "¥3,980", sales: 298, reviews: 522, rating: 4.0, imageReviews: 60, keywords: "yoga mat / ストレッチマット", bsr: "#3,220 / #28", dimensions: "183 x 61 x 1 cm / 880 g", sellerCount: 1, buybox: "正常", negative: "6 条", issue: "异味 / 边缘卷曲", supplier: "南通健身材", rectify: "处理中" },
  { tone: "tone-5", name: "化妆镜带灯便携折叠款", asin: "B0DXMIRROR", sku: "MIR-11-US", store: "CA Comfort", site: "加拿大", platform: "Amazon", category: "Beauty & Personal Care", price: "CA$25.00", sales: 221, reviews: 448, rating: 4.5, imageReviews: 51, keywords: "makeup mirror / led mirror", bsr: "#1,987 / #22", dimensions: "18 x 13 x 3 cm / 520 g", sellerCount: 1, buybox: "正常", negative: "2 条", issue: "电池续航", supplier: "深圳美妆科技", rectify: "已整改" }
];

const productColumns = [
  { key: "product", label: "产品", locked: true },
  { key: "store", label: "店铺 / 站点", locked: true },
  { key: "platform", label: "平台" },
  { key: "category", label: "类目" },
  { key: "price", label: "价格" },
  { key: "sales", label: "近30天销量" },
  { key: "reviews", label: "Review总数" },
  { key: "rating", label: "评分" },
  { key: "keywords", label: "关键词" },
  { key: "bsr", label: "BSR" },
  { key: "dimensions", label: "尺寸 / 重量" },
  { key: "sellerCount", label: "跟卖卖家" },
  { key: "buybox", label: "购物车" },
  { key: "negative", label: "新增差评" },
  { key: "issue", label: "主要差评原因" },
  { key: "supplier", label: "供应商" },
  { key: "rectify", label: "整改状态" }
];

const reviews = [
  { tone: "tone-1", id: "RV-10021", title: "坐两天就塌了", product: "记忆棉人体工学坐垫", store: "US Home Store", site: "美国", platform: "Amazon", stars: 2, hasImage: true, content: "刚开始还可以，坐了几天中间明显塌陷，尾椎支撑不够，和图片有差距。", issue: "质量问题", mood: "负面", feedback: "未反馈", rectify: "待反馈", asin: "B0DXSEAT01" },
  { tone: "tone-2", id: "RV-10022", title: "杯盖还是会漏", product: "防漏便携咖啡杯", store: "UK Living", site: "英国", platform: "Amazon", stars: 3, hasImage: true, content: "保温不错，但背包里横放后杯盖附近还是会渗水，不适合通勤。", issue: "使用效果差", mood: "中性", feedback: "已反馈", rectify: "处理中", asin: "B0DXMUG889" },
  { tone: "tone-3", id: "RV-10023", title: "颜色掉漆", product: "不锈钢保温杯 900ml", store: "DE Ordnung", site: "德国", platform: "Amazon", stars: 1, hasImage: true, content: "用了不到一周表面开始掉色，图片里看着很高级，实物做工一般。", issue: "掉色", mood: "负面", feedback: "未反馈", rectify: "待反馈", asin: "B0DXTHERM7" },
  { tone: "tone-4", id: "RV-10024", title: "有点味道", product: "瑜伽垫加厚防滑款", store: "JP Kitchen", site: "日本", platform: "Amazon", stars: 2, hasImage: false, content: "打开包装后味道比较大，晾了两天才敢使用，厚度尚可。", issue: "异味", mood: "负面", feedback: "已反馈", rectify: "观察中", asin: "B0DXYOGA88" },
  { tone: "tone-5", id: "RV-10025", title: "灯光柔和", product: "化妆镜带灯便携折叠款", store: "CA Comfort", site: "加拿大", platform: "Amazon", stars: 5, hasImage: true, content: "灯光很自然，出差带着方便，折叠后不占地方，充一次电能用很久。", issue: "其他", mood: "正面", feedback: "无需反馈", rectify: "已关闭", asin: "B0DXMIRROR" },
  { tone: "tone-6", id: "RV-10026", title: "尺寸偏小", product: "记忆棉人体工学坐垫", store: "Coupang Seoul", site: "韩国", platform: "Coupang", stars: 2, hasImage: true, content: "看图以为会更宽，放在办公室椅子上略小，长时间坐不太稳。", issue: "尺寸问题", mood: "负面", feedback: "已反馈", rectify: "处理中", asin: "B0DXSEAT01" }
];

const comparisonData = [
  { store: "US Home Store", site: "美国", score: 4.1, negative: 8.6, volume: 1284, imageReviews: 93, top3: "坐感塌陷 / 尺寸偏小 / 回弹慢", action: "调整内芯密度与文案说明" },
  { store: "UK Living", site: "英国", score: 4.3, negative: 5.1, volume: 816, imageReviews: 48, top3: "尺寸偏小 / 包装褶皱 / 回弹慢", action: "优化尺寸图与包装说明" },
  { store: "DE Ordnung", site: "德国", score: 3.8, negative: 11.9, volume: 604, imageReviews: 52, top3: "坐感塌陷 / 描述不符 / 物流破损", action: "排查批次与物流包装" },
  { store: "Coupang Seoul", site: "韩国", score: 4.0, negative: 7.4, volume: 472, imageReviews: 37, top3: "尺寸偏小 / 坐感偏硬 / 缝线粗糙", action: "本地化尺寸说明，抽检缝线" }
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
      <div class="thumb-strip">${review.hasImage ? thumbs(3) : '<span class="cell-sub">无图片</span>'}</div>
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
  if (!body) return;
  body.innerHTML = products.map((item) => `
    <tr>
      <td data-col="product">
        <div class="product-cell">
          <span class="thumb ${item.tone}"></span>
          <div>
            <span class="cell-title">${item.name}</span>
            <span class="cell-sub">${item.asin} · ${item.sku}</span>
          </div>
        </div>
      </td>
      <td data-col="store">${item.store}<span class="cell-sub">${item.site}</span></td>
      <td data-col="platform">${item.platform}</td>
      <td data-col="category">${item.category}</td>
      <td data-col="price">${item.price}</td>
      <td data-col="sales">${item.sales}</td>
      <td data-col="reviews">${item.reviews}</td>
      <td data-col="rating">${item.rating}<span class="cell-sub">带图 ${item.imageReviews}</span></td>
      <td data-col="keywords">${item.keywords}</td>
      <td data-col="bsr">${item.bsr}</td>
      <td data-col="dimensions">${item.dimensions}</td>
      <td data-col="sellerCount">${item.sellerCount}</td>
      <td data-col="buybox"><span class="status ${item.buybox === "正常" ? "success" : "danger"}">${item.buybox}</span></td>
      <td data-col="negative"><span class="chip ${item.negative === "2 条" ? "neutral" : "danger"}">${item.negative}</span></td>
      <td data-col="issue">${item.issue}</td>
      <td data-col="supplier">${item.supplier}</td>
      <td data-col="rectify"><span class="status ${statusClass(item.rectify)}">${item.rectify}</span></td>
    </tr>
  `).join("");
}

function renderProductColumnPicker() {
  const container = document.getElementById("product-column-options");
  const picker = document.getElementById("product-column-picker");
  const toggle = document.getElementById("toggle-product-columns");
  if (!container || !picker || !toggle) return;

  container.innerHTML = productColumns.map((column) => `
    <label class="column-option">
      <input type="checkbox" data-column="${column.key}" ${column.locked ? "checked disabled" : "checked"} />
      <span>${column.label}</span>
    </label>
  `).join("");

  toggle.addEventListener("click", () => {
    picker.classList.toggle("hidden");
  });

  container.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    const key = target.dataset.column;
    if (!key) return;
    document.querySelectorAll(`[data-col="${key}"]`).forEach((node) => {
      node.style.display = target.checked ? "" : "none";
    });
  });
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
      <td>${review.hasImage ? `<div class="thumb-strip">${thumbs(3)}</div>` : '<span class="cell-sub">无图</span>'}</td>
      <td>${review.content}</td>
      <td><a class="link-inline" href="#">产品链接</a><span class="cell-sub"><a class="link-inline" href="#">评论链接</a></span></td>
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
        <div><span class="cell-sub">评分</span><strong>${item.score}</strong></div>
        <div><span class="cell-sub">差评占比</span><strong>${item.negative}%</strong></div>
        <div><span class="cell-sub">带图评论</span><strong>${item.imageReviews}</strong></div>
        <div><span class="cell-sub">评论总数</span><strong>${item.volume}</strong></div>
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
      <td>${item.score}</td>
      <td>${item.negative}%</td>
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
      <div class="thumb-strip">${review.hasImage ? thumbs(3) : '<span class="cell-sub">无图片</span>'}</div>
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
