const ADMIN_COLLECTION_DEFS=[
  {
    key:'weeklyReviews',
    path:'weekly_reviews',
    label:'المراجعة الأسبوعية',
    empty:'لا توجد مراجعات أسبوعية لهذا المستخدم.',
    columns:[
      {label:'الأسبوع',value:row=>row.dateKey},
      {label:'اللي نجح',value:row=>row.q1},
      {label:'اللي مجاش صح',value:row=>row.q2},
      {label:'التغيير القادم',value:row=>row.q3},
      {label:'أهم درس',value:row=>row.q4},
      {label:'الإنشاء',value:row=>row.createdAt},
    ],
  },
  {
    key:'tasks',
    path:'tasks',
    label:'المهام',
    empty:'لا توجد مهام لهذا المستخدم.',
    columns:[
      {label:'العنوان',value:row=>row.title},
      {label:'الحالة',value:row=>row.done?'مكتملة':'مفتوحة'},
      {label:'الأولوية',value:row=>row.priority},
      {label:'التاريخ',value:row=>row.dateKey},
      {label:'الإنشاء',value:row=>row.createdAt},
    ],
  },
  {
    key:'habits',
    path:'habits',
    label:'العادات',
    empty:'لا توجد عادات لهذا المستخدم.',
    columns:[
      {label:'الاسم',value:row=>row.name},
      {label:'السلسلة',value:row=>adminHabitStreak(row.doneDates)},
      {label:'نشطة اليوم',value:row=>adminHabitActive(row.doneDates)?'نعم':'لا'},
      {label:'الأيام المنجزة',value:row=>adminArrayValue(row.doneDates)},
      {label:'آخر تحديث',value:row=>row.updatedAt||row.createdAt},
    ],
  },
  {
    key:'goals',
    path:'goals',
    label:'الأهداف',
    empty:'لا توجد أهداف لهذا المستخدم.',
    columns:[
      {label:'العنوان',value:row=>row.title},
      {label:'التقدم',value:row=>`${Number(row.percentage||row.progressPct||0)}%`},
      {label:'الحالة',value:row=>row.status||adminGoalStatus(row)},
      {label:'الموعد',value:row=>row.deadline},
    ],
  },
  {
    key:'problems',
    path:'problems',
    label:'المشاكل',
    empty:'لا توجد مشاكل لهذا المستخدم.',
    columns:[
      {label:'العنوان',value:row=>row.title},
      {label:'الحل',value:row=>row.solution},
      {label:'الحالة',value:row=>row.status},
      {label:'الإنشاء',value:row=>row.createdAt},
    ],
  },
  {
    key:'expenses',
    path:'expenses',
    label:'المصاريف',
    empty:'لا توجد مصاريف لهذا المستخدم.',
    columns:[
      {label:'المبلغ',value:row=>adminMoneyValue(row.amount,row.currency)},
      {label:'الفئة',value:row=>row.category},
      {label:'التاريخ',value:row=>row.dateKey},
      {label:'ملاحظة',value:row=>row.note},
    ],
  },
  {
    key:'notes',
    path:'notes',
    label:'الملاحظات',
    empty:'لا توجد ملاحظات لهذا المستخدم.',
    columns:[
      {label:'العنوان',value:row=>row.title},
      {label:'المحتوى',value:row=>row.content||row.body},
      {label:'الإنشاء',value:row=>row.createdAt},
    ],
  },
  {
    key:'journalEntries',
    path:'journal_entries',
    label:'اليومية',
    empty:'لا توجد يوميات لهذا المستخدم.',
    columns:[
      {label:'التاريخ',value:row=>row.dateKey},
      {label:'المحتوى',value:row=>row.content},
      {label:'الامتنان',value:row=>adminJournalGratitude(row)},
      {label:'المزاج',value:row=>row.mood},
      {label:'الطاقة',value:row=>row.energy},
      {label:'الإنشاء',value:row=>row.createdAt},
    ],
  },
];

