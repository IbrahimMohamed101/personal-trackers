const DESKTOP_NAV_SECTIONS=[
  {label:'الرئيسية',items:[{page:'home',icon:'⬡',label:'لوحة القيادة',active:true}]},
  {
    label:'التتبع',
    items:[
      {page:'tasks',icon:'✅',label:'المهام اليومية'},
      {page:'habits',icon:'◎',label:'العادات اليومية'},
      {page:'money',icon:'◈',label:'المصاريف والتحويش'},
      {page:'problems',icon:'◫',label:'إدارة المشاكل'},
      {page:'journal',icon:'📝',label:'اليومية'},
      {page:'analytics',icon:'📊',label:'التحليلات'},
    ],
  },
  {
    label:'التخطيط',
    items:[
      {page:'goals',icon:'◬',label:'أهداف ٣ شهور'},
      {page:'weekly',icon:'◧',label:'المراجعة الأسبوعية'},
    ],
  },
  {
    label:'التطوير',
    items:[
      {page:'pomodoro',icon:'◴',label:'مؤقت بومودورو'},
      {page:'achievements',icon:'🏆',label:'الإنجازات'},
      {page:'guide',icon:'💡',label:'دليل التطور'},
      {page:'tips',icon:'✦',label:'مكتبة النصائح',badge:'١٢'},
      {page:'settings',icon:'⚙',label:'الإعدادات'},
      {page:'admin',icon:'🛡',label:'لوحة التحكم',adminOnly:true},
    ],
  },
];

const MOBILE_NAV_ITEMS=[
  {page:'home',icon:'⬡',label:'الرئيسية',active:true},
  {page:'tasks',icon:'✅',label:'المهام'},
  {page:'habits',icon:'◎',label:'العادات'},
  {page:'money',icon:'◈',label:'المال'},
  {page:'problems',icon:'◫',label:'المشاكل'},
  {page:'journal',icon:'📝',label:'اليومية'},
  {page:'analytics',icon:'📊',label:'تحليلات'},
  {page:'goals',icon:'◬',label:'الأهداف'},
  {page:'weekly',icon:'◧',label:'الأسبوعي'},
  {page:'pomodoro',icon:'◴',label:'بومودورو'},
  {page:'achievements',icon:'🏆',label:'الإنجازات'},
  {page:'guide',icon:'💡',label:'دليل التطور'},
  {page:'tips',icon:'✦',label:'النصائح'},
  {page:'settings',icon:'⚙',label:'الإعدادات'},
  {page:'admin',icon:'🛡',label:'لوحة التحكم',adminOnly:true},
];

function renderDesktopNavItem(item){
  const hiddenClass=item.adminOnly?' hidden':'';
  const adminAttr=item.adminOnly?' data-admin-only="true"':'';
  return `<div class="nav-item ${item.active?'active':''}${hiddenClass}" data-page="${item.page}"${adminAttr} onclick="goPage('${item.page}')"><span class="nav-icon">${item.icon}</span> ${item.label}${item.badge?` <span class="nav-badge">${item.badge}</span>`:''}</div>`;
}

function renderDesktopNavSection(section,index){
  const content=[`<div class="nav-label">${section.label}</div>`,section.items.map(renderDesktopNavItem).join('')];
  if(index<DESKTOP_NAV_SECTIONS.length-1)content.push('<div class="nav-sep"></div>');
  return content.join('');
}

function renderXpWidget(){
  return `<div class="xp-widget">
    <div class="xp-widget-head">
      <div class="xp-widget-title" id="xp-level-title">المستوى ١ ✦</div>
      <div class="xp-widget-num" id="xp-level-mini">٠ / ٢٠٠</div>
    </div>
    <div class="prog-wrap xp-prog"><div class="prog-fill prog-gold" id="xp-bar" style="width:0%"></div></div>
    <div class="xp-widget-sub" id="xp-challenge-mini">لا يوجد تحدي أسبوعي بعد</div>
  </div>`;
}

function renderAuthPanel(variant='sidebar'){
  const panelClass=variant==='gate'?' auth-panel-gate':variant==='sidebar'?' auth-panel-compact':'';
  const title=variant==='gate'?'دخول الحساب':'الحساب';
  return `<div class="auth-panel${panelClass}" data-auth-panel data-auth-variant="${variant}">
    <div class="auth-status">
      <div class="auth-status-copy">
        <div class="auth-title">${title}</div>
        <div class="auth-subtitle" data-auth-subtitle>أنشئي حسابًا جديدًا أو سجلي الدخول للمتابعة.</div>
      </div>
      <div class="chip auth-status-chip chip-amber" data-auth-status-chip>غير مسجل</div>
    </div>
    <div class="auth-user-meta hidden" data-auth-user-meta>
      <div class="auth-user-label">البريد الحالي</div>
      <div class="auth-user-email" data-auth-user-email>—</div>
    </div>
    <div class="auth-form" data-auth-form>
      <input class="inp auth-input" type="email" placeholder="البريد الإلكتروني" autocomplete="email" data-auth-input="email">
      <input class="inp auth-input" type="password" placeholder="كلمة المرور" autocomplete="current-password" data-auth-input="password">
    </div>
    <div class="auth-actions auth-actions-guest" data-auth-guest-actions>
      <button class="btn btn-primary btn-sm" type="button" onclick="handleAuthRegister(this)" data-auth-register>إنشاء حساب</button>
      <button class="btn btn-ghost btn-sm" type="button" onclick="handleAuthLogin(this)" data-auth-login>دخول</button>
    </div>
    <div class="auth-secondary-actions" data-auth-secondary-actions>
      <button class="auth-link-btn" type="button" onclick="handlePasswordReset(this)" data-auth-reset>نسيت كلمة المرور؟</button>
    </div>
    <div class="auth-actions auth-actions-authenticated hidden" data-auth-authenticated-actions>
      <button class="btn btn-ghost btn-sm" type="button" onclick="handleAuthLogout(this)" data-auth-logout>تسجيل الخروج</button>
    </div>
    <div class="auth-message hidden" data-auth-message aria-live="polite"></div>
  </div>`;
}

