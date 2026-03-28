async function fetchFirebaseDashboard(uid){
  if(!uid||!initFirebase()||!firebaseDb)return null;
  const [
    userDoc,
    habits,
    expenses,
    problems,
    goals,
    weeklyReviews,
    mvdDone,
    tasks,
    journalEntries,
    budgets,
    moodEntries,
    energyHistory,
    notes,
  ]=await Promise.all([
    getUserRootDoc(uid),
    getUserCollectionDocs(uid,'habits',{orderBy:'position',direction:'asc'}),
    getUserCollectionDocs(uid,'expenses',{orderBy:'createdAt',direction:'desc'}),
    getUserCollectionDocs(uid,'problems',{orderBy:'createdAt',direction:'asc'}),
    getUserCollectionDocs(uid,'goals',{orderBy:'updatedAt',direction:'asc'}),
    getUserCollectionDocs(uid,'weekly_reviews',{orderBy:'dateKey',direction:'desc'}),
    getUserCollectionDocs(uid,'mvd_done'),
    getUserCollectionDocs(uid,'tasks',{orderBy:'createdAt',direction:'asc'}),
    getUserCollectionDocs(uid,'journal_entries',{orderBy:'dateKey',direction:'desc'}),
    getUserCollectionDocs(uid,'budgets',{orderBy:'category',direction:'asc'}),
    getUserCollectionDocs(uid,'mood_entries',{orderBy:'dateKey',direction:'desc'}),
    getUserCollectionDocs(uid,'energy_history',{orderBy:'dateKey',direction:'asc'}),
    getUserCollectionDocs(uid,'notes',{orderBy:'createdAt',direction:'desc'}),
  ]);
  return {userDoc,habits,expenses,problems,goals,weeklyReviews,mvdDone,tasks,journalEntries,budgets,moodEntries,energyHistory,notes};
}

async function loadFromFirebase(uid,fallbackState){
  if(!uid||!initFirebase()||!firebaseDb)return null;
  const remote=await fetchFirebaseDashboard(uid);
  if(!hasFirebaseDashboardData(remote))return null;
  return firestoreToState(remote,fallbackState||createDefaultState());
}

async function saveToFirebase(uid,state){
  if(!uid||!initFirebase()||!firebaseDb)throw new Error('Firebase unavailable');
  const mapped=stateToFirestore(state,uid);
  await setUserRootDoc(uid,mapped.userDoc,{merge:true});
  await Promise.all([
    replaceUserCollection(uid,'habits',mapped.collections.habits),
    replaceUserCollection(uid,'expenses',mapped.collections.expenses),
    replaceUserCollection(uid,'problems',mapped.collections.problems),
    replaceUserCollection(uid,'goals',mapped.collections.goals),
    replaceUserCollection(uid,'weekly_reviews',mapped.collections.weeklyReviews),
    replaceUserCollection(uid,'mvd_done',mapped.collections.mvdDone),
    replaceUserCollection(uid,'tasks',mapped.collections.tasks),
    replaceUserCollection(uid,'journal_entries',mapped.collections.journalEntries),
    replaceUserCollection(uid,'budgets',mapped.collections.budgets),
    replaceUserCollection(uid,'mood_entries',mapped.collections.moodEntries),
    replaceUserCollection(uid,'energy_history',mapped.collections.energyHistory),
    replaceUserCollection(uid,'notes',mapped.collections.notes),
  ]);
}
