function setLoadingVisible(show){const el=document.getElementById('app-loading');if(el)el.classList.toggle('hidden',!show);}
function setSyncIndicator(state){
  const textMap=LANG_STRINGS[lang()].sync;
  [['sync-indicator','sync-text'],['sync-indicator-mobile','sync-text-mobile']].forEach(([id,textId])=>{
    const el=document.getElementById(id);const txt=document.getElementById(textId);
    if(el){el.classList.remove('syncing','synced','offline');el.classList.add(state);}
    if(txt)txt.textContent=textMap[state]||textMap.syncing;
  });
}
function cacheKeyForUid(uid){
  return uid?`${KEY}_${uid}`:`${KEY}_guest`;
}
function saveCache(){
  try{
    const uid=typeof getPersistenceUid==='function'?getPersistenceUid():null;
    localStorage.setItem(cacheKeyForUid(uid),JSON.stringify(S));
  }catch(_err){}
}
function loadCache(){
  try{
    const uid=typeof getPersistenceUid==='function'?getPersistenceUid():null;
    const scopedRaw=localStorage.getItem(cacheKeyForUid(uid));
    const legacyRaw=uid?localStorage.getItem(KEY):null;
    const raw=scopedRaw||legacyRaw;
    return raw?JSON.parse(raw):null;
  }catch(_err){
    return null;
  }
}
function normalizeWeekEntry(entry,index=0){
  const createdAt=entry&&typeof entry==='object'?(entry.createdAt||entry.created_at):null;
  return {
    id:Number.isFinite(Number(entry&&entry.id))?Number(entry.id):generateNumericId()+index,
    date:normalizeDateKey(entry&&((entry.date)||(entry.week_date)),todayKey()),
    w1:String(entry&&((entry.w1)||(entry.q1))||''),
    w2:String(entry&&((entry.w2)||(entry.q2))||''),
    w3:String(entry&&((entry.w3)||(entry.q3))||''),
    w4:String(entry&&((entry.w4)||(entry.q4))||''),
    createdAt:String(createdAt||new Date().toISOString()),
  };
}
function normalizeTaskEntry(task,index=0){
  return {
    id:Number.isFinite(Number(task&&task.id))?Number(task.id):generateNumericId()+index,
    title:String(task&&task.title||''),
    priority:['urgent','important','normal'].includes(task&&task.priority)?task.priority:'normal',
    repeatType:['none','daily','weekly'].includes(task&&(task.repeatType||task.repeat_type))?(task.repeatType||task.repeat_type):'none',
    goalId:Number.isFinite(Number(task&&(task.goalId??task.goal_id)))?Number(task.goalId??task.goal_id):null,
    done:Boolean(task&&task.done),
    date:normalizeDateKey(task&&(task.date||task.task_date),todayKey()),
    createdAt:String(task&&(task.createdAt||task.created_at)||new Date().toISOString()),
  };
}
function normalizeJournalEntry(entry,index=0){
  return {
    id:Number.isFinite(Number(entry&&entry.id))?Number(entry.id):generateNumericId()+index,
    date:normalizeDateKey(entry&&(entry.date||entry.journal_date),todayKey()),
    content:String(entry&&entry.content||''),
    gratitude1:String(entry&&(entry.gratitude1||entry.gratitude_1)||''),
    gratitude2:String(entry&&(entry.gratitude2||entry.gratitude_2)||''),
    gratitude3:String(entry&&(entry.gratitude3||entry.gratitude_3)||''),
    energy:clamp(Math.round(Number(entry&&(entry.energy||entry.energy_level)||5)),1,10),
    mood:clamp(Math.round(Number(entry&&entry.mood||3)),1,6),
    createdAt:String(entry&&(entry.createdAt||entry.created_at)||new Date().toISOString()),
  };
}
function normalizeStateShape(source){
  const defaults=createDefaultState();
  const src=source&&typeof source==='object'?source:{};
  const normalized={
    energy:clamp(Number.isFinite(Number(src.energy))?Math.round(Number(src.energy)):defaults.energy,1,10),
    dayType:MVD_LISTS[src.dayType]?src.dayType:defaults.dayType,
    savingsGoal:Math.max(0,Math.round(Number.isFinite(Number(src.savingsGoal))?Number(src.savingsGoal):defaults.savingsGoal)),
    habits:[],
    expenses:[],
    problems:[],
    goals:[],
    tasks:[],
    journal:[],
    budgets:{},
    xp:Math.max(0,Math.round(Number(src.xp)||0)),
    level:1,
    onboarding:{
      completed:Boolean(src.onboarding&&src.onboarding.completed),
      step:Number(src.onboarding&&src.onboarding.step)||0,
      skipped:Boolean(src.onboarding&&src.onboarding.skipped),
    },
    weeklyChallenge:src.weeklyChallenge?String(src.weeklyChallenge):null,
    weeklyChallengeDone:Boolean(src.weeklyChallengeDone),
    weeklyChallengeProgress:Math.max(0,Number(src.weeklyChallengeProgress)||0),
    energyHistory:[],
    mvdDone:{},
    weekly:{w1:'',w2:'',w3:'',w4:''},
    weeklyHistory:[],
    moodLog:[],
    settings:{fontScale:1,language:'ar',currency:DEFAULT_MONEY_CURRENCY},
    pomodoro:{mode:'focus',remainingSec:1500,running:false,lastTickAt:null,sessionsToday:{},totalSessions:0},
  };
  
  const habitsSrc=Array.isArray(src.habits)?src.habits:defaults.habits;
  normalized.habits=habitsSrc.map((habit,index)=>({
    id:String(habit&&habit.id?habit.id:habit&&habit.name?habit.name.replace(/[^\w\u0600-\u06FF]+/g,'_'):'habit_'+(index+1)),
    name:String(habit&&habit.name?habit.name:'عادة جديدة'),
    done:uniqueDates(Array.isArray(habit&&(habit.done||habit.done_dates))?(habit.done||habit.done_dates).map(v=>normalizeDateKey(v,'')).filter(Boolean):[]),
  }));

  const expensesSrc=Array.isArray(src.expenses)?src.expenses:[];
  normalized.expenses=expensesSrc.map((expense,index)=>({
    id:Number.isFinite(Number(expense&&expense.id))?Number(expense.id):generateNumericId()+index,
    amt:Number(expense&&(expense.amt??expense.amount))||0,
    cat:String(expense&&(expense.cat||expense.category)||'أخرى'),
    currency:normalizeCurrencyCode(expense&&(expense.currency||expense.currencyCode)||src&&src.settings&&src.settings.currency||defaults.settings.currency),
    note:String(expense&&expense.note||''),
    date:normalizeDateKey(expense&&(expense.date||expense.expense_date),todayKey()),
    createdAt:String(expense&&(expense.createdAt||expense.created_at)||new Date().toISOString()),
  })).filter(expense=>expense.amt>0).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))||b.id-a.id);

  const problemsSrc=Array.isArray(src.problems)?src.problems:defaults.problems;
  normalized.problems=problemsSrc.map((problem,index)=>({
    id:Number.isFinite(Number(problem&&problem.id))?Number(problem.id):generateNumericId()+index,
    title:String(problem&&problem.title||''),
    solution:String(problem&&problem.solution||''),
    duration:String(problem&&problem.duration||'٧ أيام'),
    note:String(problem&&problem.note||''),
    status:['todo','exp','done'].includes(problem&&problem.status)?problem.status:'todo',
    createdAt:String(problem&&(problem.createdAt||problem.created_at)||new Date().toISOString()),
  }));

  const goalsSrc=Array.isArray(src.goals)?src.goals:defaults.goals;
  normalized.goals=goalsSrc.map((goal,index)=>({
    id:Number.isFinite(Number(goal&&goal.id))?Number(goal.id):generateNumericId()+index,
    icon:String(goal&&goal.icon||'🎯'),
    title:String(goal&&goal.title||''),
    detail:String(goal&&goal.detail||''),
    deadline:String(goal&&goal.deadline||'٣ شهور'),
    pct:clamp(Math.round(Number(goal&&(goal.pct??goal.percentage))||0),0,100),
  }));

  const tasksSrc=Array.isArray(src.tasks)?src.tasks:[];
  normalized.tasks=tasksSrc.map((task,index)=>normalizeTaskEntry(task,index)).sort((a,b)=>String(a.date).localeCompare(String(b.date))||String(a.createdAt).localeCompare(String(b.createdAt)));

  const journalSrc=Array.isArray(src.journal)?src.journal:[];
  normalized.journal=journalSrc.map((entry,index)=>normalizeJournalEntry(entry,index)).sort((a,b)=>String(b.date).localeCompare(String(a.date))||b.id-a.id);

  const budgetsSrc=src.budgets&&typeof src.budgets==='object'?src.budgets:{};
  Object.entries(budgetsSrc).forEach(([key,value])=>{
    const category=String((value&&value.category)||key||'أخرى');
    normalized.budgets[category]={
      id:String((value&&value.id)||budgetId(category)),
      category,
      limit:Math.max(0,Number(value&&value.limit)||0),
    };
  });

  const energyHistorySrc=Array.isArray(src.energyHistory)?src.energyHistory:[];
  normalized.energyHistory=energyHistorySrc.map(entry=>({
    date:normalizeDateKey(entry&&entry.date,todayKey()),
    value:clamp(Math.round(Number(entry&&entry.value)||normalized.energy),1,10),
  })).sort((a,b)=>String(a.date).localeCompare(String(b.date))).reduce((acc,entry)=>{
    if(!acc.find(item=>item.date===entry.date))acc.push(entry);
    return acc;
  },[]);

  const mvdDoneSrc=src.mvdDone&&typeof src.mvdDone==='object'?src.mvdDone:{};
  Object.keys(mvdDoneSrc).forEach(key=>{
    normalized.mvdDone[key]=[...new Set(Array.isArray(mvdDoneSrc[key])?mvdDoneSrc[key].map(v=>parseInt(v,10)).filter(Number.isInteger):[])];
  });

  const weeklySrc=src.weekly&&typeof src.weekly==='object'?src.weekly:{};
  normalized.weekly={w1:String(weeklySrc.w1||''),w2:String(weeklySrc.w2||''),w3:String(weeklySrc.w3||''),w4:String(weeklySrc.w4||'')};
  const weeklyHistorySrc=Array.isArray(src.weeklyHistory)?src.weeklyHistory:[];
  normalized.weeklyHistory=weeklyHistorySrc.map((entry,index)=>normalizeWeekEntry(entry,index)).sort((a,b)=>String(b.date).localeCompare(String(a.date))||b.id-a.id);
  if(!normalized.weekly.w1&&!normalized.weekly.w2&&!normalized.weekly.w3&&!normalized.weekly.w4&&normalized.weeklyHistory.length){
    const latest=normalized.weeklyHistory[0];
    normalized.weekly={w1:latest.w1,w2:latest.w2,w3:latest.w3,w4:latest.w4};
  }

  const moodSrc=Array.isArray(src.moodLog)?src.moodLog:[];
  normalized.moodLog=moodSrc.map((entry,index)=>({
    id:Number.isFinite(Number(entry&&entry.id))?Number(entry.id):generateNumericId()+index,
    date:normalizeDateKey(entry&&entry.date,todayKey()),
    mood:clamp(Math.round(Number(entry&&entry.mood)||3),1,5),
    note:String(entry&&entry.note||''),
    createdAt:String(entry&&(entry.createdAt||entry.created_at)||new Date().toISOString()),
  })).sort((a,b)=>String(b.date).localeCompare(String(a.date))||b.id-a.id).slice(0,60);

  const settingsSrc=src.settings&&typeof src.settings==='object'?src.settings:{};
  const fontScale=Number(settingsSrc.fontScale);
  normalized.settings={
    fontScale:Number.isFinite(fontScale)?clamp(fontScale,0.9,1.2):defaults.settings.fontScale,
    language:['ar','en'].includes(settingsSrc.language)?settingsSrc.language:defaults.settings.language,
    currency:normalizeCurrencyCode(settingsSrc.currency||defaults.settings.currency),
  };

  const pomodoroSrc=src.pomodoro&&typeof src.pomodoro==='object'?src.pomodoro:{};
  const sessionsToday=pomodoroSrc.sessionsToday&&typeof pomodoroSrc.sessionsToday==='object'?pomodoroSrc.sessionsToday:{};
  normalized.pomodoro={
    mode:['focus','break'].includes(pomodoroSrc.mode)?pomodoroSrc.mode:'focus',
    remainingSec:Number.isFinite(Number(pomodoroSrc.remainingSec))?Math.max(0,Math.round(Number(pomodoroSrc.remainingSec))):1500,
    running:Boolean(pomodoroSrc.running),
    lastTickAt:pomodoroSrc.lastTickAt?String(pomodoroSrc.lastTickAt):null,
    sessionsToday:Object.keys(sessionsToday).reduce((acc,key)=>{acc[key]=Math.max(0,Math.round(Number(sessionsToday[key])||0));return acc;},{}),
    totalSessions:Math.max(0,Math.round(Number(pomodoroSrc.totalSessions)||0)),
  };

  normalized.level=computeLevel(normalized.xp);
  return normalized;
}
function createBootstrapState(source){
  const defaults=normalizeStateShape(createDefaultState());
  const base=normalizeStateShape(source||createDefaultState());
  if(!base.habits.length)base.habits=defaults.habits.map(habit=>({id:habit.id,name:habit.name,done:[...habit.done]}));
  if(!base.problems.length)base.problems=defaults.problems.map(problem=>({...problem,createdAt:new Date().toISOString()}));
  if(!base.goals.length)base.goals=defaults.goals.map(goal=>({...goal}));
  return normalizeStateShape(base);
}
function getPersistenceUid(){
  return typeof getCurrentFirebaseUid==='function'?getCurrentFirebaseUid():null;
}