function renderAuthGate(){
  return `<section class="auth-gate hidden" id="auth-gate" aria-hidden="true">
    <div class="auth-gate-shell">
      <div class="auth-gate-hero">
        <div class="auth-gate-brand">Sama OS</div>
        <h1 class="auth-gate-title">نظامك الشخصي للتركيز والتنظيم</h1>
        <p class="auth-gate-copy">مساحة واحدة للمهام والعادات والمصاريف واليوميات، بهدوء ووضوح ومن غير أي تشتيت قبل تسجيل الدخول.</p>
      </div>
      <div class="auth-gate-card">
        ${renderAuthPanel('gate')}
      </div>
    </div>
  </section>`;
}

function renderDesktopSidebar(){
  return `<nav class="sidebar">
  <div class="sidebar-logo">
    <div class="logo-mark">Sama OS</div>
    <div class="logo-sub">نظامك الشخصي</div>
  </div>
  <div class="sidebar-date">
    <strong id="s-date">—</strong>
    <span id="s-time">—</span>
  </div>
  <div class="sidebar-sync">
    <div class="sync-indicator syncing" id="sync-indicator"><span class="sync-dot"></span><span id="sync-text">syncing...</span></div>
  </div>
  <div class="nav-section">
    ${DESKTOP_NAV_SECTIONS.map(renderDesktopNavSection).join('')}
  </div>
  <div class="energy-widget">
    <div class="ew-label">طاقتك اليوم</div>
    <div class="ew-row">
      <div class="ew-num" id="ew-num">5</div>
      <div class="ew-track"><input type="range" min="1" max="10" value="5" id="energy-rng" oninput="setEnergy(this.value)"></div>
    </div>
    <div class="ew-desc" id="ew-desc">طاقة متوسطة — خطوات صغيرة</div>
  </div>
  ${renderXpWidget()}
</nav>`;
}

function renderMobileNavItem(item){
  const hiddenClass=item.adminOnly?' hidden':'';
  const adminAttr=item.adminOnly?' data-admin-only="true"':'';
  return `<button class="mobile-nav-btn ${item.active?'active':''}${hiddenClass}" data-page="${item.page}"${adminAttr} onclick="goPage('${item.page}')"><span class="mobile-nav-icon">${item.icon}</span><span>${item.label}</span></button>`;
}

function renderMobileShell(){
  return `<div class="mobile-shell">
    <div class="mobile-topbar">
      <div>
        <div class="mobile-brand">Sama OS</div>
        <div class="mobile-caption">نظامك الشخصي</div>
      </div>
      <div class="mobile-side-meta">
        <div class="mobile-energy">الطاقة <strong id="m-energy-mini">٥/١٠</strong></div>
        <div class="mobile-clock">
          <strong id="m-date">—</strong>
          <span id="m-time">—</span>
        </div>
        <div class="sync-indicator syncing mobile-sync" id="sync-indicator-mobile"><span class="sync-dot"></span><span id="sync-text-mobile">syncing...</span></div>
      </div>
      <div class="mobile-xp-widget">
        <div class="mobile-xp-top"><span id="m-xp-level">المستوى ١ ✦</span><span id="m-xp-mini">٠/٢٠٠</span></div>
        <div class="prog-wrap xp-prog"><div class="prog-fill prog-gold" id="m-xp-bar" style="width:0%"></div></div>
      </div>
    </div>
    <div class="mobile-nav" aria-label="أقسام النظام">
      <div class="mobile-nav-track">
        ${MOBILE_NAV_ITEMS.map(renderMobileNavItem).join('')}
      </div>
    </div>
  </div>`;
}

function renderDailyBrief(){
  return `<div class="daily-brief stagger-item">
    <div class="db-main">
      <div class="db-greeting">
        <h2 id="home-greeting">مرحباً يا سما ✨</h2>
        <p id="home-sub">جاهزة تبدأي يومك بهدوء؟</p>
      </div>
      <div class="db-xp-progress">
        <div class="db-xp-label"><span id="m-xp-level">المستوى ١</span> <span class="gold-text" id="m-xp-mini">٠/٢٠٠ XP</span></div>
        <div class="prog-wrap"><div class="prog-fill prog-gold" id="home-xp-bar" style="width:0%"></div></div>
      </div>
    </div>
    <div class="db-stats-mini">
      <div class="db-stat-item"><span class="db-stat-icon">🔥</span> <span id="stat-streak-mini">٠</span> يوم</div>
      <div class="db-stat-item"><span class="db-stat-icon">💰</span> <span id="stat-savings-mini">٠</span> ₽</div>
      <div class="db-stat-item"><span class="db-stat-icon">✅</span> <span id="stat-habits-mini">٠٪</span></div>
    </div>
  </div>`;
}

