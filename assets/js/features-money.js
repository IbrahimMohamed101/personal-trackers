// Money tracking, savings goal, and expense exports.
function csvRow(values){
  return values.map(value=>`"${String(value??'').replace(/"/g,'""')}"`).join(',');
}

function getMoneyDisplayCurrency(){
  return getMoneyCurrency();
}

function getMoneyCurrencyMeta(code=getMoneyDisplayCurrency()){
  return getCurrencyMeta(code);
}

function getExpensesForCurrency(code=getMoneyDisplayCurrency()){
  const currency=normalizeCurrencyCode(code);
  return (S.expenses||[]).filter(expense=>getExpenseCurrency(expense,currency)===currency);
}

function formatExpenseValue(amount,currencyCode,options={}){
  return formatMoneyValue(amount,currencyCode,options);
}

function syncMoneyCurrencyUi(){
  const currency=getMoneyDisplayCurrency();
  const meta=getMoneyCurrencyMeta(currency);
  const currencySelect=document.getElementById('m-currency');
  const amountInput=document.getElementById('m-amount');
  const noteEl=document.getElementById('m-currency-note');
  const balanceSub=document.getElementById('m-balance-sub');
  const incomeSub=document.getElementById('m-income-sub');
  const totalSub=document.getElementById('m-total-sub');

  if(currencySelect&&currencySelect.value!==currency)currencySelect.value=currency;
  if(amountInput)amountInput.placeholder=`المبلغ (${meta.symbol})`;
  if(noteEl)noteEl.textContent=`العملة الحالية: ${getCurrencyLabel(currency)} — الملخص يحسب عمليات هذه العملة فقط.`;
  if(balanceSub)balanceSub.textContent=`${getCurrencyLabel(currency)} (دخل - مصاريف)`;
  if(incomeSub)incomeSub.textContent=`${getCurrencyLabel(currency)} مكتسب`;
  if(totalSub)totalSub.textContent=`${getCurrencyLabel(currency)} مصروف`;
}

function syncQuickExpenseCurrency(value){
  const currency=normalizeCurrencyCode(value);
  const label=document.getElementById('modal-m-amount-label');
  if(label)label.textContent=`المبلغ (${getMoneyCurrencyMeta(currency).symbol})`;
}

function setMoneyCurrency(value){
  const currency=normalizeCurrencyCode(value);
  if(!S.settings||typeof S.settings!=='object'){
    S.settings={fontScale:1,language:'ar',currency};
  }else{
    S.settings.currency=currency;
  }
  syncMoneyCurrencyUi();
  renderMoney();
  renderStats();
  save();
}

function exportExpensesCsv(){
  const rows=[['id','date','category','note','amount','currency']];
  (S.expenses||[]).forEach(expense=>{
    rows.push([expense.id,expense.date,expense.cat,expense.note,expense.amt,getExpenseCurrency(expense)]);
  });
  downloadFile(`sama-transactions-${todayKey()}.csv`,"\uFEFF"+rows.map(csvRow).join('\n'),'text/csv;charset=utf-8');
  toast(lang()==='en'?'Transactions CSV exported':'تم تصدير CSV المعاملات');
}

function ensureBudgetDefaults(){
  if(!S.budgets||typeof S.budgets!=='object')S.budgets={};
  BUDGET_CATEGORIES.forEach(category=>{
    if(!S.budgets[category]){
      S.budgets[category]={id:budgetId(category),category,limit:0};
    }
  });
}

function getCurrentMonthRange(){
  const now=parseDateKey(todayKey());
  const start=new Date(now.getFullYear(),now.getMonth(),1);
  const end=new Date(now.getFullYear(),now.getMonth()+1,0);
  return {start:dateKeyFromDate(start),end:dateKeyFromDate(end)};
}

function getCategorySpentThisMonth(category,currencyCode=getMoneyDisplayCurrency()){
  const {start,end}=getCurrentMonthRange();
  const currency=normalizeCurrencyCode(currencyCode);
  return getExpensesForCurrency(currency).filter(expense=>expense.cat===category&&expense.date>=start&&expense.date<=end).reduce((sum,expense)=>sum+expense.amt,0);
}

function isIncome(cat){
  return ['راتب','مكافأة','دخل إضافي'].includes(cat);
}

function updateBudget(category,value){
  ensureBudgetDefaults();
  S.budgets[category]={id:budgetId(category),category,limit:Math.max(0,Number(value)||0)};
  renderBudgetManager();
  save();
}

