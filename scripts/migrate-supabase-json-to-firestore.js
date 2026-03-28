#!/usr/bin/env node

/*
Usage:
  npm install firebase-admin
  node scripts/migrate-supabase-json-to-firestore.js ./supabase-export.json ./service-account.json FIREBASE_UID
*/

const fs=require('fs');
const path=require('path');

function loadJson(filePath){
  return JSON.parse(fs.readFileSync(path.resolve(filePath),'utf8'));
}

function asArray(value){
  return Array.isArray(value)?value:[];
}

function mapDocId(value,fallback){
  const text=String(value??'').trim();
  return text||String(fallback);
}

function toLegacySnapshot(source){
  const stateRows=asArray(source.sama_state);
  const xpRows=asArray(source.sama_xp);
  return {
    stateRow:source.stateRow||stateRows[0]||null,
    habitsRows:source.habitsRows||asArray(source.sama_habits),
    expensesRows:source.expensesRows||asArray(source.sama_expenses),
    problemsRows:source.problemsRows||asArray(source.sama_problems),
    goalsRows:source.goalsRows||asArray(source.sama_goals),
    weeklyRows:source.weeklyRows||asArray(source.sama_weekly),
    mvdRows:source.mvdRows||asArray(source.sama_mvd_done),
    tasksRows:source.tasksRows||asArray(source.sama_tasks),
    journalRows:source.journalRows||asArray(source.sama_journal),
    budgetsRows:source.budgetsRows||asArray(source.sama_budgets),
    xpRow:source.xpRow||xpRows[0]||null,
  };
}

function legacySnapshotToFirestore(snapshot,uid){
  const now=new Date().toISOString();
  const stateRow=snapshot.stateRow||{};
  const xpRow=snapshot.xpRow||{};
  return {
    userDoc:{
      ownerUid:String(uid),
      dashboardInitializedAt:now,
      updatedAt:now,
      energy:Number(stateRow.energy)||5,
      dayType:String(stateRow.day_type||'normal'),
      savingsGoal:Number(stateRow.savings_goal)||0,
      xp:Number(xpRow.total_xp)||0,
      level:Number(xpRow.level)||1,
      weeklyChallenge:xpRow.weekly_challenge||null,
      weeklyChallengeDone:Boolean(xpRow.weekly_challenge_done),
      weeklyChallengeProgress:0,
      weekly:{w1:'',w2:'',w3:'',w4:''},
    },
    collections:{
      habits:asArray(snapshot.habitsRows).map((row,index)=>({
        id:mapDocId(row.id,'habit_'+(index+1)),
        name:String(row.name||''),
        doneDates:asArray(row.done_dates),
        position:index,
        updatedAt:now,
      })),
      expenses:asArray(snapshot.expensesRows).map(row=>({
        id:mapDocId(row.id,Date.now()),
        amount:Number(row.amount)||0,
        category:String(row.category||'أخرى'),
        note:String(row.note||''),
        dateKey:String(row.expense_date||''),
        createdAt:String(row.created_at||now),
        updatedAt:now,
      })),
      problems:asArray(snapshot.problemsRows).map(row=>({
        id:mapDocId(row.id,Date.now()),
        title:String(row.title||''),
        solution:String(row.solution||''),
        duration:String(row.duration||''),
        note:String(row.note||''),
        status:String(row.status||'todo'),
        createdAt:String(row.created_at||now),
        updatedAt:now,
      })),
      goals:asArray(snapshot.goalsRows).map(row=>({
        id:mapDocId(row.id,Date.now()),
        icon:String(row.icon||'🎯'),
        title:String(row.title||''),
        detail:String(row.detail||''),
        deadline:String(row.deadline||''),
        percentage:Number(row.percentage)||0,
        updatedAt:now,
      })),
      weeklyReviews:asArray(snapshot.weeklyRows).map(row=>({
        id:mapDocId(row.id,Date.now()),
        dateKey:String(row.week_date||''),
        q1:String(row.q1||''),
        q2:String(row.q2||''),
        q3:String(row.q3||''),
        q4:String(row.q4||''),
        createdAt:String(row.created_at||now),
        updatedAt:now,
      })),
      mvdDone:asArray(snapshot.mvdRows).map(row=>({
        id:mapDocId(row.id,'mvd'),
        doneIndices:asArray(row.done_indices),
        updatedAt:now,
      })),
      tasks:asArray(snapshot.tasksRows).map(row=>({
        id:mapDocId(row.id,Date.now()),
        title:String(row.title||''),
        priority:String(row.priority||'normal'),
        repeatType:String(row.repeat_type||'none'),
        goalId:row.goal_id===null||row.goal_id===undefined?null:String(row.goal_id),
        done:Boolean(row.done),
        dateKey:String(row.task_date||''),
        createdAt:String(row.created_at||now),
        updatedAt:now,
      })),
      journalEntries:asArray(snapshot.journalRows).map(row=>({
        id:mapDocId(row.id,Date.now()),
        dateKey:String(row.journal_date||''),
        content:String(row.content||''),
        gratitude1:String(row.gratitude_1||''),
        gratitude2:String(row.gratitude_2||''),
        gratitude3:String(row.gratitude_3||''),
        energy:Number(row.energy_level)||5,
        mood:Number(row.mood)||3,
        createdAt:String(row.created_at||now),
        updatedAt:now,
      })),
      budgets:asArray(snapshot.budgetsRows).map(row=>({
        id:mapDocId(row.id,row.category||'budget'),
        category:String(row.category||'أخرى'),
        monthlyLimit:Number(row.monthly_limit)||0,
        updatedAt:now,
      })),
      moodEntries:[],
      energyHistory:[],
      notes:[],
    },
  };
}

