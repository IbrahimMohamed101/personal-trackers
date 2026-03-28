// INIT
function rerenderOnboardingFlow(){
  renderAppShell();
}

function showShellAfterOnboarding(){
  renderAppShell();
  if(typeof setAppAccessState==='function'){
    setAppAccessState(true);
  }
  if(typeof setLoadingVisible==='function'){
    setLoadingVisible(false);
  }
  if(typeof renderActivePage==='function'){
    renderActivePage();
  }
  if(typeof goPage==='function'){
    goPage('home');
  }
  if(typeof refreshAuthUi==='function'){
    refreshAuthUi();
  }
  const currentUser=typeof getCurrentFirebaseUser==='function'?getCurrentFirebaseUser():null;
  if(currentUser&&currentUser.uid&&typeof routeAfterAuthResolution==='function'){
    Promise.resolve(routeAfterAuthResolution()).catch(err=>console.warn('Post-onboarding routing failed.',err));
  }
}

function isOnboardingPending(){
  const currentUser=typeof getCurrentFirebaseUser==='function'?getCurrentFirebaseUser():null;
  return Boolean(currentUser&&currentUser.uid&&S.onboarding&&!S.onboarding.completed&&!S.onboarding.skipped);
}

function startOnboarding(){
  if(!S.onboarding)S.onboarding={completed:false,step:0,skipped:false};
  S.onboarding.step=1;
  rerenderOnboardingFlow();
  save();
}

function completeOnboardingStep(step){
  if(step===1){
    const habitInput=document.getElementById('onboard-habit-input');
    const habitName=(habitInput&&habitInput.value.trim())||'عادة جديدة';
    if(!habitName||habitName==='عادة جديدة'){
      toast('من فضلك اكتبي اسم عادة');
      return;
    }
    S.habits.unshift({id:generateNumericId(),name:habitName,done:[]});
    S.onboarding.step=2;
  }else if(step===2){
    const taskInput=document.getElementById('onboard-task-input');
    const taskTitle=(taskInput&&taskInput.value.trim())||'';
    const priority=document.getElementById('onboard-task-priority')?.value||'normal';
    if(!taskTitle){
      toast('من فضلك اكتبي اسم المهمة');
      return;
    }
    S.tasks.unshift({
      id:generateNumericId(),
      title:taskTitle,
      priority:priority,
      repeatType:'none',
      goalId:null,
      done:false,
      date:todayKey(),
      createdAt:new Date().toISOString()
    });
    S.onboarding.step=3;
  }
  rerenderOnboardingFlow();
  save();
  
  // Add energy slider listener for step 3
  if(step===2){
    setTimeout(()=>{
      const energySlider=document.getElementById('onboard-energy');
      if(energySlider){
        energySlider.addEventListener('input',(e)=>{
          const val=Number(e.target.value);
          const labels=['','منخفضة جداً','منخفضة','قليلة','متوسطة','جيدة','ممتازة','عالية','عالية جداً','رائعة','مثالية'];
          const display=document.getElementById('onboard-energy-display');
          if(display)display.textContent=`⚡ ${labels[val]} — ${val}/10`;
        });
        // Trigger initial display
        energySlider.dispatchEvent(new Event('input'));
      }
    },200);
  }
}

function completeOnboarding(){
  const energyInput=document.getElementById('onboard-energy');
  if(energyInput){
    S.energy=Math.round(Number(energyInput.value));
  }
  S.onboarding.completed=true;
  S.onboarding.step=0;
  toast('🎉 مرحباً بك في Personal Trackers!');
  save();
  setTimeout(()=>{
    showShellAfterOnboarding();
  },100);
}

function skipOnboarding(){
  S.onboarding.skipped=true;
  S.onboarding.completed=true;
  S.onboarding.step=0;
  save();
  setTimeout(()=>{
    showShellAfterOnboarding();
  },100);
}

function calcMaxStreak(done){
  const unique=[...new Set(done)].sort();
  let best=0;
  let current=0;
  let prev=null;
  unique.forEach(key=>{
    if(prev&&shiftDateKey(prev,1)===key)current+=1;
    else current=1;
    best=Math.max(best,current);
    prev=key;
  });
  return best;
}

function markHabitDoneFromDashboard(habitId){
  const habit=S.habits.find(h=>h.id===habitId);
  if(!habit)return;
  const today=todayKey();
  if(!habit.done.includes(today)){
    habit.done.unshift(today);
    grantXp(10);
    toast('🎉 عادة مكتملة!');
  }else{
    habit.done=habit.done.filter(d=>d!==today);
    toast('تم إزالة من اليوم');
  }
  renderActivePage();
  save();
}

function openQuickAdd(){
  const modal=document.getElementById('quick-add-modal');
  if(modal){
    modal.style.display='flex';
    const input=document.getElementById('quick-add-input');
    if(input)setTimeout(()=>input.focus(),100);
  }
}

function closeQuickAdd(){
  const modal=document.getElementById('quick-add-modal');
  if(modal)modal.style.display='none';
  const input=document.getElementById('quick-add-input');
  if(input)input.value='';
}