function renderQuickActions(){
  return `<div class="quick-actions stagger-item">
    <button class="qa-btn" onclick="openExpenseModal()">
      <div class="qa-icon">💸</div>
      <span>سجل مصروف</span>
    </button>
    <button class="qa-btn" onclick="goPage('journal')">
      <div class="qa-icon">📝</div>
      <span>اكتب يومية</span>
    </button>
    <button class="qa-btn" onclick="goPage('tasks')">
      <div class="qa-icon">✅</div>
      <span>أضف مهمة</span>
    </button>
    <button class="qa-btn" onclick="goPage('pomodoro')">
      <div class="qa-icon">⏱️</div>
      <span>بومودورو</span>
    </button>
  </div>`;
}

function renderHomePage(){
  return `<div class="page active" id="page-home">
  <div class="home-layout">
    <div class="page-tools dashboard-top-tools">
        <button class="btn btn-ghost btn-sm" onclick="exportExpensesCsv()">📤 تصدير CSV</button>
        <div class="live-status"><span class="live-dot"></span><span style="font-size:11px;color:var(--text2)">متصل</span></div>
    </div>
    
    ${renderDailyBrief()}
    
    <div class="section-label stagger-item">الوصول السريع</div>
    ${renderQuickActions()}

    <div class="section-label stagger-item">لوحة حياتك</div>
    <div class="life-board stagger-item">
      <div class="life-card" onclick="goPage('habits')">
        <div class="lc-icon">😴</div>
        <div class="lc-info">
          <div class="lc-name">النوم</div>
          <div class="lc-status lc-warn" id="lc-sleep">غير منتظم</div>
        </div>
      </div>
      <div class="life-card" onclick="goPage('habits')">
        <div class="lc-icon">🦷</div>
        <div class="lc-info">
          <div class="lc-name">الدراسة</div>
          <div class="lc-status lc-warn" id="lc-study">ضعيفة</div>
        </div>
      </div>
      <div class="life-card" onclick="goPage('money')">
        <div class="lc-icon">💰</div>
        <div class="lc-info">
          <div class="lc-name">الفلوس</div>
          <div class="lc-status lc-neutral" id="lc-money">ابدأي</div>
        </div>
      </div>
      <div class="life-card" onclick="goPage('tasks')">
        <div class="lc-icon">✅</div>
        <div class="lc-info">
          <div class="lc-name">المهام</div>
          <div class="lc-status lc-neutral" id="lc-tasks">رتبيها</div>
        </div>
      </div>
      <div class="life-card" onclick="goPage('journal')">
        <div class="lc-icon">📝</div>
        <div class="lc-info">
          <div class="lc-name">اليومية</div>
          <div class="lc-status lc-warn" id="lc-journal">لم تُكتب</div>
        </div>
      </div>
    </div>

    <div class="section-label stagger-item">الإحصائيات الأساسية</div>
    <div class="stats-row stagger-item">
      <div class="stat-card"><div class="stat-label">أعلى سلسلة</div><div class="stat-value" id="stat-streak">٠</div><div class="stat-change stat-up">يوم متواصل</div></div>
      <div class="stat-card"><div class="stat-label">إجمالي التحويش</div><div class="stat-value" id="stat-savings">٠</div><div class="stat-change stat-neutral">روبل</div></div>
      <div class="stat-card"><div class="stat-label">عادات اليوم</div><div class="stat-value" id="stat-habits">٠٪</div><div class="stat-change stat-neutral" id="stat-habits-lbl">من الأهداف</div></div>
      <div class="stat-card"><div class="stat-label">مشاكل محلولة</div><div class="stat-value" id="stat-solved">٠</div><div class="stat-change stat-neutral">مشكلة</div></div>
    </div>
  </div>
</div>`;
}

function renderTasksPage(){
  return `<div class="page" id="page-tasks">
  <div class="page-header">
    <div class="page-header-row">
      <div>
        <div class="page-title">المهام اليومية</div>
        <div class="page-subtitle">ترتيب اليوم بشكل خفيف وواضح على طريقة Todoist</div>
      </div>
      <div class="page-tools"><div class="chip chip-gold" id="tasks-xp-mini">٠ XP اليوم</div></div>
    </div>
  </div>
  <div class="card" style="margin-bottom:16px">
    <div class="section-label">إضافة مهمة جديدة</div>
    <div class="task-form">
      <input class="inp" id="task-title-input" placeholder="اكتبي المهمة هنا..." style="flex:2;min-width:180px">
      <select class="inp" id="task-priority-select" style="flex:1;min-width:110px">
        <option value="normal">عادي</option>
        <option value="important">مهم</option>
        <option value="urgent">عاجل</option>
      </select>
      <select class="inp" id="task-repeat-select" style="flex:1;min-width:110px">
        <option value="none">لا</option>
        <option value="daily">يومي</option>
        <option value="weekly">أسبوعي</option>
      </select>
      <select class="inp" id="task-goal-select" style="flex:1;min-width:130px"></select>
      <button class="btn btn-primary" onclick="addTask()">إضافة مهمة</button>
    </div>
  </div>
  <div class="grid-2">
    <div class="card">
      <div class="section-label">مهام اليوم</div>
      <div id="tasks-pending"></div>
    </div>
    <div class="card">
      <div class="section-label">المكتملة</div>
      <div id="tasks-completed"></div>
    </div>
  </div>
</div>`;
}

