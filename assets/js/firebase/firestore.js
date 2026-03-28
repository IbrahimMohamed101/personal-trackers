function requireFirestore(){
  if(!initFirebase()||!firebaseDb)throw new Error('Firestore unavailable');
  return firebaseDb;
}

function nowIso(){
  return new Date().toISOString();
}

function chunkArray(list,size){
  const chunks=[];
  for(let index=0;index<list.length;index+=size){
    chunks.push(list.slice(index,index+size));
  }
  return chunks;
}

function getUsersCollectionRef(){
  return requireFirestore().collection('users');
}

function getUserDocRef(uid){
  return getUsersCollectionRef().doc(String(uid));
}

function getUserCollectionRef(uid,collectionName){
  return getUserDocRef(uid).collection(String(collectionName));
}

async function getUserRootDoc(uid){
  const snapshot=await getUserDocRef(uid).get();
  return snapshot.exists?{id:snapshot.id,...snapshot.data()}:null;
}

async function setUserRootDoc(uid,data,options={merge:true}){
  await getUserDocRef(uid).set({...data,ownerUid:String(uid)},options);
}

async function updateUserRootDoc(uid,data){
  await getUserDocRef(uid).update(data);
}

async function getUserCollectionDocs(uid,collectionName,options={}){
  let ref=getUserCollectionRef(uid,collectionName);
  if(options.orderBy){
    ref=ref.orderBy(options.orderBy,options.direction||'asc');
  }
  if(Number.isFinite(Number(options.limit))&&Number(options.limit)>0){
    ref=ref.limit(Number(options.limit));
  }
  const snapshot=await ref.get();
  return snapshot.docs.map(doc=>({id:doc.id,...doc.data()}));
}

async function setUserCollectionDoc(uid,collectionName,docId,data,options={merge:true}){
  await getUserCollectionRef(uid,collectionName).doc(String(docId)).set({...data,id:String(docId),ownerUid:String(uid)},options);
}

async function updateUserCollectionDoc(uid,collectionName,docId,data){
  await getUserCollectionRef(uid,collectionName).doc(String(docId)).update(data);
}

async function deleteUserCollectionDoc(uid,collectionName,docId){
  await getUserCollectionRef(uid,collectionName).doc(String(docId)).delete();
}

async function commitCollectionBatch(uid,collectionName,ops){
  if(!ops.length)return;
  const db=requireFirestore();
  const batches=chunkArray(ops,400);
  for(const batchOps of batches){
    const batch=db.batch();
    batchOps.forEach(op=>{
      const ref=getUserCollectionRef(uid,collectionName).doc(String(op.id));
      if(op.type==='delete')batch.delete(ref);
      else batch.set(ref,{...op.data,id:String(op.id),ownerUid:String(uid)},{merge:false});
    });
    await batch.commit();
  }
}

async function replaceUserCollection(uid,collectionName,docs){
  const rows=Array.isArray(docs)?docs:[];
  const existing=await getUserCollectionDocs(uid,collectionName);
  const wantedIds=new Set(rows.map(row=>String(row.id)));
  const ops=rows.map(row=>({type:'set',id:String(row.id),data:row}));
  existing.forEach(row=>{
    if(!wantedIds.has(String(row.id)))ops.push({type:'delete',id:String(row.id)});
  });
  await commitCollectionBatch(uid,collectionName,ops);
}