const ADMIN_STATE={
  accessResolved:false,
  accessLoading:false,
  currentUid:null,
  currentUserDoc:null,
  isAdmin:false,
  users:[],
  usersLoaded:false,
  usersLoading:false,
  listError:'',
  detailsLoading:false,
  detailError:'',
  detailCache:{},
  selectedUid:'',
  search:'',
  activeTab:'journalEntries',
};

function adminCollectionKeySet(){
  return new Set(ADMIN_COLLECTION_DEFS.map(item=>item.key));
}

function adminResetState(){
  ADMIN_STATE.users=[];
  ADMIN_STATE.usersLoaded=false;
  ADMIN_STATE.usersLoading=false;
  ADMIN_STATE.listError='';
  ADMIN_STATE.detailsLoading=false;
  ADMIN_STATE.detailError='';
  ADMIN_STATE.detailCache={};
  ADMIN_STATE.selectedUid='';
  ADMIN_STATE.search='';
  ADMIN_STATE.activeTab='journalEntries';
}

function hasAdminAccess(){
  return Boolean(ADMIN_STATE.isAdmin);
}

function adminOnlyElements(){
  return Array.from(document.querySelectorAll('[data-admin-only]'));
}

function adminCurrentPageIsActive(){
  const page=document.getElementById('page-admin');
  return Boolean(page&&page.classList.contains('active'));
}

function adminSyncAccessUi(){
  const visible=hasAdminAccess();
  adminOnlyElements().forEach(element=>element.classList.toggle('hidden',!visible));
  if(!visible&&adminCurrentPageIsActive()&&typeof goPage==='function'){
    goPage('home');
  }
}

function adminNormalizeUserDoc(source){
  const row=source&&typeof source==='object'?source:{};
  const uid=String(row.id||row.uid||'');
  const xp=Number(row.xp)||0;
  const level=Number(row.level)||computeLevel(xp);
  return {
    uid,
    email:String(row.email||''),
    displayName:String(row.displayName||row.email||'مستخدم بدون اسم'),
    role:String(row.role||'user'),
    level,
    xp,
    energy:Number(row.energy??5),
    savingsGoal:Number(row.savingsGoal)||0,
    timezone:String(row.timezone||row.settings&&row.settings.timezone||'UTC'),
    providerId:String(row.providerId||'password'),
    createdAt:String(row.createdAt||''),
    updatedAt:String(row.updatedAt||''),
    lastLoginAt:String(row.lastLoginAt||''),
    weekly:row.weekly&&typeof row.weekly==='object'?row.weekly:{w1:'',w2:'',w3:'',w4:''},
    weeklyChallenge:String(row.weeklyChallenge||''),
    weeklyChallengeProgress:Number(row.weeklyChallengeProgress)||0,
    weeklyChallengeDone:Boolean(row.weeklyChallengeDone),
    settings:row.settings&&typeof row.settings==='object'?{
      ...row.settings,
      currency:normalizeCurrencyCode(row.settings.currency),
    }:{language:'ar',fontScale:1,currency:DEFAULT_MONEY_CURRENCY},
    pomodoro:row.pomodoro&&typeof row.pomodoro==='object'?row.pomodoro:{mode:'focus',running:false,remainingSec:0,totalSessions:0},
  };
}

function adminSortUsers(list){
  return [...list].sort((a,b)=>{
    const lastA=String(a.lastLoginAt||a.updatedAt||a.createdAt||'');
    const lastB=String(b.lastLoginAt||b.updatedAt||b.createdAt||'');
    return lastB.localeCompare(lastA)||String(a.displayName).localeCompare(String(b.displayName));
  });
}

function adminFormatDateTime(value){
  const text=String(value||'').trim();
  if(!text)return '—';
  const date=new Date(text);
  if(Number.isNaN(date.getTime()))return escapeHtml(text);
  return escapeHtml(new Intl.DateTimeFormat(lang()==='en'?'en-GB':'ar-EG',{
    year:'numeric',
    month:'short',
    day:'numeric',
    hour:'2-digit',
    minute:'2-digit',
  }).format(date));
}