function renderHabitsPage(){
  return `<div class="page" id="page-habits">
  <div class="page-header">
    <div class="page-header-row">
      <div>
        <div class="page-title">العادات اليومية</div>
        <div class="page-subtitle">الاستمرارية أهم من الكمال — يوم بيوم</div>
      </div>
      <div class="page-tools">
        <button class="btn btn-ghost btn-sm" onclick="exportHabitsCsv()">⬇ تصدير CSV</button>
        <button class="btn btn-primary btn-sm" onclick="addHabitModal()">+ أضف عادة جديدة</button>
      </div>
    </div>
    <div class="habit-summary-strip" id="habits-summary"></div>
  </div>
  <div class="card" style="margin-bottom:16px">
    <div id="habits-list"></div>
  </div>
</div>`;
}

function renderMoneyPage(){
  return `<div class="page" id="page-money">
  <div class="page-header">
    <div class="page-header-row">
      <div>
        <div class="page-title">المصاريف والتحويش</div>
        <div class="page-subtitle">١٠٪ فورًا عند استلام الفلوس — القاعدة الذهبية</div>
      </div>
      <div class="page-tools">
        <button class="btn btn-ghost btn-sm" onclick="exportExpensesCsv()">⬇ تصدير CSV</button>
      </div>
    </div>
  </div>
  <div class="grid-3" style="margin-bottom:16px">
    <div class="money-stat">
      <div class="ms-label">الرصيد المتاح</div>
      <div class="ms-val" id="m-balance">٠</div>
      <div class="ms-sub">روبل (دخل - مصاريف)</div>
      <div class="prog-wrap"><div class="prog-fill prog-green" id="m-balance-bar" style="width:0%"></div></div>
    </div>
    <div class="money-stat">
      <div class="ms-label">دخل الشهر</div>
      <div class="ms-val" id="m-income">٠</div>
      <div class="ms-sub" style="color:var(--green)">روبل مكتسب</div>
      <div class="money-summary-row" style="margin-top:8px;cursor:pointer" onclick="openSavingsGoalModal()"><span style="color:var(--text3)">التحويش: <span id="m-savings-goal-val">٥٠٠٠</span> ₽</span><span id="m-savings-wrap"><b id="m-savings-nav">٠ ₽</b></span></div>
      <div class="prog-wrap"><div class="prog-fill prog-gold" id="m-savings-bar" style="width:0%"></div></div>
    </div>
    <div class="money-stat">
      <div class="ms-label">مصاريف الشهر</div>
      <div class="ms-val" id="m-total">٠</div>
      <div class="ms-sub" style="color:var(--red)">روبل مصروف</div>
      <div class="money-cats" id="m-cats"></div>
    </div>
  </div>
  <div class="card" style="margin-bottom:16px">
    <div class="section-label">تسجيل عملية</div>
    <div class="money-form">
      <input type="number" class="inp" id="m-amount" placeholder="المبلغ (₽)" style="flex:1;min-width:100px">
      <select class="inp" id="m-cat" style="flex:1;min-width:120px">
        <optgroup label="الدخل">
          <option value="راتب">💼 راتب</option>
          <option value="مكافأة">🎁 مكافأة</option>
          <option value="دخل إضافي">💰 دخل إضافي</option>
        </optgroup>
        <optgroup label="المصروفات">
          <option value="أكل">🍽️ أكل</option>
          <option value="مواصلات">🚌 مواصلات</option>
          <option value="دراسة">📚 دراسة</option>
          <option value="ترفيه">🎮 ترفيه</option>
          <option value="صحة">💊 صحة</option>
          <option value="فواتير">🧾 فواتير</option>
          <option value="أخرى">📦 أخرى</option>
        </optgroup>
        <optgroup label="التحويش">
          <option value="ادخار">💚 ادخار</option>
        </optgroup>
      </select>
      <input type="text" class="inp" id="m-note" placeholder="ملاحظة" style="flex:2;min-width:120px">
      <button class="btn btn-primary" onclick="addExpense()">سجّل</button>
    </div>
  </div>
  <div class="card" style="margin-bottom:16px">
    <div class="section-label">الميزانية الشهرية (للمصاريف)</div>
    <div id="budget-list"></div>
    <div class="budget-projection" id="budget-projection"></div>
  </div>
  <div class="card">
    <div class="section-label">آخر المصروفات</div>
    <div class="exp-log" id="exp-log"><div class="exp-empty">لا توجد مصروفات بعد</div></div>
  </div>
</div>`;
}

function renderAnalyticsPage(){
  return `<div class="page" id="page-analytics">
  <div class="page-header">
    <div class="page-title">التحليلات</div>
    <div class="page-subtitle">نظرة ذكية على الطاقة والعادات والفلوس</div>
  </div>
  <div class="analytics-stack">
    <div class="card">
      <div class="section-label">أنماط الطاقة</div>
      <div class="energy-week-bars" id="energy-week-bars"></div>
    </div>
    <div class="card">
      <div class="section-label">مقارنة الأسبوع</div>
      <div class="week-compare-grid">
        <div class="compare-card"><div class="stat-label">هذا الأسبوع</div><div class="stat-value" id="analytics-this-week">٠٪</div></div>
        <div class="compare-card"><div class="stat-label">الأسبوع الماضي</div><div class="stat-value" id="analytics-last-week">٠٪</div></div>
        <div class="compare-card"><div class="stat-label">الاتجاه</div><div class="stat-value" id="analytics-week-trend">—</div><div class="stat-change" id="analytics-week-trend-sub">—</div></div>
      </div>
    </div>
    <div class="card">
      <div class="section-label">إحصائيات العادات</div>
      <div class="analytics-highlight-row">
        <div class="analytics-highlight"><span>أفضل عادة</span><strong id="analytics-best-habit">—</strong></div>
        <div class="analytics-highlight"><span>الأقل التزاماً</span><strong id="analytics-worst-habit">—</strong></div>
      </div>
      <div id="analytics-habit-rates"></div>
    </div>
    <div class="card">
      <div class="section-label">الاقتراحات الذكية</div>
      <div class="smart-suggestions" id="smart-suggestions"></div>
    </div>
  </div>
</div>`;
}