function calculateProjectedSavingsDate(){
  const currency=getMoneyDisplayCurrency();
  const savingsEntries=getExpensesForCurrency(currency).filter(expense=>expense.cat==='ادخار');
  const savings=getSavingsTotal();
  const remaining=Math.max(0,(Number(S.savingsGoal)||0)-savings);
  if(!savingsEntries.length||remaining<=0)return remaining<=0?'وصلتِ للهدف بالفعل ✦':'لا يوجد معدل كافٍ للتوقع بعد';
  const monthMap={};
  savingsEntries.forEach(entry=>{
    const key=String(entry.date).slice(0,7);
    monthMap[key]=(monthMap[key]||0)+entry.amt;
  });
  const monthlyAvg=Object.values(monthMap).reduce((sum,value)=>sum+value,0)/Math.max(1,Object.keys(monthMap).length);
  if(monthlyAvg<=0)return 'لا يوجد معدل كافٍ للتوقع بعد';
  const monthsNeeded=Math.ceil(remaining/monthlyAvg);
  const projected=new Date();
  projected.setMonth(projected.getMonth()+monthsNeeded);
  return `بالمعدل الحالي هتوصلي لهدفك في ${formatMonthYear(projected)}`;
}

function renderBudgetManager(){
  ensureBudgetDefaults();
  const container=document.getElementById('budget-list');
  if(!container)return;
  const currency=getMoneyDisplayCurrency();
  container.className='budget-list';
  container.innerHTML=BUDGET_CATEGORIES.map(category=>{
    const budget=S.budgets[category];
    const spent=getCategorySpentThisMonth(category,currency);
    const limit=Math.max(0,Number(budget.limit)||0);
    const pct=limit?Math.round(spent/limit*100):0;
    let color='var(--green)';
    if(limit&&pct>100)color='var(--red)';
    else if(limit&&pct>=75)color='var(--amber)';
    return `<div class="budget-row"><div class="budget-head"><div><div class="budget-name">${escapeHtml(category)}</div><div class="budget-meta">${formatExpenseValue(spent,currency)} / ${formatExpenseValue(limit,currency)}</div></div><input class="inp budget-input" type="number" min="0" value="${limit}" onchange="updateBudget('${category}',this.value)"></div><div class="budget-track"><div class="budget-fill" style="width:${Math.min(100,pct)}%;background:${color}"></div></div></div>`;
  }).join('');
  const projection=document.getElementById('budget-projection');
  if(projection)projection.textContent=calculateProjectedSavingsDate();
}

function toggleSavingsGoalEdit(){
  editingSavingsGoal=!editingSavingsGoal;
  const editWrap=document.getElementById('m-savings-goal-edit');
  if(!editWrap)return;
  if(!editingSavingsGoal){
    editWrap.innerHTML='';
    return;
  }
  editWrap.innerHTML=`<div class="inline-edit-row"><input class="inp" id="m-savings-goal-input" type="number" min="0" value="${Math.max(0,Number(S.savingsGoal)||0)}"><button class="btn btn-primary btn-sm" onclick="saveSavingsGoalInline()">حفظ</button><button class="btn btn-ghost btn-sm" onclick="toggleSavingsGoalEdit()">إلغاء</button></div>`;
}

function saveSavingsGoalInline(){
  const input=document.getElementById('m-savings-goal-input');
  S.savingsGoal=Math.max(0,Math.round(Number(input&&input.value)||0));
  editingSavingsGoal=false;
  renderMoney();
  renderStats();
  save();
  toast('تم تعديل هدف التحويش');
}

function createExpenseRecord({amount,category,note,currency,date,createdAt}){
  return {
    id:generateNumericId(),
    amt:amount,
    cat:category,
    currency:normalizeCurrencyCode(currency),
    note,
    date:date||todayKey(),
    createdAt:createdAt||new Date().toISOString(),
  };
}

function addExpense(){
  const amt=parseFloat(document.getElementById('m-amount').value);
  const cat=document.getElementById('m-cat').value;
  const note=document.getElementById('m-note').value.trim();
  const currency=getMoneyDisplayCurrency();
  if(!amt||isNaN(amt)||amt<=0){
    toast(lang()==='en'?'Enter a valid amount':'أدخلي مبلغ صحيح');
    return;
  }
  S.expenses.unshift(createExpenseRecord({amount:amt,category:cat,note,currency}));
  ensureBudgetDefaults();
  document.getElementById('m-amount').value='';
  document.getElementById('m-note').value='';
  let exceededBudget=false;
  if(cat!=='ادخار'&&!isIncome(cat)){
    const limit=Math.max(0,Number((S.budgets[cat]||{}).limit)||0);
    const spent=getCategorySpentThisMonth(cat,currency);
    if(limit&&spent>limit)exceededBudget=true;
  }
  grantXp(5);
  updateWeeklyChallengeProgress();
  renderMoney();
  renderStats();
  renderAchievements();
  updateLifeCards();
  save();
  if(exceededBudget)toast(`تجاوزتِ حد ${cat}!`,2600);
  else toast(cat==='ادخار'?'💚 تم إضافة الادخار!':isIncome(cat)?'💰 تم إضافة الدخل!':'✓ تم تسجيل المصروف');
}

