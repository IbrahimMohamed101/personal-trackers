function mapDocId(value,fallback){
  const text=String(value??'').trim();
  return text||String(fallback);
}

function sortByCreatedAtAsc(a,b){
  return String(a.createdAt||'').localeCompare(String(b.createdAt||''))||String(a.id).localeCompare(String(b.id));
}

function sortByCreatedAtDesc(a,b){
  return String(b.createdAt||'').localeCompare(String(a.createdAt||''))||String(b.id).localeCompare(String(a.id));
}

function sortByDateDesc(a,b){
  return String(b.date||b.dateKey||'').localeCompare(String(a.date||a.dateKey||''))||String(b.id).localeCompare(String(a.id));
}

function hasFirebaseDashboardData(remote){
  if(!remote||typeof remote!=='object')return false;
  const doc=remote.userDoc||{};
  const dashboardKeys=['energy','dayType','savingsGoal','xp','dashboardInitializedAt'];
  if(dashboardKeys.some(key=>doc[key]!==undefined&&doc[key]!==null))return true;
  return [
    'habits',
    'expenses',
    'problems',
    'goals',
    'weeklyReviews',
    'mvdDone',
    'tasks',
    'journalEntries',
    'budgets',
    'moodEntries',
    'energyHistory',
    'notes',
  ].some(key=>Array.isArray(remote[key])&&remote[key].length);
}