function renderProblemsPage(){
  return `<div class="page" id="page-problems">
  <div class="page-header">
    <div class="page-header-row">
      <div>
        <div class="page-title">إدارة المشاكل</div>
        <div class="page-subtitle">مشكلة محددة + حل + تجربة = تحسن ١٠٪ كل شهر</div>
      </div>
      <button class="btn btn-primary btn-sm" onclick="openAddProblem()">+ مشكلة جديدة</button>
    </div>
  </div>
  <div id="problems-list"></div>
</div>`;
}

function renderGoalsPage(){
  return `<div class="page" id="page-goals">
  <div class="page-header">
    <div class="page-header-row">
      <div>
        <div class="page-title">أهداف ٣ شهور</div>
        <div class="page-subtitle">مش سنة — ٣ شهور بس. واضحة وقابلة للقياس</div>
      </div>
      <button class="btn btn-primary btn-sm" onclick="openAddGoal()">+ هدف جديد</button>
    </div>
  </div>
  <div id="goals-list"></div>
</div>`;
}

function renderPomodoroPage(){
  return `<div class="page" id="page-pomodoro">
  <div class="page-header">
    <div class="page-title">مؤقت بومودورو</div>
    <div class="page-subtitle">٢٥ دقيقة تركيز، بعدها راحة قصيرة محسوبة</div>
  </div>
  <div class="timer-shell">
    <div class="timer-card">
      <div class="timer-state" id="pomodoro-state">جلسة تركيز</div>
      <div class="timer-display" id="pomodoro-display">25:00</div>
      <div class="timer-sub" id="pomodoro-sub">ابدئي جلسة تركيز واحدة فقط</div>
      <div class="timer-controls">
        <button class="btn btn-primary" onclick="togglePomodoro()" id="pomodoro-toggle-btn">ابدأ</button>
        <button class="btn btn-ghost" onclick="skipPomodoro()">تخطي</button>
        <button class="btn btn-ghost" onclick="resetPomodoro()">إعادة ضبط</button>
      </div>
      <div class="timer-presets">
        <button class="btn btn-ghost btn-sm" onclick="setPomodoroMode('focus')">٢٥ دقيقة تركيز</button>
        <button class="btn btn-ghost btn-sm" onclick="setPomodoroMode('break')">٥ دقائق راحة</button>
      </div>
    </div>
    <div class="timer-card">
      <div class="section-label">إحصائيات الجلسات</div>
      <div class="stats-row" style="margin-bottom:0">
        <div class="stat-card"><div class="stat-label">اليوم</div><div class="stat-value" id="pomodoro-today">٠</div><div class="stat-change stat-neutral">جلسة</div></div>
        <div class="stat-card"><div class="stat-label">الإجمالي</div><div class="stat-value" id="pomodoro-total">٠</div><div class="stat-change stat-neutral">منذ البداية</div></div>
        <div class="stat-card"><div class="stat-label">الوضع</div><div class="stat-value" id="pomodoro-mode-mini">تركيز</div><div class="stat-change stat-neutral">نشط الآن</div></div>
        <div class="stat-card"><div class="stat-label">الحالة</div><div class="stat-value" id="pomodoro-run-state">متوقف</div><div class="stat-change stat-neutral">جاهز</div></div>
      </div>
    </div>
  </div>
</div>`;
}

function renderWeeklyPage(){
  return `<div class="page" id="page-weekly">
  <div class="page-header">
    <div class="page-title">المراجعة الأسبوعية</div>
    <div class="page-subtitle">١٥ دقيقة في الأسبوع — السر الحقيقي للتطور</div>
  </div>
  <div class="card">
    <div class="weekly-q-block"><div class="wq-label"><span style="color:var(--green)">✓</span> إيه اللي نجح الأسبوع ده؟</div><textarea class="inp" id="wq1" placeholder="اكتبي اللي عملتيه صح..."></textarea></div>
    <div class="weekly-q-block"><div class="wq-label"><span style="color:var(--red)">✗</span> إيه اللي مجاش صح؟</div><textarea class="inp" id="wq2" placeholder="بدون جلد ذات — بس ملاحظة موضوعية..."></textarea></div>
    <div class="weekly-q-block"><div class="wq-label"><span style="color:var(--gold)">↻</span> إيه اللي هتغيريه الأسبوع الجاي؟</div><textarea class="inp" id="wq3" placeholder="تعديل واحد بس — مش قائمة أمنيات..."></textarea></div>
    <div class="weekly-q-block"><div class="wq-label"><span style="color:var(--blue)">✦</span> أهم درس الأسبوع</div><textarea class="inp" id="wq4" placeholder="حاجة تحبي تفتكريها..."></textarea></div>
    <div class="inline-actions">
      <button class="btn btn-primary" onclick="saveWeekly()">💾 احفظي المراجعة</button>
      <span id="weekly-saved-msg" style="font-size:12px;color:var(--green);display:none">✓ تم الحفظ</span>
    </div>
  </div>
  <div id="weekly-history" style="margin-top:20px"></div>
</div>`;
}