function submitQuickAdd(){
  const input=document.getElementById('quick-add-input');
  if(!input||!input.value.trim())return;
  
  const text=input.value.trim();
  const isHabit=text.startsWith('#');
  
  if(isHabit){
    const habitName=text.substring(1).trim()||'عادة جديدة';
    S.habits.unshift({
      id:generateNumericId(),
      name:habitName,
      done:[]
    });
    grantXp(5);
    toast('✅ عادة جديدة أضيفت');
  }else{
    const taskTitle=text;
    S.tasks.unshift({
      id:generateNumericId(),
      title:taskTitle,
      priority:'normal',
      repeatType:'none',
      goalId:null,
      done:false,
      date:todayKey(),
      createdAt:new Date().toISOString()
    });
    grantXp(5);
    toast('✅ مهمة جديدة أضيفت');
  }
  
  save();
  renderActivePage();
  closeQuickAdd();
}

function applyGreeting(){
  const hr=new Date().getHours();
  const greetEl=document.getElementById('home-greeting');
  if(greetEl){
    const user=typeof getCurrentFirebaseUser==='function'?getCurrentFirebaseUser():null;
    const displayName=user&&user.displayName?user.displayName:'المستخدم';
    if(lang()==='en'){
      greetEl.textContent=hr<5?`Late Night, ${displayName} ✦`:hr<12?`Good Morning, ${displayName} ✦`:hr<17?`Good Afternoon, ${displayName} ✦`:`Good Evening, ${displayName} ✦`;
    } else {
      greetEl.textContent=(hr<5?'أهلاً بكِ':hr<12?'صباح الخير':hr<17?'مساء النور':'مساء الخير')+` يا ${displayName} ✦`;
    }
  }
  const subEl=document.getElementById('home-sub');
  if(subEl){
    if(lang()==='en'){
      subEl.textContent=hr<5?'Late hours, rest well...':hr<12?'A new day, a new chance!':hr<17?'Keep up the great work!':'Evening is for reflection.';
    } else {
      subEl.textContent=hr<5?'وقت متأخر — ارتاحي كويس 💙':hr<12?'يوم جديد، فرصة جديدة 🌤️':hr<17?'استمري في يومك بثبات 💪':hr<22?'الليل وقت التحصيل والمراجعة 🌙':'نهاية اليوم، استعدي للراحة ✨';
    }
  }
}
function renderActivePage(){
  const active=document.querySelector('.page.active');
  const pageId=active&&active.id?active.id.replace('page-',''):'home';
  const energyInput=document.getElementById('energy-rng')||document.getElementById('energy-dashboard');
  if(energyInput)energyInput.value=S.energy;
  setEnergy(S.energy,false);
  applySettings();
  syncPageNav(pageId);
  renderXpUi();
  if(pageId==='tasks')renderTasks();
  else if(pageId==='habits')renderHabits();
  else if(pageId==='money')renderMoney();
  else if(pageId==='problems')renderProblems();
  else if(pageId==='journal')renderJournal();
  else if(pageId==='mood')renderMood();
  else if(pageId==='analytics')renderAnalytics();
  else if(pageId==='goals')renderGoals();
  else if(pageId==='pomodoro')renderPomodoro();
  else if(pageId==='weekly')loadWeekly();
  else if(pageId==='achievements')renderAchievements();
  else if(pageId==='tips')renderTips('all');
  else if(pageId==='guide')renderGuide();
  else if(pageId==='settings')renderSettings();
  else if(pageId==='admin'){
    if(typeof hasAdminAccess==='function'&&hasAdminAccess()&&typeof renderAdmin==='function')renderAdmin();
    else goPage('home');
  }
  else renderHome();
}

function renderGuide(){
  // The guide page is purely HTML static content from templates.js
  // We just ensure the page renders correctly by being focused.
}

function ensureEnergyHistoryToday(){
  if(!Array.isArray(S.energyHistory))S.energyHistory=[];
  const today=todayKey();
  if(!S.energyHistory.some(entry=>entry.date===today)){
    S.energyHistory.unshift({date:today,value:S.energy});
  }
}
const initMobileSwipeHint = () => {
  if (window.innerWidth < 768 && !localStorage.getItem('samaSwipeHintShown')) {
    const nav = document.querySelector('.mobile-nav-track');
    if(nav) {
      nav.animate([
        { transform: 'translateX(0)' },
        { transform: 'translateX(-15px)' },
        { transform: 'translateX(10px)' },
        { transform: 'translateX(0)' }
      ], { duration: 600, delay: 1000, easing: 'ease-in-out' });
      localStorage.setItem('samaSwipeHintShown', 'true');
    }
  }
};

let samaAppReady=false;
let samaActiveUid=null;