function adminTextValue(value){
  const text=String(value??'').trim();
  return text?escapeHtml(text):'—';
}

function adminBoolValue(value){
  return value?'نعم':'لا';
}

function adminArrayValue(value){
  if(!Array.isArray(value)||!value.length)return '—';
  return escapeHtml(value.map(item=>String(item)).join('، '));
}

function adminMoneyValue(value,currencyCode){
  const amount=Number(value);
  if(!Number.isFinite(amount))return '—';
  return escapeHtml(formatMoneyValue(amount,normalizeCurrencyCode(currencyCode)));
}

function adminJournalGratitude(row){
  const items=[row&&row.gratitude1,row&&row.gratitude2,row&&row.gratitude3].filter(Boolean);
  return items.length?items.join(' | '):'—';
}

function adminJournalMoodMeta(value){
  const numericMood=Number(value);
  if(Array.isArray(window.JOURNAL_MOOD_OPTIONS)){
    const match=window.JOURNAL_MOOD_OPTIONS.find(option=>Number(option.value)===numericMood);
    if(match)return `${match.emoji} ${match.label}`;
  }
  return String(value??'—');
}

function adminGoalStatus(goal){
  const pct=Number(goal&&goal.percentage||goal&&goal.progressPct||0);
  if(pct>=100)return 'done';
  return 'active';
}

function adminHabitStreak(doneDates){
  if(!Array.isArray(doneDates)||!doneDates.length)return 0;
  const sorted=[...new Set(doneDates.map(date=>String(date)).filter(Boolean))].sort().reverse();
  let streak=1;
  let previous=sorted[0];
  for(let index=1;index<sorted.length;index+=1){
    const current=sorted[index];
    if(shiftDateKey(current,1)===previous){
      streak+=1;
      previous=current;
      continue;
    }
    break;
  }
  return streak;
}

function adminHabitActive(doneDates){
  return Array.isArray(doneDates)&&doneDates.includes(todayKey());
}

function adminLatestActivity(profile,collections){
  const values=[
    profile.lastLoginAt,
    profile.updatedAt,
    profile.createdAt,
  ];
  ADMIN_COLLECTION_DEFS.forEach(def=>{
    (collections[def.key]||[]).forEach(row=>{
      values.push(String(row.updatedAt||row.createdAt||row.dateKey||''));
    });
  });
  return values.filter(Boolean).sort().at(-1)||'';
}

function adminCurrentDetail(){
  return ADMIN_STATE.selectedUid?ADMIN_STATE.detailCache[ADMIN_STATE.selectedUid]||null:null;
}

async function requestAdminAccessRefresh(force=false){
  const currentUid=typeof getCurrentFirebaseUid==='function'?getCurrentFirebaseUid():null;
  if(!currentUid){
    ADMIN_STATE.accessResolved=true;
    ADMIN_STATE.accessLoading=false;
    ADMIN_STATE.currentUid=null;
    ADMIN_STATE.currentUserDoc=null;
    ADMIN_STATE.isAdmin=false;
    adminResetState();
    adminSyncAccessUi();
    return null;
  }
  if(!force&&ADMIN_STATE.accessResolved&&ADMIN_STATE.currentUid===currentUid){
    adminSyncAccessUi();
    return ADMIN_STATE.currentUserDoc;
  }
  ADMIN_STATE.accessLoading=true;
  ADMIN_STATE.currentUid=currentUid;
  adminSyncAccessUi();
  try{
    const userDoc=await getUserRootDoc(currentUid);
    if((typeof getCurrentFirebaseUid==='function'?getCurrentFirebaseUid():null)!==currentUid)return null;
    ADMIN_STATE.currentUserDoc=adminNormalizeUserDoc(userDoc||{id:currentUid});
    ADMIN_STATE.isAdmin=ADMIN_STATE.currentUserDoc.role==='admin';
    ADMIN_STATE.accessResolved=true;
    ADMIN_STATE.accessLoading=false;
    if(!ADMIN_STATE.isAdmin){
      adminResetState();
    }
    adminSyncAccessUi();
    if(ADMIN_STATE.isAdmin&&adminCurrentPageIsActive()){
      renderAdmin();
    }
    return ADMIN_STATE.currentUserDoc;
  }catch(error){
    console.warn('Admin access check failed.',error);
    ADMIN_STATE.accessResolved=true;
    ADMIN_STATE.accessLoading=false;
    ADMIN_STATE.isAdmin=false;
    ADMIN_STATE.currentUserDoc=null;
    adminResetState();
    adminSyncAccessUi();
    return null;
  }
}

