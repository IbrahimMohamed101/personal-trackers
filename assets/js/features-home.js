function renderHome(){
  renderStats();
  updateLifeCards();
  const energyInput=document.getElementById('energy-dashboard');
  if(energyInput){
    energyInput.oninput=function(){
      setEnergy(this.value);
    };
  }
}

function renderStats(){
  const maxStreak=S.habits.reduce((max,habit)=>Math.max(max,calcMaxStreak(habit.done)),0);
  const streakEl=document.getElementById('stat-streak');
  const streakMiniEl=document.getElementById('stat-streak-mini');
  if(streakEl)streakEl.textContent=toAr(maxStreak);
  if(streakMiniEl)streakMiniEl.textContent=toAr(maxStreak);

  const currency=getMoneyCurrency();
  const savings=S.expenses.filter(expense=>expense.cat==='ادخار'&&getExpenseCurrency(expense,currency)===currency).reduce((sum,expense)=>sum+expense.amt,0);
  const savingsEl=document.getElementById('stat-savings');
  const savingsMiniEl=document.getElementById('stat-savings-mini');
  if(savingsEl)savingsEl.textContent=formatMoneyValue(savings,currency);
  if(savingsMiniEl)savingsMiniEl.textContent=formatMoneyValue(savings,currency);

  const dk=todayKey();
  const todayHabits=S.habits.filter(habit=>habit.done.includes(dk)).length;
  const pct=S.habits.length?Math.round(todayHabits/S.habits.length*100):0;
  const habitsEl=document.getElementById('stat-habits');
  const habitsMiniEl=document.getElementById('stat-habits-mini');
  if(habitsEl)habitsEl.textContent=toAr(pct)+'٪';
  if(habitsMiniEl)habitsMiniEl.textContent=toAr(pct)+'٪';

  const solved=S.problems.filter(problem=>problem.status==='done').length;
  const solvedEl=document.getElementById('stat-solved');
  if(solvedEl)solvedEl.textContent=toAr(solved);
}

function updateLifeCards(){
  const dk=todayKey();
  const habitMap={};
  S.habits.forEach(habit=>{habitMap[habit.id]=habit.done.includes(dk);});
  function setLc(id,cls,text){
    const el=document.getElementById('lc-'+id);
    if(el){
      el.className='lc-status '+cls;
      el.textContent=text;
    }
  }
  setLc('sleep',habitMap.sleep?'lc-ok':'lc-warn',habitMap.sleep?'✓ منتظم':'غير منتظم');
  setLc('study',habitMap.study?'lc-ok':'lc-warn',habitMap.study?'✓ ذاكرتِ':'ضعيفة');
  const hasExpenseToday=S.expenses.some(expense=>expense.date===dk);
  setLc('money',hasExpenseToday||habitMap.money_log?'lc-ok':'lc-neutral',hasExpenseToday?'✓ مسجّل':'ابدأي');
  const todayTasks=(S.tasks||[]).filter(task=>task.date===dk);
  const completedTasks=todayTasks.filter(task=>task.done).length;
  setLc('tasks',completedTasks? 'lc-ok':'lc-neutral',completedTasks?`✓ ${toAr(completedTasks)} منجزة`:'رتبيها');
  const hasJournal=(S.journal||[]).some(entry=>entry.date===dk);
  setLc('journal',hasJournal?'lc-ok':'lc-warn',hasJournal?'✓ كُتبت':'لم تُكتب');
}