async function routeAfterAuthResolution(){
  const currentUser=typeof getCurrentFirebaseUser==='function'?getCurrentFirebaseUser():null;
  if(!currentUser||!currentUser.uid||typeof goPage!=='function')return;
  if(isOnboardingPending()){
    renderAppShell();
    return;
  }
  if(typeof requestAdminAccessRefresh==='function'){
    await requestAdminAccessRefresh(true);
  }
  if(typeof hasAdminAccess==='function'&&hasAdminAccess()){
    goPage('admin');
    return;
  }
  goPage('home');
}

function finalizeAppHydration(){
  const currentUser=typeof getCurrentFirebaseUser==='function'?getCurrentFirebaseUser():null;
  const isAuthenticated=Boolean(currentUser&&currentUser.uid);
  if(isAuthenticated){
    ensureEnergyHistoryToday();
    ensureWeeklyChallenge();
    refreshRecurringTasks();
    updateWeeklyChallengeProgress();
    ensurePomodoroFresh();
    if(S.pomodoro.running)startPomodoroInterval();
    else if(typeof stopPomodoroInterval==='function')stopPomodoroInterval();
  }else if(typeof stopPomodoroInterval==='function'){
    stopPomodoroInterval();
  }
  renderActivePage();
  if(typeof refreshAuthUi==='function')refreshAuthUi();
  setLoadingVisible(false);
  initMobileSwipeHint();
  samaActiveUid=isAuthenticated?String(currentUser.uid):null;
}

// KEYBOARD SHORTCUTS
document.addEventListener('keydown',(e)=>{
  // Cmd+K or Ctrl+K for quick add
  if((e.metaKey||e.ctrlKey)&&e.key==='k'){
    e.preventDefault();
    const activeModal=document.querySelector('[data-modal-open="true"]');
    if(activeModal){
      closeModal(activeModal.id);
      return;
    }
    const activePage=document.querySelector('[data-page-active="true"]');
    if(activePage?.id==='page-home'){
      // Quick add task
      const input=document.querySelector('#quick-add-input');
      if(input){
        input.focus();
      }
    }
  }
  // Escape to close modals
  if(e.key==='Escape'){
    const openModal=document.querySelector('[data-modal-open="true"]');
    if(openModal)closeModal(openModal.id);
  }
});

async function initApp(){
  renderAppShell();
  setLoadingVisible(true);
  updateClock();
  setInterval(updateClock,30000);
  if(typeof waitForFirebaseAuthReady==='function'){
    await waitForFirebaseAuthReady();
  }
  let remotePromise=null;
  try{
    const loadResult=await loadWithOptions({backgroundRemote:true});
    remotePromise=loadResult&&loadResult.remotePromise?loadResult.remotePromise:null;
  }finally{
    finalizeAppHydration();
    await routeAfterAuthResolution();
    samaAppReady=true;
  }
  if(remotePromise){
    remotePromise.finally(async()=>{
      if(!samaAppReady)return;
      finalizeAppHydration();
      await routeAfterAuthResolution();
    });
  }
}
initApp();

window.addEventListener('sama-auth-changed',async event=>{
  if(!samaAppReady)return;
  const nextUser=event&&event.detail?event.detail.user:null;
  const nextUid=nextUser&&nextUser.uid?String(nextUser.uid):null;
  if(nextUid===samaActiveUid)return;
  if(nextUser){
    setLoadingVisible(true);
  }else{
    renderAppShell();
    if(typeof setAppAccessState==='function')setAppAccessState(false);
    if(typeof refreshAuthUi==='function')refreshAuthUi();
  }
  let remotePromise=null;
  try{
    const loadResult=await loadWithOptions({backgroundRemote:Boolean(nextUser)});
    remotePromise=loadResult&&loadResult.remotePromise?loadResult.remotePromise:null;
  }finally{
    finalizeAppHydration();
    if(nextUser){
      await routeAfterAuthResolution();
    }
  }
  if(remotePromise){
    remotePromise.finally(async()=>{
      const currentUid=typeof getCurrentFirebaseUid==='function'?getCurrentFirebaseUid():null;
      if(currentUid!==nextUid)return;
      finalizeAppHydration();
      await routeAfterAuthResolution();
    });
  }
});

window.addEventListener('sama-state-synced',async event=>{
  if(!samaAppReady)return;
  const syncedUid=event&&event.detail?event.detail.uid:null;
  const currentUid=typeof getCurrentFirebaseUid==='function'?getCurrentFirebaseUid():null;
  if(syncedUid&&currentUid&&String(syncedUid)!==String(currentUid))return;
  finalizeAppHydration();
  await routeAfterAuthResolution();
});

window.confirmAddHabit=confirmAddHabit;
window.confirmAddProblem=confirmAddProblem;
window.confirmAddGoal=confirmAddGoal;
window.closeModal=closeModal;
window.startOnboarding=startOnboarding;
window.completeOnboardingStep=completeOnboardingStep;
window.completeOnboarding=completeOnboarding;
window.skipOnboarding=skipOnboarding;
window.markHabitDoneFromDashboard=markHabitDoneFromDashboard;
window.openQuickAdd=openQuickAdd;
window.closeQuickAdd=closeQuickAdd;
window.submitQuickAdd=submitQuickAdd;
