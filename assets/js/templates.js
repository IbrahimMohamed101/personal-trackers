const DESKTOP_NAV_SECTIONS=[
  {label:'اليومي',items:[{page:'home',icon:'⬡',label:'لوحة القيادة',active:true}]},
  {
    label:'المتابعة',
    items:[
      {page:'tasks',icon:'✅',label:'المهام'},
      {page:'habits',icon:'◎',label:'العادات'},
      {page:'money',icon:'◈',label:'المالية'},
      {page:'journal',icon:'📝',label:'اليومية'},
    ],
  },
  {
    label:'التحليل',
    items:[
      {page:'analytics',icon:'📊',label:'الإحصائيات'},
      {page:'weekly',icon:'◧',label:'مراجعة أسبوعية'},
    ],
  },
  {
    label:'إدارة',
    items:[
      {page:'settings',icon:'⚙',label:'الإعدادات'},
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
      <input class="inp auth-input" type="text" placeholder="الاسم" autocomplete="name" data-auth-input="name">
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

function renderOnboardingFlow(){
  const step=S.onboarding?.step||0;
  if(step===0){
    return `<section class="onboarding" id="onboarding-flow" style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:linear-gradient(135deg,var(--bg1) 0%,var(--bg0) 100%);">
      <div class="onboarding-splash" style="text-align:center;max-width:400px;padding:40px 20px;">
        <div style="font-size:80px;margin-bottom:20px;">🌟</div>
        <h1 style="font-size:32px;margin-bottom:10px;color:var(--text1);">Personal Trackers</h1>
        <p style="font-size:18px;color:var(--text2);margin-bottom:30px;line-height:1.6;">Track. Focus. Grow.</p>
        <p style="color:var(--text3);margin-bottom:40px;font-size:14px;">مساحة شخصية لتنظيم حياتك بوضوح</p>
        <button class="btn btn-primary" onclick="startOnboarding()" style="padding:14px 32px;font-size:16px;">ابدئي الآن</button>
        <div style="margin-top:20px;font-size:12px;color:var(--text3);">
          يستغرق حوالي دقيقتين فقط • بدون بيانات ائتمانية
        </div>
      </div>
    </section>`;
  }
  
  if(step===1){
    return `<section class="onboarding" id="onboarding-flow" style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:var(--bg0);">
      <div class="onboarding-card" style="max-width:500px;width:100%;padding:40px;margin:20px;">
        <div style="text-align:center;margin-bottom:30px;">
          <div style="font-size:48px;margin-bottom:10px;">🌱</div>
          <h2 style="font-size:24px;color:var(--text1);">أول عادة لك</h2>
          <p style="color:var(--text3);margin-top:8px;">ما هي الشيء الذي تريدين فعله يومياً؟</p>
        </div>
        <div style="background:var(--bg1);padding:20px;border-radius:12px;margin-bottom:20px;">
          <input class="inp" id="onboard-habit-input" type="text" placeholder="مثلاً: المشي الصباحي، قراءة الكتاب..." style="width:100%;margin-bottom:10px;font-size:14px;"  />
          <div style="font-size:12px;color:var(--text3);line-height:1.6;">
            💡 <strong>الخيارات الشهيرة:</strong> 🚴 رياضة • 📚 قراءة • 🧘 تأمل • 💧 شرب الماء
          </div>
        </div>
        <button class="btn btn-primary" onclick="completeOnboardingStep(1)" style="width:100%;padding:12px;">التالي</button>
        <button class="btn btn-ghost" onclick="skipOnboarding()" style="width:100%;padding:12px;margin-top:10px;font-size:12px;">تخطي</button>
        <div style="text-align:center;margin-top:20px;font-size:12px;color:var(--text3);">الخطوة 1 من 3</div>
      </div>
    </section>`;
  }
  
  if(step===2){
    return `<section class="onboarding" id="onboarding-flow" style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:var(--bg0);">
      <div class="onboarding-card" style="max-width:500px;width:100%;padding:40px;margin:20px;">
        <div style="text-align:center;margin-bottom:30px;">
          <div style="font-size:48px;margin-bottom:10px;">✅</div>
          <h2 style="font-size:24px;color:var(--text1);">أول مهمة لك</h2>
          <p style="color:var(--text3);margin-top:8px;">ما الذي يجب أن تنجزيه اليوم؟</p>
        </div>
        <div style="background:var(--bg1);padding:20px;border-radius:12px;margin-bottom:20px;">
          <input class="inp" id="onboard-task-input" type="text" placeholder="مثلاً: إنهاء التقرير، مكالمة المدير..." style="width:100%;margin-bottom:15px;font-size:14px;" />
          <select class="inp" id="onboard-task-priority" style="width:100%;margin-bottom:15px;padding:10px;border-radius:8px;background:var(--bg0);color:var(--text1);border:1px solid var(--text3);">
            <option value="normal">عادي</option>
            <option value="important">مهم</option>
            <option value="urgent">عاجل</option>
          </select>
          <label style="display:flex;align-items:center;gap:8px;color:var(--text3);font-size:12px;">
            <input type="checkbox" id="onboard-task-reminder" />
            أرسل لي تذكير (اختياري)
          </label>
        </div>
        <button class="btn btn-primary" onclick="completeOnboardingStep(2)" style="width:100%;padding:12px;">التالي</button>
        <div style="text-align:center;margin-top:20px;font-size:12px;color:var(--text3);">الخطوة 2 من 3</div>
      </div>
    </section>`;
  }
  
  if(step===3){
    return `<section class="onboarding" id="onboarding-flow" style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:var(--bg0);">
      <div class="onboarding-card" style="max-width:500px;width:100%;padding:40px;margin:20px;">
        <div style="text-align:center;margin-bottom:30px;">
          <div style="font-size:48px;margin-bottom:10px;">⚡</div>
          <h2 style="font-size:24px;color:var(--text1);">كيف طاقتك اليوم؟</h2>
          <p style="color:var(--text3);margin-top:8px;">هذا مؤشر لمدى استعدادك</p>
        </div>
        <div style="background:var(--bg1);padding:24px;border-radius:12px;margin-bottom:20px;text-align:center;">
          <div style="font-size:32px;letter-spacing:8px;margin-bottom:20px;">😔 😕 😐 🙂 😊 😄</div>
          <input type="range" min="1" max="10" value="5" id="onboard-energy" style="width:100%;height:6px;cursor:pointer;" />
          <div style="margin-top:15px;color:var(--gold);font-size:18px;font-weight:bold;" id="onboard-energy-display">طاقة متوسطة — يمكن التقدم</div>
        </div>
        <button class="btn btn-primary" onclick="completeOnboarding()" style="width:100%;padding:12px;">ابدئي اليوم!</button>
        <div style="text-align:center;margin-top:20px;font-size:12px;color:var(--text3);">الخطوة 3 من 3</div>
      </div>
    </section>`;
  }
  
  return '';
}

function renderMobileDashboard(){
  const today=todayKey();
  const todayTasks=(S.tasks||[]).filter(t=>t.date===today).sort((a,b)=>a.done?1:-1).slice(0,5);
  const topHabits=(S.habits||[]).slice(0,4);
  const activeHabits=topHabits.filter(h=>!h.done.includes(today));
  const completedToday=((S.tasks||[]).filter(t=>t.date===today&&t.done)||[]).length;
  const totalTodayTasks=(S.tasks||[]).filter(t=>t.date===today).length;
  const savings=getSavingsTotal?getSavingsTotal():0;
  const moneyCurrency=getMoneyCurrency();
  const habitRateThisWeek=topHabits.length?Math.round(topHabits.reduce((sum,h)=>{
    const weekStart=challengeWeekStartKey(today);
    let count=0;
    for(let i=0;i<7;i++){
      const date=shiftDateKey(weekStart,i);
      if(h.done.includes(date))count++;
    }
    return sum+count/7;
  },0)/topHabits.length*100):0;
  
  const hour=new Date().getHours();
  const greeting=hour<5?'أهلاً بكِ':hour<12?'صباح الخير':hour<17?'مساء النور':'مساء الخير';
  const currentUser=typeof getCurrentFirebaseUser==='function'?getCurrentFirebaseUser():null;
  const userName=currentUser&&currentUser.displayName?currentUser.displayName:'';

  return `<div class="home-layout">
    <!-- Daily Brief Hero (Merged: Brief + Energy + Stats) -->
    <div class="daily-brief-hero">
      <div class="db-hero-top">
        <div class="db-greeting">
          <h2 id="home-greeting"><span class="fw-normal">${greeting}</span>${userName?'، <strong class="gold-text">'+escapeHtml(userName)+'</strong>':''} ✨</h2>
          <p id="home-sub">${todayStr()} • ${timeStr()}</p>
        </div>
        <div class="db-hero-energy">
          <div class="energy-thumb-val">${toAr(S.energy)}</div>
          <input type="range" min="1" max="10" value="${S.energy}" class="energy-slider-mini" id="energy-rng" oninput="setEnergy(this.value)">
        </div>
      </div>
      
      <div class="db-hero-xp">
        <div class="xp-row-mini">
          <span class="xp-level-badge">المستوى ١</span>
          <span class="xp-pct-mini">٠/٢٠٠ XP</span>
        </div>
        <div class="prog-wrap"><div class="prog-fill prog-gold" id="home-xp-bar" style="width:0%"></div></div>
      </div>

      <div class="db-stats-merged">
        <div class="db-stat-pill">📋 ${toAr(completedToday)}/${toAr(totalTodayTasks)} مهام</div>
        <div class="db-stat-pill">🔥 ${toAr(habitRateThisWeek)}٪ عادات</div>
        <div class="db-stat-pill">💰 ${formatMoneyValue(savings,moneyCurrency)}</div>
      </div>
    </div>

    <!-- Quick Actions Pill Strip -->
    <div class="quick-actions-strip">
      <button class="qa-pill" onclick="openExpenseModal()">💸 مصروف</button>
      <button class="qa-pill" onclick="goPage('journal')">📝 يومية</button>
      <button class="qa-pill" onclick="goPage('tasks')">✅ مهمة</button>
      <button class="qa-pill" onclick="goPage('pomodoro')">⏱️ تركيز</button>
    </div>

    <!-- Today's Focus (Unified Tasks + Active Habits) -->
    <div class="card dash-card card-focus-feed">
      <div class="dash-card-header">
        <div class="dash-card-title">🎯 تركيز اليوم</div>
        <div class="chip chip-gold">${toAr(totalTodayTasks + activeHabits.length)} متبقية</div>
      </div>
      
      <div class="focus-feed-list">
        ${todayTasks.length || activeHabits.length ? `
          
          ${activeHabits.map(habit=>{
            const streak=calcMaxStreak(habit.done);
            return `<div class="focus-row habit-row" onclick="markHabitDoneFromDashboard('${habit.id}')">
              <div class="focus-icon">◎</div>
              <div class="focus-content">
                <div class="focus-title">${escapeHtml(habit.name)}</div>
                <div class="focus-meta gold-text">🔥 ${toAr(streak)} يوم</div>
              </div>
              <div class="focus-action">إكمال</div>
            </div>`;
          }).join('')}

          ${todayTasks.map(task=>`
            <label class="focus-row task-row ${task.done?'done':''}">
              <div class="focus-checkbox">
                <input type="checkbox" ${task.done?'checked':''} onchange="toggleTaskDone(${task.id},this.checked)">
              </div>
              <div class="focus-content">
                <div class="focus-title">${escapeHtml(task.title)}</div>
              </div>
            </label>
          `).join('')}
          
        ` : '<div class="dash-empty-compact dash-empty-success" onclick="goPage(\'tasks\')">✓ يومك نظيف بالكامل! + أضيفي مهمة</div>'}
      </div>
    </div>

  </div>`;
}

function renderDesktopDashboard(){
  const today=todayKey();
  const todayTasks=(S.tasks||[]).filter(t=>t.date===today).sort((a,b)=>a.done?1:-1).slice(0,5);
  const topHabits=(S.habits||[]).slice(0,4);
  const activeHabits=topHabits.filter(h=>!h.done.includes(today));
  const completedToday=((S.tasks||[]).filter(t=>t.date===today&&t.done)||[]).length;
  const totalTodayTasks=(S.tasks||[]).filter(t=>t.date===today).length;
  const savings=getSavingsTotal?getSavingsTotal():0;
  const moneyCurrency=getMoneyCurrency();
  const habitRateThisWeek=topHabits.length?Math.round(topHabits.reduce((sum,h)=>{
    const weekStart=challengeWeekStartKey(today);
    let count=0;
    for(let i=0;i<7;i++){
      const date=shiftDateKey(weekStart,i);
      if(h.done.includes(date))count++;
    }
    return sum+count/7;
  },0)/topHabits.length*100):0;
  
  const hour=new Date().getHours();
  const greeting=hour<5?'أهلاً بكِ':hour<12?'صباح الخير':hour<17?'مساء النور':'مساء الخير';
  const currentUser=typeof getCurrentFirebaseUser==='function'?getCurrentFirebaseUser():null;
  const userName=currentUser&&currentUser.displayName?currentUser.displayName:'';

  return `<div class="home-layout">
    <!-- Daily Brief (Desktop Grid) -->
    <div class="daily-brief">
      <div class="db-main">
        <div class="db-greeting">
          <h2 id="home-greeting-desktop">${greeting}${userName?'، '+escapeHtml(userName):''} ✨</h2>
          <p id="home-sub-desktop">${todayStr()} • ${timeStr()}</p>
        </div>
      </div>
      <div class="db-stats-mini">
        <div class="db-stat-item"><span class="db-stat-icon">✅</span> <span>${toAr(completedToday)}/${toAr(totalTodayTasks)}</span> مهام</div>
        <div class="db-stat-item"><span class="db-stat-icon">🔥</span> <span>${toAr(habitRateThisWeek)}٪</span> عادات</div>
        <div class="db-stat-item"><span class="db-stat-icon">⚡</span> <span>${toAr(S.energy)}/١٠</span></div>
        <div class="db-stat-item"><span class="db-stat-icon">💰</span> <span>${formatMoneyValue(savings,moneyCurrency)}</span></div>
      </div>
    </div>

    <!-- Quick Actions (Desktop Grid) -->
    <div class="quick-actions">
      <button class="qa-btn" onclick="goPage('tasks')"><div class="qa-icon">✅</div><span>المهام</span></button>
      <button class="qa-btn" onclick="openExpenseModal()"><div class="qa-icon">💸</div><span>مصروف</span></button>
      <button class="qa-btn" onclick="goPage('journal')"><div class="qa-icon">📝</div><span>يومية</span></button>
      <button class="qa-btn" onclick="goPage('pomodoro')"><div class="qa-icon">⏱️</div><span>تركيز</span></button>
    </div>

    <!-- Layout Grid for Desktop -->
    <div class="desktop-dashboard-grid">
      <!-- Energy -->
      <div class="card dash-card">
        <div class="dash-card-header">
          <div class="dash-card-title">⚡ الطاقة</div>
          <div class="dash-card-value gold-text" id="ew-num">${toAr(S.energy)}</div>
        </div>
        <div class="ew-track"><input type="range" min="1" max="10" value="${S.energy}" id="energy-dashboard" oninput="setEnergy(this.value)"></div>
        <div class="dash-card-sub" id="ew-desc">${ENERGY_DESC[S.energy]||'طاقة متوسطة'}</div>
      </div>

      <div class="desktop-split-row">
        <!-- Today Tasks -->
        <div class="card dash-card">
          <div class="dash-card-header">
            <div class="dash-card-title">📋 أولوياتك اليوم</div>
            <div class="chip chip-gold">${toAr(totalTodayTasks)} مهام</div>
          </div>
          ${todayTasks.length?todayTasks.map(task=>`<div class="dash-task-row ${task.done?'done':''}">
            <input type="checkbox" ${task.done?'checked':''} onchange="toggleTaskDone(${task.id},this.checked)">
            <span class="dash-task-text">${escapeHtml(task.title)}</span>
          </div>`).join(''):'<div class="dash-empty-compact" onclick="goPage(\'tasks\')">+ أضيفي أول مهمة لليوم</div>'}
          <button class="btn btn-ghost btn-sm" onclick="goPage('tasks')" style="width:100%;margin-top:8px;justify-content:center">عرض كل المهام ←</button>
        </div>

        <!-- Active Habits -->
        <div class="card dash-card">
          <div class="dash-card-header">
            <div class="dash-card-title">🌱 العادات النشطة</div>
            <div class="chip chip-green">${toAr(activeHabits.length)} متبقية</div>
          </div>
          ${activeHabits.length?activeHabits.map(habit=>{
            const streak=calcMaxStreak(habit.done);
            return `<div class="dash-habit-row" onclick="markHabitDoneFromDashboard('${habit.id}')">
              <div class="dash-habit-info">
                <span class="dash-habit-name">${escapeHtml(habit.name)}</span>
                <span class="dash-habit-streak">🔥 ${toAr(streak)} يوم</span>
              </div>
              <span class="btn btn-primary btn-sm">إكمال ✓</span>
            </div>`;
          }).join(''):'<div class="dash-empty-compact dash-empty-success">✓ كل العادات مكتملة اليوم</div>'}
          <button class="btn btn-ghost btn-sm" onclick="goPage('habits')" style="width:100%;margin-top:10px;justify-content:center">عرض كل العادات ←</button>
        </div>
      </div>
      
      <!-- Weekly Stats -->
      <div class="dash-stats-row">
        <div class="stat-card"><div class="stat-label">إنجاز العادات</div><div class="stat-value">${toAr(habitRateThisWeek)}٪</div><div class="stat-change stat-up">هذا الأسبوع</div></div>
        <div class="stat-card"><div class="stat-label">مهام منجزة</div><div class="stat-value">${toAr(completedToday)}</div><div class="stat-change stat-neutral">اليوم</div></div>
      </div>
    </div>
  </div>`;
}

function renderAuthGate(){
  return `<section class="auth-gate hidden" id="auth-gate" aria-hidden="true">
    <div class="auth-gate-shell">
      <div class="auth-gate-hero">
        <div class="auth-gate-brand">Personal trackers</div>
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
    <div class="logo-mark">Personal trackers</div>
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
  const mobileCoreNav = [
    {page:'home',icon:'🏠',label:'الرئيسية'},
    {page:'tasks',icon:'✅',label:'المهام'},
    {page:'habits',icon:'◎',label:'العادات'},
    {page:'money',icon:'💰',label:'مصروف'},
    {page:'more',icon:'⋯',label:'المزيد', isMoreBtn: true}
  ];

  return `<div class="mobile-shell">
    <div class="mobile-topbar">
      <div class="mobile-topbar-row">
        <div class="mobile-brand">Sama</div>
        <div class="mobile-topbar-right">
          <span class="mobile-date-compact" id="m-date">—</span>
          <div class="sync-indicator syncing mobile-sync" id="sync-indicator-mobile"><span class="sync-dot"></span></div>
        </div>
      </div>
    </div>
  </div>
  <nav class="mobile-bottom-nav" aria-label="أقسام النظام">
    <div class="mobile-nav-track">
      ${mobileCoreNav.map(item=>`
        <button class="mobile-nav-btn ${item.page==='home'?'active':''}" type="button" onclick="${item.isMoreBtn ? 'openSidebarMobile()' : `goPage('${item.page}')`}" data-page="${item.page}">
          <span class="mobile-nav-icon">${item.icon}</span>
          <span>${item.label}</span>
        </button>
      `).join('')}
    </div>
  </nav>
  <div class="mobile-hidden-ids" style="display:none">
    <span id="m-energy-mini"></span>
    <span id="m-time"></span>
    <span id="m-xp-level"></span>
    <span id="m-xp-mini"></span>
    <div id="m-xp-bar"></div>
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
      <div class="db-stat-item"><span class="db-stat-icon">💰</span> <span id="stat-savings-mini">${formatMoneyValue(0,getMoneyCurrency())}</span></div>
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
    <div class="dashboard-mobile-view hide-on-desktop">
      ${renderMobileDashboard()}
    </div>
    <div class="dashboard-desktop-view hide-on-mobile">
      ${renderDesktopDashboard()}
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
  const moneyCurrency=getMoneyCurrency();
  return `<div class="page" id="page-money">
  <div class="page-header">
    <div class="page-header-row">
      <div>
        <div class="page-title">المصاريف والتحويش</div>
        <div class="page-subtitle">١٠٪ فورًا عند استلام الفلوس — القاعدة الذهبية</div>
      </div>
      <div class="page-tools">
        <select class="inp" id="m-currency" onchange="setMoneyCurrency(this.value)" style="min-width:170px">${renderCurrencyOptions(moneyCurrency)}</select>
        <button class="btn btn-ghost btn-sm" onclick="exportExpensesCsv()">⬇ تصدير CSV</button>
      </div>
    </div>
  </div>
  <div class="page-subtitle" id="m-currency-note" style="margin-bottom:12px;color:var(--text3)">العملة الحالية: ${escapeHtml(getCurrencyLabel(moneyCurrency))}</div>
  <div class="grid-3" style="margin-bottom:16px">
    <div class="money-stat">
      <div class="ms-label">الرصيد المتاح</div>
      <div class="ms-val" id="m-balance">٠</div>
      <div class="ms-sub" id="m-balance-sub">${escapeHtml(getCurrencyLabel(moneyCurrency))} (دخل - مصاريف)</div>
      <div class="prog-wrap"><div class="prog-fill prog-green" id="m-balance-bar" style="width:0%"></div></div>
    </div>
    <div class="money-stat">
      <div class="ms-label">دخل الشهر</div>
      <div class="ms-val" id="m-income">٠</div>
      <div class="ms-sub" id="m-income-sub" style="color:var(--green)">${escapeHtml(getCurrencyLabel(moneyCurrency))} مكتسب</div>
      <div class="money-summary-row" style="margin-top:8px;cursor:pointer" onclick="openSavingsGoalModal()"><span style="color:var(--text3)" id="m-savings-goal-text">التحويش المستهدف: ${formatMoneyValue(Math.max(0,Number(S.savingsGoal)||0),moneyCurrency)}</span><span id="m-savings-wrap"><b id="m-savings-nav">${formatMoneyValue(0,moneyCurrency)}</b></span></div>
      <div class="prog-wrap"><div class="prog-fill prog-gold" id="m-savings-bar" style="width:0%"></div></div>
    </div>
    <div class="money-stat">
      <div class="ms-label">مصاريف الشهر</div>
      <div class="ms-val" id="m-total">٠</div>
      <div class="ms-sub" id="m-total-sub" style="color:var(--red)">${escapeHtml(getCurrencyLabel(moneyCurrency))} مصروف</div>
      <div class="money-cats" id="m-cats"></div>
    </div>
  </div>
  <div class="card" style="margin-bottom:16px">
    <div class="section-label">تسجيل عملية</div>
    <div class="money-form">
      <input type="number" class="inp" id="m-amount" placeholder="المبلغ (${escapeHtml(getCurrencyMeta(moneyCurrency).symbol)})" style="flex:1;min-width:100px">
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
    <div class="page-subtitle">كيف تستخدمين Personal trackers لتحقيق أقصى استفادة وبناء حياة متوازنة؟</div>
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
        <div class="page-subtitle">متابعة المستخدمين وبياناتهم من داخل Personal trackers</div>
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

function renderQuickAddModal(){
  return `<div class="quick-add-modal" id="quick-add-modal" style="display:none;">
  <div class="quick-add-container">
    <input id="quick-add-input" type="text" placeholder="أضيفي مهمة أو عادة..." class="quick-add-input" 
           onkeydown="if(event.key==='Enter')submitQuickAdd();if(event.key==='Escape')closeQuickAdd();">
    <div class="quick-add-hints">
      <div class="hint">💡 ابدأي بـ # للعادات</div>
      <div class="hint">📝 أو اكتبي المهمة مباشرة</div>
      <div class="hint">ESC للإغلاق</div>
    </div>
  </div>
</div>`;
}

function renderShellOverlays(){
  return `${renderQuickAddModal()}<div class="modal-overlay" id="modal-overlay" onclick="closeModal(event)">
  <div class="modal" id="modal-box">
    <div class="modal-title" id="modal-title"></div>
    <div id="modal-body"></div>
    <div class="modal-btns" id="modal-btns"></div>
  </div>
</div>
<div class="toast" id="toast"></div>
<div class="xp-toast" id="xp-toast"></div>
<div class="loading-overlay hidden" id="app-loading">
  <div class="loading-box">
    <div class="loading-spinner"></div>
    <div class="loading-title">جاري تجهيز Personal trackers...</div>
    <div class="loading-sub">Checking your session...</div>
  </div>
</div>`;
}

function renderAppShell(){
  const root=document.getElementById('app-root');
  if(!root)return;
  
  const currentUser=typeof getCurrentFirebaseUser==='function'?getCurrentFirebaseUser():null;
  const isAuthenticated=Boolean(currentUser&&currentUser.uid);
  const isOnboarding=isAuthenticated&&S.onboarding&&!S.onboarding.completed&&!S.onboarding.skipped;
  
  if(isOnboarding){
    root.innerHTML=`${renderOnboardingFlow()}${renderShellOverlays()}`;
    return;
  }
  
  root.innerHTML=`${renderAuthGate()}<div class="app-shell hidden" id="app-shell" aria-hidden="true"><div class="app">${renderDesktopSidebar()}<main class="main">${renderMobileShell()}${renderPages()}</main></div></div>${renderShellOverlays()}`;
}
