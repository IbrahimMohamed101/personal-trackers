const FIREBASE_CONFIG = window.__SAMA_FIREBASE_CONFIG || {
  apiKey: 'AIzaSyAiUAxzbZsqmtBoi_VA7Kb98XjK8z1YHDY',
  authDomain: 'sama-1ef04.firebaseapp.com',
  projectId: 'sama-1ef04',
  storageBucket: 'sama-1ef04.firebasestorage.app',
  messagingSenderId: '120323946291',
  appId: '1:120323946291:web:8633a2963e3b174a5bf046',
};

let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;

function hasFirebaseConfigValues(config){
  if(!config||typeof config!=='object')return false;
  const requiredKeys=['apiKey','authDomain','projectId','appId'];
  return requiredKeys.every(key=>{
    const value=String(config[key]||'').trim();
    return value&&value.indexOf('REPLACE_WITH_')!==0;
  });
}

function isFirebaseReady(){
  return Boolean(firebaseApp&&firebaseAuth&&firebaseDb);
}

function initFirebase(){
  if(isFirebaseReady())return true;
  if(!window.firebase){
    console.warn('Firebase SDK is missing.');
    return false;
  }
  if(!hasFirebaseConfigValues(FIREBASE_CONFIG)){
    console.warn('Firebase config is not set yet. Update assets/js/firebase/config.js or window.__SAMA_FIREBASE_CONFIG.');
    return false;
  }
  try{
    firebaseApp=window.firebase.apps.length?window.firebase.app():window.firebase.initializeApp(FIREBASE_CONFIG);
    firebaseAuth=window.firebase.auth();
    firebaseDb=window.firebase.firestore();
    return true;
  }catch(err){
    console.warn('Firebase init failed.',err);
    firebaseApp=null;
    firebaseAuth=null;
    firebaseDb=null;
    return false;
  }
}

initFirebase();