async function load(){
  return loadWithOptions();
}

async function loadWithOptions(options={}){
  const backgroundRemote=Boolean(options&&options.backgroundRemote);
  const cache=loadCache();
  const cachedState=normalizeStateShape(cache||createDefaultState());
  S=cachedState;
  saveCache();
  const uid=getPersistenceUid();
  if(!uid||typeof loadFromFirebase!=='function'){
    setSyncIndicator('offline');
    return {remotePromise:null};
  }
  const remoteSyncPromise=(async()=>{
    setSyncIndicator('syncing');
    const remoteState=await loadFromFirebase(uid,cachedState);
    if(getPersistenceUid()!==uid)return null;
    const bootstrapRemote=!remoteState;
    S=bootstrapRemote?createBootstrapState(cachedState):normalizeStateShape(remoteState);
    saveCache();
    if(bootstrapRemote){
      await saveToFirebase(uid,S);
      if(getPersistenceUid()!==uid)return null;
      saveCache();
    }
    setSyncIndicator('synced');
    window.dispatchEvent(new CustomEvent('sama-state-synced',{detail:{uid}}));
    return S;
  })().catch(err=>{
    console.warn('Firebase load failed, using cache fallback.',err);
    if(getPersistenceUid()===uid){
      S=cachedState;
      setSyncIndicator('offline');
    }
    return null;
  });

  if(backgroundRemote){
    return {remotePromise:remoteSyncPromise};
  }

  await remoteSyncPromise;
  return {remotePromise:null};
}
function save(options={}){
  S=normalizeStateShape(S);
  saveCache();
  const uid=getPersistenceUid();
  if(!uid||typeof saveToFirebase!=='function'){
    setSyncIndicator('offline');
    return;
  }
  if(syncTimer)clearTimeout(syncTimer);
  syncTimer=setTimeout(()=>{
    syncTimer=null;
    syncChain=syncChain.catch(()=>{}).then(async()=>{
      try{
        setSyncIndicator('syncing');
        await saveToFirebase(uid,S);
        saveCache();
        setSyncIndicator('synced');
      }catch(err){
        console.warn('Firebase sync failed, cache kept locally.',err);
        setSyncIndicator('offline');
      }
    });
  },typeof options.delay==='number'?Math.max(0,options.delay):DEFAULT_SYNC_DELAY_MS);
}