function stateToFirestore(state,uid){
  const snapshot=state&&typeof state==='object'?state:{};
  const createdAt=nowIso();
  return {
    userDoc:{
      ownerUid:String(uid),
      dashboardInitializedAt:createdAt,
      updatedAt:createdAt,
      energy:Number(snapshot.energy)||5,
      dayType:String(snapshot.dayType||'normal'),
      savingsGoal:Number(snapshot.savingsGoal)||0,
      xp:Number(snapshot.xp)||0,
      level:Number(snapshot.level)||1,
      weeklyChallenge:snapshot.weeklyChallenge?String(snapshot.weeklyChallenge):null,
      weeklyChallengeDone:Boolean(snapshot.weeklyChallengeDone),
      weeklyChallengeProgress:Number(snapshot.weeklyChallengeProgress)||0,
      weekly:{
        w1:String(snapshot.weekly&&snapshot.weekly.w1||''),
        w2:String(snapshot.weekly&&snapshot.weekly.w2||''),
        w3:String(snapshot.weekly&&snapshot.weekly.w3||''),
        w4:String(snapshot.weekly&&snapshot.weekly.w4||''),
      },
      settings:snapshot.settings&&typeof snapshot.settings==='object'?snapshot.settings:{fontScale:1,language:'ar'},
      pomodoro:snapshot.pomodoro&&typeof snapshot.pomodoro==='object'?snapshot.pomodoro:{mode:'focus',remainingSec:1500,running:false,lastTickAt:null,sessionsToday:{},totalSessions:0},
    },
    collections:{
      habits:(Array.isArray(snapshot.habits)?snapshot.habits:[]).map((habit,index)=>({
        id:mapDocId(habit&&habit.id,'habit_'+(index+1)),
        name:String(habit&&habit.name||''),
        doneDates:Array.isArray(habit&&habit.done)?habit.done:[],
        position:index,
        updatedAt:createdAt,
      })),
      expenses:(Array.isArray(snapshot.expenses)?snapshot.expenses:[]).map(expense=>({
        id:mapDocId(expense&&expense.id,generateNumericId()),
        amount:Number(expense&&expense.amt)||0,
        category:String(expense&&expense.cat||'أخرى'),
        note:String(expense&&expense.note||''),
        dateKey:String(expense&&expense.date||todayKey()),
        createdAt:String(expense&&expense.createdAt||createdAt),
        updatedAt:createdAt,
      })),
      problems:(Array.isArray(snapshot.problems)?snapshot.problems:[]).map(problem=>({
        id:mapDocId(problem&&problem.id,generateNumericId()),
        title:String(problem&&problem.title||''),
        solution:String(problem&&problem.solution||''),
        duration:String(problem&&problem.duration||'٧ أيام'),
        note:String(problem&&problem.note||''),
        status:String(problem&&problem.status||'todo'),
        createdAt:String(problem&&problem.createdAt||createdAt),
        updatedAt:createdAt,
      })),
      goals:(Array.isArray(snapshot.goals)?snapshot.goals:[]).map(goal=>({
        id:mapDocId(goal&&goal.id,generateNumericId()),
        icon:String(goal&&goal.icon||'🎯'),
        title:String(goal&&goal.title||''),
        detail:String(goal&&goal.detail||''),
        deadline:String(goal&&goal.deadline||''),
        percentage:Number(goal&&goal.pct)||0,
        updatedAt:createdAt,
      })),
      weeklyReviews:(Array.isArray(snapshot.weeklyHistory)?snapshot.weeklyHistory:[]).map(entry=>({
        id:mapDocId(entry&&entry.id,generateNumericId()),
        dateKey:String(entry&&entry.date||todayKey()),
        q1:String(entry&&entry.w1||''),
        q2:String(entry&&entry.w2||''),
        q3:String(entry&&entry.w3||''),
        q4:String(entry&&entry.w4||''),
        createdAt:String(entry&&entry.createdAt||createdAt),
        updatedAt:createdAt,
      })),
      mvdDone:Object.entries(snapshot.mvdDone&&typeof snapshot.mvdDone==='object'?snapshot.mvdDone:{}).map(([id,doneIndices])=>({
        id:mapDocId(id,'mvd'),
        doneIndices:Array.isArray(doneIndices)?doneIndices:[],
        updatedAt:createdAt,
      })),
      tasks:(Array.isArray(snapshot.tasks)?snapshot.tasks:[]).map(task=>({
        id:mapDocId(task&&task.id,generateNumericId()),
        title:String(task&&task.title||''),
        priority:String(task&&task.priority||'normal'),
        repeatType:String(task&&task.repeatType||'none'),
        goalId:task&&task.goalId!==undefined&&task.goalId!==null?String(task.goalId):null,
        done:Boolean(task&&task.done),
        dateKey:String(task&&task.date||todayKey()),
        createdAt:String(task&&task.createdAt||createdAt),
        updatedAt:createdAt,
      })),
      journalEntries:(Array.isArray(snapshot.journal)?snapshot.journal:[]).map(entry=>({
        id:mapDocId(entry&&entry.id,generateNumericId()),
        dateKey:String(entry&&entry.date||todayKey()),
        content:String(entry&&entry.content||''),
        gratitude1:String(entry&&entry.gratitude1||''),
        gratitude2:String(entry&&entry.gratitude2||''),
        gratitude3:String(entry&&entry.gratitude3||''),
        energy:Number(entry&&entry.energy)||5,
        mood:Number(entry&&entry.mood)||3,
        createdAt:String(entry&&entry.createdAt||createdAt),
        updatedAt:createdAt,
      })),
      budgets:Object.values(snapshot.budgets&&typeof snapshot.budgets==='object'?snapshot.budgets:{}).map(budget=>({
        id:mapDocId(budget&&budget.id,budgetId(budget&&budget.category||'budget')),
        category:String(budget&&budget.category||'أخرى'),
        monthlyLimit:Number(budget&&budget.limit)||0,
        updatedAt:createdAt,
      })),
      moodEntries:(Array.isArray(snapshot.moodLog)?snapshot.moodLog:[]).map(entry=>({
        id:mapDocId(entry&&entry.id,generateNumericId()),
        dateKey:String(entry&&entry.date||todayKey()),
        mood:Number(entry&&entry.mood)||3,
        note:String(entry&&entry.note||''),
        createdAt:String(entry&&entry.createdAt||createdAt),
        updatedAt:createdAt,
      })),
      energyHistory:(Array.isArray(snapshot.energyHistory)?snapshot.energyHistory:[]).map((entry,index)=>({
        id:mapDocId(entry&&entry.id,entry&&entry.date||'energy_'+(index+1)),
        dateKey:String(entry&&entry.date||todayKey()),
        value:Number(entry&&entry.value)||5,
        updatedAt:createdAt,
      })),
      notes:(Array.isArray(snapshot.notes)?snapshot.notes:[]).map((note,index)=>({
        id:mapDocId(note&&note.id,'note_'+(index+1)),
        title:String(note&&note.title||''),
        content:String(note&&note.content||note&&note.body||''),
        createdAt:String(note&&note.createdAt||createdAt),
        updatedAt:createdAt,
      })),
    },
  };
}