function renderMoney(){
  ensureBudgetDefaults();
  const currency=getMoneyDisplayCurrency();
  const currentExpenses=getExpensesForCurrency(currency);
  const savings=currentExpenses.filter(expense=>expense.cat==='ادخار').reduce((sum,expense)=>sum+expense.amt,0);
  const income=currentExpenses.filter(expense=>isIncome(expense.cat)).reduce((sum,expense)=>sum+expense.amt,0);
  const total=currentExpenses.filter(expense=>!isIncome(expense.cat)&&expense.cat!=='ادخار').reduce((sum,expense)=>sum+expense.amt,0);
  const balance=income-total;
  const balanceEl=document.getElementById('m-balance');
  if(balanceEl)balanceEl.textContent=formatExpenseValue(balance<0?0:balance,currency);
  const incomeEl=document.getElementById('m-income');
  if(incomeEl)incomeEl.textContent=formatExpenseValue(income,currency);

  const bar=document.getElementById('m-balance-bar');
  if(bar){
    const pct=income>0?Math.max(0,Math.min(100,Math.round((balance/income)*100))):0;
    bar.style.width=pct+'%';
  }

  const savingsNav=document.getElementById('m-savings-nav');
  if(savingsNav)savingsNav.textContent=formatExpenseValue(savings,currency);

  const goalText=document.getElementById('m-savings-goal-text');
  if(goalText)goalText.textContent=`التحويش المستهدف: ${formatExpenseValue(S.savingsGoal,currency)}`;

  const sBar=document.getElementById('m-savings-bar');
  if(sBar){
    const sPct=S.savingsGoal>0?Math.max(0,Math.min(100,Math.round((savings/S.savingsGoal)*100))):0;
    sBar.style.width=sPct+'%';
  }

  const totalEl=document.getElementById('m-total');
  if(totalEl)totalEl.textContent=formatExpenseValue(total,currency);

  const cats={};
  currentExpenses.filter(expense=>!isIncome(expense.cat)&&expense.cat!=='ادخار').forEach(expense=>{cats[expense.cat]=(cats[expense.cat]||0)+expense.amt;});
  const catsEl=document.getElementById('m-cats');
  if(catsEl){
    catsEl.innerHTML=Object.keys(cats).length
      ?Object.entries(cats).slice(0,5).map(([cat,value])=>`<div class="money-summary-row" style="font-size:12px"><span>${escapeHtml(cat)}</span><span>${formatExpenseValue(value,currency)}</span></div>`).join('')
      :`<div class="exp-empty" style="padding:12px 0">${currentExpenses.length?'لا توجد فئات مصروفات لهذه العملة بعد':'لا توجد عمليات بهذه العملة بعد'}</div>`;
  }

  const log=document.getElementById('exp-log');
  if(log){
    log.innerHTML=(S.expenses||[]).length===0
      ?'<div class="exp-empty"><div class="empty-state"><div class="icon">◈</div><div>سجلي أول عملية ليكِ</div></div></div>'
      :(S.expenses||[]).slice(0,25).map(expense=>{
        const expenseCurrency=getExpenseCurrency(expense,currency);
        return `<div class="exp-item"><span class="exp-item-cat">${escapeHtml(expense.cat)}</span><span class="exp-item-note">${escapeHtml(expense.note||'بدون ملاحظة')}</span><span class="exp-item-amt ${expense.cat==='ادخار'||isIncome(expense.cat)?'savings':''}">${formatExpenseValue(expense.amt,expenseCurrency,{showPlus:isIncome(expense.cat)})}</span><span class="exp-item-date">${formatShortDate(expense.date)}</span><span class="exp-item-actions"><button class="mini-action danger" onclick="deleteExpense(${expense.id})">حذف</button></span></div>`;
      }).join('');
  }

  syncMoneyCurrencyUi();
  renderBudgetManager();
}