function renderJournalPage(){
  return `<div class="page" id="page-journal">
  <div class="page-header">
    <div class="page-header-row">
      <div>
        <div class="page-title">اليومية</div>
        <div class="page-subtitle">سجلي يومك، امتنانك، ومزاجك في مكان واحد</div>
      </div>
      <div class="page-tools"><div class="chip chip-gold" id="journal-energy-chip">الطاقة: ٥/١٠</div></div>
    </div>
  </div>
  <div class="card" style="margin-bottom:16px">
    <div class="section-label">مدخل اليوم</div>
    <div class="journal-mood-row" id="journal-mood-options"></div>
    <div class="journal-gratitude-grid">
      <input class="inp" id="journal-gratitude-1" placeholder="ممتنة لـ...">
      <input class="inp" id="journal-gratitude-2" placeholder="ممتنة لـ...">
      <input class="inp" id="journal-gratitude-3" placeholder="ممتنة لـ...">
    </div>
    <textarea class="inp" id="journal-content" placeholder="اكتبي عن يومك..." style="min-height:120px;margin-top:12px"></textarea>
    <div class="inline-actions" style="margin-top:12px">
      <button class="btn btn-primary" onclick="saveJournal()">احفظي اليومية</button>
      <span id="journal-saved-msg" style="font-size:12px;color:var(--green);display:none">✓ تم الحفظ</span>
    </div>
  </div>
  <div class="card">
    <div class="section-label">آخر ٧ أيام</div>
    <div id="journal-history"></div>
  </div>
</div>`;
}

function renderMoodPage(){
  return `<div class="page" id="page-mood">
  <div class="page-header">
    <div class="page-title">تتبع المزاج</div>
    <div class="page-subtitle">سجل يومي بسيط يوضح شكل أيامك مع الوقت</div>
  </div>
  <div class="card" style="margin-bottom:16px">
    <div class="section-label">مزاج اليوم</div>
    <div class="mood-grid" id="mood-options"></div>
    <div class="form-group" style="margin-top:14px">
      <label class="form-label">ملاحظة قصيرة</label>
      <textarea class="inp" id="mood-note" placeholder="اكتبي سبب مختصر أو ملاحظة عن اليوم"></textarea>
    </div>
    <div class="inline-actions">
      <button class="btn btn-primary" onclick="saveMood()">حفظ المزاج</button>
      <span id="mood-saved-msg" style="font-size:12px;color:var(--green);display:none">✓ تم الحفظ</span>
    </div>
  </div>
  <div class="card">
    <div class="section-label">السجل الأخير</div>
    <div class="mood-history" id="mood-history"></div>
  </div>
</div>`;
}

function renderTipsPage(){
  return `<div class="page" id="page-tips">
  <div class="page-header">
    <div class="page-title">مكتبة النصائح ✦</div>
    <div class="page-subtitle">نصائح علمية ومجربة لكل المشاكل اللي بتواجهيها</div>
  </div>
  <div class="tips-filter" id="tips-filter">
    <button class="tip-cat-btn active" onclick="filterTips(this,'all')">الكل</button>
    <button class="tip-cat-btn" onclick="filterTips(this,'energy')">الطاقة والنوم</button>
    <button class="tip-cat-btn" onclick="filterTips(this,'focus')">التركيز والمذاكرة</button>
    <button class="tip-cat-btn" onclick="filterTips(this,'money')">الفلوس</button>
    <button class="tip-cat-btn" onclick="filterTips(this,'develop')">التطوير الذاتي</button>
    <button class="tip-cat-btn" onclick="filterTips(this,'social')">الحياة الاجتماعية</button>
    <button class="tip-cat-btn" onclick="filterTips(this,'spirit')">الروحانيات</button>
    <button class="tip-cat-btn" onclick="filterTips(this,'expat')">الغربة</button>
  </div>
  <div id="tips-list"></div>
</div>`;
}

function renderAchievementsPage(){
  return `<div class="page" id="page-achievements">
  <div class="page-header">
    <div class="page-title">الإنجازات</div>
    <div class="page-subtitle">XP، المستوى، الشارات، والتحدي الأسبوعي</div>
  </div>
  <div class="achievements-stack">
    <div class="card">
      <div class="section-label">ملخص المستوى</div>
      <div class="xp-overview-grid">
        <div class="stat-card"><div class="stat-label">المستوى الحالي</div><div class="stat-value" id="achievement-level">١</div></div>
        <div class="stat-card"><div class="stat-label">إجمالي XP</div><div class="stat-value" id="achievement-xp">٠</div></div>
        <div class="stat-card"><div class="stat-label">للمستوى التالي</div><div class="stat-value" id="achievement-next">٢٠٠</div></div>
      </div>
      <div class="prog-wrap" style="margin-top:14px"><div class="prog-fill prog-gold" id="achievement-xp-bar" style="width:0%"></div></div>
    </div>
    <div class="card">
      <div class="section-label">التحدي الأسبوعي</div>
      <div class="challenge-card">
        <div class="challenge-title" id="weekly-challenge-title">لا يوجد تحدي بعد</div>
        <div class="challenge-meta" id="weekly-challenge-meta">انتظري التحدي القادم</div>
        <div class="prog-wrap" style="margin-top:12px"><div class="prog-fill prog-green" id="weekly-challenge-bar" style="width:0%"></div></div>
      </div>
    </div>
    <div class="badge-grid" id="achievements-list"></div>
  </div>
</div>`;
}