function firestoreToState(remote,fallbackState){
  const fallback=fallbackState&&typeof fallbackState==='object'?fallbackState:{};
  const userDoc=remote&&remote.userDoc&&typeof remote.userDoc==='object'?remote.userDoc:{};
  const weeklyReviews=(Array.isArray(remote&&remote.weeklyReviews)?remote.weeklyReviews:[]).map(row=>({
    id:row.id,
    date:row.dateKey,
    w1:row.q1,
    w2:row.q2,
    w3:row.q3,
    w4:row.q4,
    createdAt:row.createdAt,
  })).sort(sortByDateDesc);
  const latestWeekly=weeklyReviews[0]||null;
  const journal=(Array.isArray(remote&&remote.journalEntries)?remote.journalEntries:[]).map(row=>({
    id:row.id,
    date:row.dateKey,
    content:row.content,
    gratitude1:row.gratitude1,
    gratitude2:row.gratitude2,
    gratitude3:row.gratitude3,
    energy:row.energy,
    mood:row.mood,
    createdAt:row.createdAt,
  })).sort(sortByDateDesc);
  const energyHistory=(Array.isArray(remote&&remote.energyHistory)?remote.energyHistory:[]).map(row=>({
    id:row.id,
    date:row.dateKey,
    value:row.value,
  })).sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  const budgets=(Array.isArray(remote&&remote.budgets)?remote.budgets:[]).reduce((acc,row)=>{
    acc[String(row.category||'أخرى')]={
      id:String(row.id||budgetId(String(row.category||'أخرى'))),
      category:String(row.category||'أخرى'),
      limit:Number(row.monthlyLimit)||0,
    };
    return acc;
  },{});
  return {
    energy:userDoc.energy!==undefined?userDoc.energy:fallback.energy,
    dayType:userDoc.dayType||fallback.dayType,
    savingsGoal:userDoc.savingsGoal!==undefined?userDoc.savingsGoal:fallback.savingsGoal,
    habits:(Array.isArray(remote&&remote.habits)?remote.habits:[]).map(row=>({
      id:row.id,
      name:row.name,
      done:row.doneDates||[],
    })),
    expenses:(Array.isArray(remote&&remote.expenses)?remote.expenses:[]).map(row=>({
      id:row.id,
      amount:row.amount,
      category:row.category,
      note:row.note,
      expense_date:row.dateKey,
      created_at:row.createdAt,
    })).sort(sortByCreatedAtDesc),
    problems:(Array.isArray(remote&&remote.problems)?remote.problems:[]).map(row=>({
      id:row.id,
      title:row.title,
      solution:row.solution,
      duration:row.duration,
      note:row.note,
      status:row.status,
      created_at:row.createdAt,
    })).sort(sortByCreatedAtAsc),
    goals:(Array.isArray(remote&&remote.goals)?remote.goals:[]).map(row=>({
      id:row.id,
      icon:row.icon,
      title:row.title,
      detail:row.detail,
      deadline:row.deadline,
      percentage:row.percentage,
    })),
    tasks:(Array.isArray(remote&&remote.tasks)?remote.tasks:[]).map(row=>({
      id:row.id,
      title:row.title,
      priority:row.priority,
      repeat_type:row.repeatType,
      goal_id:row.goalId,
      done:row.done,
      task_date:row.dateKey,
      created_at:row.createdAt,
    })).sort(sortByCreatedAtAsc),
    journal,
    budgets:Object.keys(budgets).length?budgets:fallback.budgets,
    xp:userDoc.xp!==undefined?userDoc.xp:fallback.xp,
    level:userDoc.level!==undefined?userDoc.level:fallback.level,
    weeklyChallenge:userDoc.weeklyChallenge!==undefined?userDoc.weeklyChallenge:fallback.weeklyChallenge,
    weeklyChallengeDone:userDoc.weeklyChallengeDone!==undefined?userDoc.weeklyChallengeDone:fallback.weeklyChallengeDone,
    weeklyChallengeProgress:userDoc.weeklyChallengeProgress!==undefined?userDoc.weeklyChallengeProgress:fallback.weeklyChallengeProgress,
    energyHistory:energyHistory.length?energyHistory:(fallback.energyHistory||[]),
    mvdDone:(Array.isArray(remote&&remote.mvdDone)?remote.mvdDone:[]).reduce((acc,row)=>{acc[row.id]=Array.isArray(row.doneIndices)?row.doneIndices:[];return acc;},{}),
    weekly:userDoc.weekly&&typeof userDoc.weekly==='object'?{
      w1:String(userDoc.weekly.w1||''),
      w2:String(userDoc.weekly.w2||''),
      w3:String(userDoc.weekly.w3||''),
      w4:String(userDoc.weekly.w4||''),
    }:(latestWeekly?{w1:latestWeekly.w1,w2:latestWeekly.w2,w3:latestWeekly.w3,w4:latestWeekly.w4}:{w1:'',w2:'',w3:'',w4:''}),
    weeklyHistory:weeklyReviews,
    moodLog:(Array.isArray(remote&&remote.moodEntries)?remote.moodEntries:[]).map(row=>({
      id:row.id,
      date:row.dateKey,
      mood:row.mood,
      note:row.note,
      createdAt:row.createdAt,
    })).sort(sortByDateDesc),
    settings:userDoc.settings&&typeof userDoc.settings==='object'?userDoc.settings:fallback.settings,
    pomodoro:userDoc.pomodoro&&typeof userDoc.pomodoro==='object'?userDoc.pomodoro:fallback.pomodoro,
  };
}