function deleteExpense(id){
  const expense=S.expenses.find(item=>Number(item.id)===Number(id));
  if(!expense)return;
  openModal(lang()==='en'?'Delete Expense':'حذف المصروف',
    '<p>'+(lang()==='en'?'Are you sure you want to delete this expense?':'هل أنتِ متأكدة من حذف هذا المصروف؟')+'</p>',
    [{text:lang()==='en'?'Delete':'حذف',primary:true,fn:`confirmDeleteExpense(${id})`},
     {text:lang()==='en'?'Cancel':'إلغاء',fn:'closeModal'}]);
}

window.confirmDeleteExpense=function(id){
  S.expenses=S.expenses.filter(item=>Number(item.id)!==Number(id));
  renderMoney();
  renderStats();
  updateLifeCards();
  renderAchievements();
  updateWeeklyChallengeProgress();
  save();
  closeModal();
  toast(lang()==='en'?'Expense deleted':'تم حذف المصروف');
};

function openSavingsGoalModal(){
  const currencyLabel=getCurrencyLabel(getMoneyDisplayCurrency());
  openModal(
    lang()==='en'?'Savings Goal':'هدف التحويش',
    '<div class="form-group"><label class="form-label">'+(lang()==='en'?'Target Amount':'المبلغ المستهدف')+` (${escapeHtml(currencyLabel)})`+'</label><input class="inp" id="savings-goal-input" type="number" min="0" value="'+escapeHtml(S.savingsGoal)+'"></div>',
    [{text:lang()==='en'?'Save':'حفظ',primary:true,fn:'confirmSavingsGoal'},{text:lang()==='en'?'Cancel':'إلغاء',fn:'closeModal'}]
  );
}

function confirmSavingsGoal(){
  const value=Math.max(0,Math.round(Number(document.getElementById('savings-goal-input').value)||0));
  S.savingsGoal=value;
  closeModal();
  renderMoney();
  renderStats();
  save();
  toast(lang()==='en'?'Goal updated':'تم تعديل هدف التحويش');
}

function openExpenseModal(){
  const currency=getMoneyDisplayCurrency();
  const body=`
    <div class="form-group">
      <label class="form-label">العملة</label>
      <select class="inp" id="modal-m-currency" onchange="syncQuickExpenseCurrency(this.value)">
        ${renderCurrencyOptions(currency)}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label" id="modal-m-amount-label">المبلغ (${escapeHtml(getMoneyCurrencyMeta(currency).symbol)})</label>
      <input type="number" class="inp" id="modal-m-amount" placeholder="٠">
    </div>
    <div class="form-group">
      <label class="form-label">الفئة</label>
      <select class="inp" id="modal-m-cat">
        <optgroup label="الدخل">
          <option value="راتب">💼 راتب</option>
          <option value="مكافأة">🎁 مكافأة</option>
          <option value="دخل إضافي">💰 دخل إضافي</option>
        </optgroup>
        <optgroup label="المصروفات">
          <option value="أكل" selected>🍽️ أكل</option>
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
    </div>
    <div class="form-group">
      <label class="form-label">ملاحظة</label>
      <input type="text" class="inp" id="modal-m-note" placeholder="ملاحظة قصيرة">
    </div>
  `;
  openModal('تسجيل عملية سريعة',body,[
    {text:'سجّلي',primary:true,fn:'confirmQuickExpense'},
    {text:'إلغاء',fn:'closeModal'}
  ]);
}

function confirmQuickExpense(){
  const amt=parseFloat(document.getElementById('modal-m-amount').value);
  const cat=document.getElementById('modal-m-cat').value;
  const note=document.getElementById('modal-m-note').value.trim();
  const currency=normalizeCurrencyCode(document.getElementById('modal-m-currency').value);
  if(!amt||isNaN(amt)||amt<=0){
    toast('أدخلي مبلغ صحيح');
    return;
  }
  setMoneyCurrency(currency);
  S.expenses.unshift(createExpenseRecord({amount:amt,category:cat,note,currency}));
  grantXp(5);
  updateWeeklyChallengeProgress();
  if(document.getElementById('page-money').classList.contains('active'))renderMoney();
  renderStats();
  renderAchievements();
  updateLifeCards();
  save();
  closeModal();
  document.getElementById('modal-m-amount').value='';
  document.getElementById('modal-m-note').value='';
  document.getElementById('modal-m-cat').selectedIndex=0;
  toast(cat==='ادخار'?'💚 تم إضافة الادخار!':isIncome(cat)?'💰 تم إضافة الدخل!':'✓ تم تسجيل المصروف');
}