function renderGuidePage(){
  return `<div class="page" id="page-guide">
  <div class="page-header">
    <div class="page-title">دليل التطور 💡</div>
    <div class="page-subtitle">كيف تستخدمين Sama OS لتحقيق أقصى استفادة وبناء حياة متوازنة؟</div>
  </div>
  <div class="tips-list">
    
    <div class="tip-card" style="margin-bottom:12px; border: 1px solid var(--gold-dim2)">
      <div class="tip-card-top">
        <div class="tip-icon-box" style="background:var(--gold-dim);color:var(--gold)">⬡</div>
        <div style="flex:1">
          <div class="tip-cat">البداية</div>
          <div class="tip-title">لوحة القيادة (Dashboard)</div>
        </div>
      </div>
      <div class="tip-body">
        لوحة القيادة هي نبض يومك. نظرة سريعة عليها تخبرك بكل شيء: طاقتك الحالية، نسبة المهام المنجزة، والالتزام בעادات. 
        <br><br><b>نصيحة:</b> ابدأي يومك بفتح هذه الصفحة لضبط نيتك وتحديد "الحد الأدنى" (MVD) الذي يجب إنجازه مهما كان اليوم سيئاً.
      </div>
    </div>

    <div class="tip-card" style="margin-bottom:12px">
      <div class="tip-card-top">
        <div class="tip-icon-box">◎</div>
        <div style="flex:1">
          <div class="tip-cat">الاستمرارية</div>
          <div class="tip-title">العادات (Habits) مقابل المهام (Tasks)</div>
        </div>
      </div>
      <div class="tip-body">
        <b>العادات:</b> هي الأفعال التي تبني الهوية، مثل الصلاة، الرياضة، أو القراءة المستمرة. الهدف هنا هو "عدم كسر السلسلة" (Streak). التزمي بالقليل المستمر.<br><br>
        <b>المهام:</b> هي أهداف يومية متغيرة تدفع مشاريعك أو واجباتك للأمام. المهام تُنجز وتُنسى، أما العادات فتُبنى لتستمر.
      </div>
    </div>

    <div class="tip-card" style="margin-bottom:12px">
      <div class="tip-card-top">
        <div class="tip-icon-box">◈</div>
        <div style="flex:1">
          <div class="tip-cat">الوعي المالي</div>
          <div class="tip-title">الفلوس والتحويش</div>
        </div>
      </div>
      <div class="tip-body">
        الوعي المالي يبدأ بالتسجيل. لا يهم حجم المصروف، المهم أن تعرفي أين تذهب أموالك.
        <br><b>القاعدة الذهبية:</b> بمجرد دخول أي مبلغ لكِ، اسحبي فوراً نسبة (مثلاً 10%) إلى فئة "ادخار" قبل أن تصرفي قرشاً واحداً. النظام هنا مجهز لتتبع هذا الهدف وتشجيعك على الوصول للهدف الكلي.
      </div>
    </div>

    <div class="tip-card" style="margin-bottom:12px">
      <div class="tip-card-top">
        <div class="tip-icon-box">◫</div>
        <div style="flex:1">
          <div class="tip-cat">عقلية النمو</div>
          <div class="tip-title">إدارة المشاكل (Problem Management)</div>
        </div>
      </div>
      <div class="tip-body">
        بدلاً من الشكوى المستمرة من نفس المشكلة (مثل: نومي ملخبط)، تعاملي معها كمهندسة:
        <ul style="margin:8px 0 0 20px;padding:0">
          <li style="margin-bottom:6px"><b>حددي المشكلة:</b> نوم غير منتظم.</li>
          <li style="margin-bottom:6px"><b>الحل المقترح (للتجربة):</b> قراءة كتاب بدل الموبايل قبل النوم بـ 30 دقيقة.</li>
          <li style="margin-bottom:6px"><b>المدة:</b> جربي الحل لـ 7 أيام بصدق والتزمي به كأنه دواء. نجح؟ انقليه لـ "محلولة". لم ينجح؟ غيري الحل المقترح.</li>
        </ul>
      </div>
    </div>

    <div class="tip-card" style="margin-bottom:12px">
      <div class="tip-card-top">
        <div class="tip-icon-box">📝</div>
        <div style="flex:1">
          <div class="tip-cat">الصحة النفسية</div>
          <div class="tip-title">اليومية (Journaling) والامتنان</div>
        </div>
      </div>
      <div class="tip-body">
        لا تتركي أفكارك تدور في رأسك. فرغيها.
        <br>دقيقة واحدة يومياً تكتبي فيها 3 أشياء بسيطة أنتِ ممتنة عليها (حتى لو كانت فنجان قهوة مظبوط) قادرة على إعادة برمجة تركيز العقل نحو الإيجابيات بدلاً من السلبيات.
      </div>
    </div>

    <div class="tip-card" style="margin-bottom:12px">
      <div class="tip-card-top">
        <div class="tip-icon-box">◬</div>
        <div style="flex:1">
          <div class="tip-cat">الاتجاه الصحيح</div>
          <div class="tip-title">الأهداف والمراجعة الأسبوعية</div>
        </div>
      </div>
      <div class="tip-body">
        <b>الأهداف:</b> لا تضعي أهدافاً سنوية. ضعي 3 أهداف واضحة لـ 3 شهور القادمة فقط. هذا يخلق إحساساً بالاستعجال ويمنع التسويف.<br><br>
        <b>المراجعة الأسبوعية:</b> 15 دقيقة نهاية كل أسبوع تسألين نفسك بصدق: إيه اللي نفع؟ وإيه اللي مانفعش؟ وايه التعديل البسيط اللي هضيفه الأسبوع الجاي؟ هذه هي الطريقة الوحيدة لضمان عدم تكرار أخطاء الأسبوع الماضي.
      </div>
    </div>

  </div>
</div>`;
}