function adminFilteredUsers(){
  const query=String(ADMIN_STATE.search||'').trim().toLowerCase();
  if(!query)return ADMIN_STATE.users;
  return ADMIN_STATE.users.filter(user=>{
    return [
      user.displayName,
      user.email,
      user.uid,
    ].some(value=>String(value||'').toLowerCase().includes(query));
  });
}

function adminRenderUserList(){
  const listEl=document.getElementById('admin-user-list');
  const metaEl=document.getElementById('admin-list-meta');
  const searchEl=document.getElementById('admin-user-search');
  if(!listEl||!metaEl)return;
  if(searchEl&&searchEl.value!==ADMIN_STATE.search)searchEl.value=ADMIN_STATE.search;
  if(ADMIN_STATE.usersLoading){
    metaEl.textContent='جاري تحميل المستخدمين...';
    listEl.innerHTML='<div class="admin-empty">جاري تحميل قائمة المستخدمين...</div>';
    return;
  }
  if(ADMIN_STATE.listError){
    metaEl.textContent='تعذر تحميل المستخدمين';
    listEl.innerHTML=`<div class="admin-empty">${escapeHtml(ADMIN_STATE.listError)}</div>`;
    return;
  }
  const users=adminFilteredUsers();
  metaEl.textContent=`${users.length} / ${ADMIN_STATE.users.length} مستخدم`;
  if(!users.length){
    listEl.innerHTML='<div class="admin-empty">لا يوجد مستخدمون مطابقون لنتيجة البحث.</div>';
    return;
  }
  listEl.innerHTML=users.map(user=>{
    const selected=user.uid===ADMIN_STATE.selectedUid?' selected':'';
    const roleChip=user.role==='admin'?'<span class="chip chip-gold">admin</span>':'';
    return `<button class="admin-user-item${selected}" type="button" onclick="selectAdminUser('${escapeHtml(user.uid)}')">
      <div class="admin-user-row">
        <div class="admin-user-name">${escapeHtml(user.displayName)}</div>
        <div class="admin-user-role">${roleChip}</div>
      </div>
      <div class="admin-user-email">${adminTextValue(user.email)}</div>
      <div class="admin-user-stats">
        <span>Level ${escapeHtml(String(user.level))}</span>
        <span>XP ${escapeHtml(String(user.xp))}</span>
        <span>طاقة ${escapeHtml(String(user.energy))}</span>
      </div>
      <div class="admin-user-dates">
        <span>إنشاء: ${adminFormatDateTime(user.createdAt)}</span>
        <span>آخر دخول: ${adminFormatDateTime(user.lastLoginAt)}</span>
      </div>
    </button>`;
  }).join('');
}

function adminDetailInfoCard(title,items){
  return `<div class="admin-info-card">
    <div class="admin-section-title">${escapeHtml(title)}</div>
    <div class="admin-kv-grid">
      ${items.map(item=>`<div class="admin-kv-item"><span>${escapeHtml(item.label)}</span><strong>${item.value}</strong></div>`).join('')}
    </div>
  </div>`;
}