async function replaceCollection(db,uid,collectionName,rows){
  const userRef=db.collection('users').doc(String(uid));
  const current=await userRef.collection(collectionName).get();
  const incomingIds=new Set(rows.map(row=>String(row.id)));
  let batch=db.batch();
  let count=0;
  async function flush(){
    if(!count)return;
    await batch.commit();
    batch=db.batch();
    count=0;
  }
  for(const row of rows){
    batch.set(userRef.collection(collectionName).doc(String(row.id)),{...row,ownerUid:String(uid)},{merge:false});
    count+=1;
    if(count>=400)await flush();
  }
  for(const doc of current.docs){
    if(!incomingIds.has(doc.id)){
      batch.delete(doc.ref);
      count+=1;
      if(count>=400)await flush();
    }
  }
  await flush();
}

async function main(){
  const [, , exportPath, serviceAccountPath, uid]=process.argv;
  if(!exportPath||!serviceAccountPath||!uid){
    console.error('Usage: node scripts/migrate-supabase-json-to-firestore.js ./supabase-export.json ./service-account.json FIREBASE_UID');
    process.exit(1);
  }

  const admin=require('firebase-admin');
  const serviceAccount=loadJson(serviceAccountPath);
  admin.initializeApp({credential:admin.credential.cert(serviceAccount)});
  const db=admin.firestore();

  const source=loadJson(exportPath);
  const mapped=legacySnapshotToFirestore(toLegacySnapshot(source),uid);

  await db.collection('users').doc(String(uid)).set(mapped.userDoc,{merge:true});
  await replaceCollection(db,uid,'habits',mapped.collections.habits);
  await replaceCollection(db,uid,'expenses',mapped.collections.expenses);
  await replaceCollection(db,uid,'problems',mapped.collections.problems);
  await replaceCollection(db,uid,'goals',mapped.collections.goals);
  await replaceCollection(db,uid,'weekly_reviews',mapped.collections.weeklyReviews);
  await replaceCollection(db,uid,'mvd_done',mapped.collections.mvdDone);
  await replaceCollection(db,uid,'tasks',mapped.collections.tasks);
  await replaceCollection(db,uid,'journal_entries',mapped.collections.journalEntries);
  await replaceCollection(db,uid,'budgets',mapped.collections.budgets);
  await replaceCollection(db,uid,'mood_entries',mapped.collections.moodEntries);
  await replaceCollection(db,uid,'energy_history',mapped.collections.energyHistory);
  await replaceCollection(db,uid,'notes',mapped.collections.notes);

  console.log('Migration complete for uid:',uid);
}

main().catch(err=>{
  console.error(err);
  process.exit(1);
});