function renderSettingsPage(){
  return `<div class="page" id="page-settings">
  <div class="page-header">
    <div class="page-title">الإعدادات</div>
    <div class="page-subtitle">تحكم في شكل التطبيق والنسخ الاحتياطي والتصدير</div>
  </div>
  <div class="settings-stack">
    <div class="card">
      <div class="section-label">الواجهة</div>
      <div class="setting-row">
        <div class="setting-copy">
          <div class="setting-title">حجم الخط</div>
          <div class="setting-desc">كبّري أو صغّري الواجهة حسب راحتك</div>
        </div>
        <div style="width:min(240px,100%)">
          <input type="range" class="goal-slider" min="0.9" max="1.2" step="0.05" id="font-scale-range" oninput="updateFontScale(this.value)">
          <div style="font-size:11px;color:var(--text2);margin-top:6px;text-align:left" id="font-scale-label">100%</div>
        </div>
      </div>
      <div class="setting-row">
        <div class="setting-copy">
          <div class="setting-title">اللغة</div>
          <div class="setting-desc">تبديل لغة الواجهة الأساسية</div>
        </div>
        <select class="inp" style="max-width:180px" id="language-select" onchange="updateLanguage(this.value)">
          <option value="ar">العربية</option>
          <option value="en">English</option>
        </select>
      </div>
    </div>
    <div class="card">
      <div class="section-label">التصدير والنسخ الاحتياطي</div>
      <div class="backup-actions">
        <button class="btn btn-primary" onclick="exportStateJson()">⬇ تصدير JSON</button>
        <button class="btn btn-ghost" onclick="triggerJsonImport()">⬆ استيراد JSON</button>
        <button class="btn btn-ghost" onclick="exportExpensesCsv()">CSV المصاريف</button>
        <button class="btn btn-ghost" onclick="exportHabitsCsv()">CSV العادات</button>
      </div>
      <input type="file" class="hidden-input" id="json-import-input" accept="application/json" onchange="handleJsonImport(event)">
    </div>
    <div class="card">
      <div class="section-label">الحساب</div>
      ${renderAuthPanel('settings')}
    </div>
  </div>
</div>`;
}

function renderAdminPage(){
  return `<div class="page" id="page-admin">
  <div class="page-header">
    <div class="page-header-row">
      <div>
        <div class="page-title">لوحة التحكم</div>
        <div class="page-subtitle">متابعة المستخدمين وبياناتهم من داخل Sama OS</div>
      </div>
      <div class="page-tools">
        <button class="btn btn-ghost btn-sm" type="button" onclick="refreshAdminDashboard()">تحديث</button>
      </div>
    </div>
  </div>
  <div class="admin-shell">
    <aside class="card admin-users-card">
      <div class="admin-card-head">
        <div>
          <div class="section-label">المستخدمون</div>
          <div class="admin-card-sub">ابحثي وافتحي أي مستخدم للمراجعة</div>
        </div>
      </div>
      <div class="admin-search-row">
        <input class="inp admin-search-input" id="admin-user-search" type="search" placeholder="ابحثي بالاسم أو البريد" oninput="updateAdminUserSearch(this.value)">
      </div>
      <div class="admin-list-meta" id="admin-list-meta">جاري التحميل...</div>
      <div class="admin-user-list" id="admin-user-list">
        <div class="admin-empty">جاري تحميل قائمة المستخدمين...</div>
      </div>
    </aside>
    <section class="admin-detail-column">
      <div class="card admin-detail-card" id="admin-detail-root">
        <div class="admin-empty">اختاري مستخدمًا من القائمة لعرض التفاصيل.</div>
      </div>
    </section>
  </div>
</div>`;
}

function renderPages(){
  return [
    renderHomePage(),
    renderTasksPage(),
    renderHabitsPage(),
    renderMoneyPage(),
    renderAnalyticsPage(),
    renderProblemsPage(),
    renderGoalsPage(),
    renderPomodoroPage(),
    renderWeeklyPage(),
    renderJournalPage(),
    renderMoodPage(),
    renderTipsPage(),
    renderGuidePage(),
    renderAchievementsPage(),
    renderSettingsPage(),
    renderAdminPage(),
  ].join('');
}

function renderShellOverlays(){
  return `<div class="modal-overlay" id="modal-overlay" onclick="closeModal(event)">
  <div class="modal" id="modal-box">
    <div class="modal-title" id="modal-title"></div>
    <div id="modal-body"></div>
    <div class="modal-btns" id="modal-btns"></div>
  </div>
</div>
<div class="toast" id="toast"></div>
<div class="xp-toast" id="xp-toast"></div>
<div class="loading-overlay" id="app-loading">
  <div class="loading-box">
    <div class="loading-spinner"></div>
    <div class="loading-title">جاري تجهيز Sama OS...</div>
    <div class="loading-sub">Checking your session and syncing your data</div>
  </div>
</div>`;
}

function renderAppShell(){
  const root=document.getElementById('app-root');
  if(!root)return;
  root.innerHTML=`${renderAuthGate()}<div class="app-shell hidden" id="app-shell" aria-hidden="true"><div class="app">${renderDesktopSidebar()}<main class="main">${renderMobileShell()}${renderPages()}</main></div></div>${renderShellOverlays()}`;
}