function adminRenderSummaryCards(detail){
  const counts=detail.counts;
  return `<div class="admin-summary-grid">
    <div class="admin-summary-card"><span>اليومية</span><strong>${escapeHtml(String(counts.journalEntries))}</strong></div>
    <div class="admin-summary-card"><span>الأسبوعي</span><strong>${escapeHtml(String(counts.weeklyReviews))}</strong></div>
    <div class="admin-summary-card"><span>المهام</span><strong>${escapeHtml(String(counts.tasks))}</strong></div>
    <div class="admin-summary-card"><span>العادات</span><strong>${escapeHtml(String(counts.habits))}</strong></div>
    <div class="admin-summary-card"><span>الأهداف</span><strong>${escapeHtml(String(counts.goals))}</strong></div>
    <div class="admin-summary-card"><span>المشاكل</span><strong>${escapeHtml(String(counts.problems))}</strong></div>
    <div class="admin-summary-card"><span>المصاريف</span><strong>${escapeHtml(String(counts.expenses))}</strong></div>
    <div class="admin-summary-card"><span>الملاحظات</span><strong>${escapeHtml(String(counts.notes))}</strong></div>
  </div>`;
}

function adminRenderPriorityPanels(detail){
  const latestJournal=(detail.collections.journalEntries||[])[0]||null;
  const latestWeekly=(detail.collections.weeklyReviews||[])[0]||null;
  return `<div class="admin-priority-grid">
    <div class="admin-priority-card">
      <div class="admin-section-head">
        <div>
          <div class="admin-section-title">آخر يومية</div>
          <div class="admin-card-sub">المحتوى الذي كتبه المستخدم اليوم أو آخر 7 أيام</div>
        </div>
        ${latestJournal?`<span class="chip chip-blue">${escapeHtml(adminJournalMoodMeta(latestJournal.mood))}</span>`:''}
      </div>
      ${latestJournal?`
        <div class="admin-priority-meta">التاريخ: ${adminTextValue(latestJournal.dateKey)} · الطاقة: ${adminTextValue(latestJournal.energy)}/10</div>
        <div class="admin-priority-body">${adminTextValue(latestJournal.content)}</div>
        <div class="admin-priority-list">
          ${[latestJournal.gratitude1,latestJournal.gratitude2,latestJournal.gratitude3].filter(Boolean).map(item=>`<div class="admin-priority-item">ممتنة لـ: ${escapeHtml(item)}</div>`).join('')||'<div class="admin-priority-item muted">لا توجد عناصر امتنان.</div>'}
        </div>
      `:'<div class="admin-empty">لا توجد يوميات محفوظة لهذا المستخدم بعد.</div>'}
    </div>
    <div class="admin-priority-card">
      <div class="admin-section-head">
        <div>
          <div class="admin-section-title">آخر مراجعة أسبوعية</div>
          <div class="admin-card-sub">أهم ما كتبه المستخدم في مراجعة الأسبوع</div>
        </div>
      </div>
      ${latestWeekly?`
        <div class="admin-priority-meta">الأسبوع: ${adminTextValue(latestWeekly.dateKey)}</div>
        <div class="admin-priority-list">
          <div class="admin-priority-item"><strong>نجح:</strong> ${adminTextValue(latestWeekly.q1)}</div>
          <div class="admin-priority-item"><strong>لم ينجح:</strong> ${adminTextValue(latestWeekly.q2)}</div>
          <div class="admin-priority-item"><strong>سيغير:</strong> ${adminTextValue(latestWeekly.q3)}</div>
          <div class="admin-priority-item"><strong>الدرس:</strong> ${adminTextValue(latestWeekly.q4)}</div>
        </div>
      `:'<div class="admin-empty">لا توجد مراجعات أسبوعية محفوظة لهذا المستخدم بعد.</div>'}
    </div>
  </div>`;
}

function adminRenderTabs(detail){
  return `<div class="admin-tabs">
    ${ADMIN_COLLECTION_DEFS.map(def=>{
      const selected=ADMIN_STATE.activeTab===def.key?' active':'';
      return `<button class="admin-tab-btn${selected}" type="button" onclick="setAdminTab('${def.key}')">${escapeHtml(def.label)} <span>${escapeHtml(String(detail.counts[def.key]||0))}</span></button>`;
    }).join('')}
  </div>`;
}

function adminRenderCollectionTable(def,rows){
  if(!rows.length){
    return `<div class="admin-empty">${escapeHtml(def.empty)}</div>`;
  }
  return `<div class="admin-table-wrap">
    <table class="admin-table">
      <thead>
        <tr>${def.columns.map(column=>`<th>${escapeHtml(column.label)}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${rows.map(row=>`<tr>${def.columns.map(column=>`<td>${adminTextValue(column.value(row))}</td>`).join('')}</tr>`).join('')}
      </tbody>
    </table>
  </div>`;
}

function adminRenderDetail(detail){
  const root=document.getElementById('admin-detail-root');
  if(!root)return;
  if(ADMIN_STATE.detailsLoading){
    root.innerHTML='<div class="admin-empty">جاري تحميل تفاصيل المستخدم...</div>';
    return;
  }
  if(ADMIN_STATE.detailError){
    root.innerHTML=`<div class="admin-empty">${escapeHtml(ADMIN_STATE.detailError)}</div>`;
    return;
  }
  if(!detail){
    root.innerHTML='<div class="admin-empty">اختاري مستخدمًا من القائمة لعرض التفاصيل.</div>';
    return;
  }
  const profile=detail.profile;
  const weekly=profile.weekly||{};
  const settings=profile.settings||{};
  const pomodoro=profile.pomodoro||{};
  const activeDef=ADMIN_COLLECTION_DEFS.find(def=>def.key===ADMIN_STATE.activeTab)||ADMIN_COLLECTION_DEFS[0];
  root.innerHTML=`<div class="admin-detail-head">
    <div>
      <div class="admin-detail-title">${escapeHtml(profile.displayName)}</div>
      <div class="admin-detail-sub">${adminTextValue(profile.email)} · آخر نشاط: ${adminFormatDateTime(detail.lastActivityAt)}</div>
    </div>
    <div class="page-tools">
      <button class="btn btn-ghost btn-sm" type="button" onclick="refreshAdminSelectedUser()">تحديث المستخدم</button>
    </div>
  </div>
  ${adminRenderPriorityPanels(detail)}
  ${adminRenderSummaryCards(detail)}
  <div class="admin-detail-grid">
    ${adminDetailInfoCard('Profile',[
      {label:'uid',value:adminTextValue(profile.uid)},
      {label:'email',value:adminTextValue(profile.email)},
      {label:'displayName',value:adminTextValue(profile.displayName)},
      {label:'level',value:adminTextValue(profile.level)},
      {label:'xp',value:adminTextValue(profile.xp)},
      {label:'energy',value:adminTextValue(profile.energy)},
      {label:'savingsGoal',value:adminMoneyValue(profile.savingsGoal,profile.settings&&profile.settings.currency)},
      {label:'timezone',value:adminTextValue(profile.timezone)},
      {label:'providerId',value:adminTextValue(profile.providerId)},
      {label:'createdAt',value:adminFormatDateTime(profile.createdAt)},
      {label:'updatedAt',value:adminFormatDateTime(profile.updatedAt)},
      {label:'lastLoginAt',value:adminFormatDateTime(profile.lastLoginAt)},
    ])}
    ${adminDetailInfoCard('Weekly',[
      {label:'weekly.w1',value:adminTextValue(weekly.w1)},
      {label:'weekly.w2',value:adminTextValue(weekly.w2)},
      {label:'weekly.w3',value:adminTextValue(weekly.w3)},
      {label:'weekly.w4',value:adminTextValue(weekly.w4)},
      {label:'weeklyChallenge',value:adminTextValue(profile.weeklyChallenge)},
      {label:'weeklyChallengeProgress',value:adminTextValue(profile.weeklyChallengeProgress)},
      {label:'weeklyChallengeDone',value:adminTextValue(adminBoolValue(profile.weeklyChallengeDone))},
    ])}
    ${adminDetailInfoCard('Settings',[
      {label:'language',value:adminTextValue(settings.language)},
      {label:'fontScale',value:adminTextValue(settings.fontScale)},
      {label:'currency',value:adminTextValue(settings.currency)},
      {label:'timezone',value:adminTextValue(settings.timezone||profile.timezone)},
    ])}
    ${adminDetailInfoCard('Pomodoro',[
      {label:'mode',value:adminTextValue(pomodoro.mode)},
      {label:'running',value:adminTextValue(adminBoolValue(Boolean(pomodoro.running)))},
      {label:'remainingSec',value:adminTextValue(pomodoro.remainingSec)},
      {label:'totalSessions',value:adminTextValue(pomodoro.totalSessions)},
    ])}
  </div>
  <div class="admin-section-block">
    <div class="admin-section-head">
      <div class="admin-section-title">بيانات المستخدم</div>
      <div class="admin-card-sub">تابعي كل subcollections المهمة بسرعة</div>
    </div>
    ${adminRenderTabs(detail)}
    ${adminRenderCollectionTable(activeDef,detail.collections[activeDef.key]||[])}
  </div>`;
}

async function loadAdminUsers(force=false){
  if(!hasAdminAccess())return [];
  if(ADMIN_STATE.usersLoading&&!force)return ADMIN_STATE.users;
  if(ADMIN_STATE.usersLoaded&&!force){
    adminRenderUserList();
    return ADMIN_STATE.users;
  }
  ADMIN_STATE.usersLoading=true;
  ADMIN_STATE.listError='';
  adminRenderUserList();
  try{
    const snapshot=await getUsersCollectionRef().get();
    const users=adminSortUsers(snapshot.docs.map(doc=>adminNormalizeUserDoc({id:doc.id,...doc.data()})));
    ADMIN_STATE.users=users;
    ADMIN_STATE.usersLoaded=true;
    if(!ADMIN_STATE.selectedUid||!users.some(user=>user.uid===ADMIN_STATE.selectedUid)){
      ADMIN_STATE.selectedUid=users[0]?users[0].uid:'';
    }
    adminRenderUserList();
    if(ADMIN_STATE.selectedUid){
      await loadAdminUserDetails(ADMIN_STATE.selectedUid,{force});
    }else{
      adminRenderDetail(null);
    }
    return users;
  }catch(error){
    console.warn('Admin users loading failed.',error);
    ADMIN_STATE.listError='تعذر تحميل المستخدمين. تأكدي من قواعد Firestore وصلاحية admin.';
    adminRenderUserList();
    return [];
  }finally{
    ADMIN_STATE.usersLoading=false;
    adminRenderUserList();
  }
}

function adminSortRows(rows,keyName='createdAt'){
  return [...rows].sort((a,b)=>{
    const left=String(a[keyName]||a.updatedAt||a.dateKey||'');
    const right=String(b[keyName]||b.updatedAt||b.dateKey||'');
    return right.localeCompare(left);
  });
}

async function loadAdminUserDetails(uid,{force=false}={}){
  if(!hasAdminAccess()||!uid)return null;
  if(!force&&ADMIN_STATE.detailCache[uid]){
    ADMIN_STATE.selectedUid=uid;
    adminRenderUserList();
    adminRenderDetail(ADMIN_STATE.detailCache[uid]);
    return ADMIN_STATE.detailCache[uid];
  }
  ADMIN_STATE.selectedUid=uid;
  ADMIN_STATE.detailsLoading=true;
  ADMIN_STATE.detailError='';
  adminRenderUserList();
  adminRenderDetail(null);
  try{
    const [
      userDoc,
      tasks,
      habits,
      goals,
      problems,
      expenses,
      notes,
      weeklyReviews,
      journalEntries,
    ]=await Promise.all([
      getUserRootDoc(uid),
      getUserCollectionDocs(uid,'tasks'),
      getUserCollectionDocs(uid,'habits'),
      getUserCollectionDocs(uid,'goals'),
      getUserCollectionDocs(uid,'problems'),
      getUserCollectionDocs(uid,'expenses'),
      getUserCollectionDocs(uid,'notes'),
      getUserCollectionDocs(uid,'weekly_reviews'),
      getUserCollectionDocs(uid,'journal_entries'),
    ]);
    const profile=adminNormalizeUserDoc(userDoc||{id:uid});
    const collections={
      weeklyReviews:adminSortRows(weeklyReviews,'createdAt'),
      tasks:adminSortRows(tasks,'createdAt'),
      habits:adminSortRows(habits,'updatedAt'),
      goals:adminSortRows(goals,'updatedAt'),
      problems:adminSortRows(problems,'createdAt'),
      expenses:adminSortRows(expenses,'createdAt'),
      notes:adminSortRows(notes,'createdAt'),
      journalEntries:adminSortRows(journalEntries,'createdAt'),
    };
    const detail={
      uid,
      profile,
      collections,
      counts:Object.fromEntries(Object.entries(collections).map(([key,value])=>[key,Array.isArray(value)?value.length:0])),
      lastActivityAt:adminLatestActivity(profile,collections),
    };
    ADMIN_STATE.detailCache[uid]=detail;
    if(!adminCollectionKeySet().has(ADMIN_STATE.activeTab))ADMIN_STATE.activeTab='journalEntries';
    adminRenderUserList();
    adminRenderDetail(detail);
    return detail;
  }catch(error){
    console.warn('Admin user details loading failed.',error);
    ADMIN_STATE.detailError='تعذر تحميل تفاصيل هذا المستخدم.';
    adminRenderDetail(null);
    return null;
  }finally{
    ADMIN_STATE.detailsLoading=false;
    adminRenderDetail(adminCurrentDetail());
  }
}

function updateAdminUserSearch(value){
  ADMIN_STATE.search=String(value||'').trim();
  adminRenderUserList();
}

function selectAdminUser(uid){
  if(!uid||!hasAdminAccess())return;
  ADMIN_STATE.selectedUid=String(uid);
  loadAdminUserDetails(ADMIN_STATE.selectedUid);
}

function setAdminTab(key){
  if(!adminCollectionKeySet().has(String(key)))return;
  ADMIN_STATE.activeTab=String(key);
  adminRenderDetail(adminCurrentDetail());
}

async function refreshAdminSelectedUser(){
  if(!ADMIN_STATE.selectedUid)return;
  await loadAdminUserDetails(ADMIN_STATE.selectedUid,{force:true});
}

async function refreshAdminDashboard(){
  if(!hasAdminAccess())return;
  ADMIN_STATE.detailCache={};
  ADMIN_STATE.usersLoaded=false;
  await loadAdminUsers(true);
}

function renderAdmin(){
  const page=document.getElementById('page-admin');
  if(!page)return;
  if(!hasAdminAccess()){
    const root=document.getElementById('admin-detail-root');
    const list=document.getElementById('admin-user-list');
    const meta=document.getElementById('admin-list-meta');
    if(meta)meta.textContent='هذه الصفحة متاحة للمشرف فقط.';
    if(list)list.innerHTML='<div class="admin-empty">هذه الصفحة متاحة فقط للمستخدمين الذين لديهم role = admin.</div>';
    if(root)root.innerHTML='<div class="admin-empty">لا توجد صلاحية لعرض لوحة التحكم.</div>';
    return;
  }
  adminRenderUserList();
  adminRenderDetail(adminCurrentDetail());
  if(!ADMIN_STATE.usersLoaded&&!ADMIN_STATE.usersLoading){
    loadAdminUsers();
  }else if(ADMIN_STATE.selectedUid&&!ADMIN_STATE.detailCache[ADMIN_STATE.selectedUid]&&!ADMIN_STATE.detailsLoading){
    loadAdminUserDetails(ADMIN_STATE.selectedUid);
  }
}

window.hasAdminAccess=hasAdminAccess;
window.requestAdminAccessRefresh=requestAdminAccessRefresh;
window.renderAdmin=renderAdmin;
window.selectAdminUser=selectAdminUser;
window.updateAdminUserSearch=updateAdminUserSearch;
window.setAdminTab=setAdminTab;
window.refreshAdminDashboard=refreshAdminDashboard;
window.refreshAdminSelectedUser=refreshAdminSelectedUser;
