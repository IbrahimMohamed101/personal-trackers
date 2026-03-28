let currentFirebaseUser=null;
let authReadyResolved=false;
let authReadyPromise=Promise.resolve(null);
let authListenersBound=false;
const authStateSubscribers=new Set();

function getCurrentFirebaseUser(){
  return currentFirebaseUser;
}

function getCurrentFirebaseUid(){
  return currentFirebaseUser&&currentFirebaseUser.uid?String(currentFirebaseUser.uid):null;
}

function createFirebaseAuthError(code,message){
  const error=new Error(message||code);
  error.code=code;
  return error;
}

function hasAuthenticatedFirebaseUser(){
  return Boolean(getCurrentFirebaseUid());
}

async function createUserDocIfNotExists(user){
  if(!user||!user.uid||!initFirebase()||!firebaseDb)return null;
  const ref=getUserDocRef(user.uid);
  const snapshot=await ref.get();
  const createdAt=nowIso();
  const providerId=user.providerData&&user.providerData[0]?user.providerData[0].providerId:'password';
  const profile={
    ownerUid:user.uid,
    email:user.email||'',
    displayName:user.displayName||'Sama User',
    photoURL:user.photoURL||'',
    providerId,
    timezone:Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC',
    lastLoginAt:createdAt,
  };
  if(!snapshot.exists){
    await ref.set({
      ...profile,
      createdAt,
      settings:{fontScale:1,language:'ar'},
    },{merge:true});
    return;
  }
  await ref.set(profile,{merge:true});
}

function authLang(){
  return typeof lang==='function'&&lang()==='en'?'en':'ar';
}

function getFirebaseAuthErrorMessage(error){
  const code=error&&error.code?String(error.code):'unknown';
  const messages={
    ar:{
      'auth/email-already-in-use':'هذا البريد مستخدم بالفعل.',
      'auth/weak-password':'كلمة المرور ضعيفة. استخدمي 6 أحرف أو أكثر.',
      'auth/invalid-email':'صيغة البريد الإلكتروني غير صحيحة.',
      'auth/missing-email':'أدخلي البريد الإلكتروني.',
      'auth/missing-password':'أدخلي كلمة المرور.',
      'auth/user-not-found':'هذا المستخدم غير مسجل.',
      'auth/wrong-password':'بيانات الدخول غير صحيحة.',
      'auth/invalid-login-credentials':'بيانات الدخول غير صحيحة.',
      'auth/invalid-credential':'بيانات الدخول غير صحيحة.',
      'auth/too-many-requests':'تم إيقاف المحاولة مؤقتًا بسبب كثرة الطلبات. حاولي لاحقًا.',
      'auth/network-request-failed':'يوجد مشكلة في الاتصال بالشبكة.',
      'auth/user-disabled':'تم تعطيل هذا الحساب.',
      'auth/operation-not-allowed':'طريقة تسجيل الدخول هذه غير مفعلة في Firebase.',
      'auth/expired-action-code':'انتهت صلاحية رابط إعادة التعيين.',
      'auth/invalid-action-code':'رابط إعادة التعيين غير صالح.',
      unknown:'حدث خطأ غير متوقع في المصادقة.',
    },
    en:{
      'auth/email-already-in-use':'This email is already in use.',
      'auth/weak-password':'Password is too weak. Use at least 6 characters.',
      'auth/invalid-email':'Invalid email address.',
      'auth/missing-email':'Please enter your email.',
      'auth/missing-password':'Please enter your password.',
      'auth/user-not-found':'This account does not exist.',
      'auth/wrong-password':'Incorrect email or password.',
      'auth/invalid-login-credentials':'Incorrect email or password.',
      'auth/invalid-credential':'Incorrect email or password.',
      'auth/too-many-requests':'Too many attempts. Please try again later.',
      'auth/network-request-failed':'Network error. Please check your connection.',
      'auth/user-disabled':'This account has been disabled.',
      'auth/operation-not-allowed':'This sign-in method is not enabled in Firebase.',
      'auth/expired-action-code':'The reset link has expired.',
      'auth/invalid-action-code':'The reset link is invalid.',
      unknown:'Unexpected authentication error.',
    },
  };
  const dictionary=messages[authLang()];
  return dictionary[code]||dictionary.unknown;
}

function notifyAuthSubscribers(user){
  authStateSubscribers.forEach(callback=>{
    try{callback(user);}catch(err){console.warn('Auth subscriber failed.',err);}
  });
  window.dispatchEvent(new CustomEvent('sama-auth-changed',{detail:{user}}));
}

function bindFirebaseAuthListener(){
  if(authListenersBound)return authReadyPromise;
  authListenersBound=true;
  authReadyPromise=new Promise(resolve=>{
    if(!initFirebase()||!firebaseAuth){
      authReadyResolved=true;
      resolve(null);
      notifyAuthSubscribers(null);
      return;
    }
    firebaseAuth.setPersistence(window.firebase.auth.Auth.Persistence.LOCAL).catch(err=>{
      console.warn('Firebase auth persistence setup failed.',err);
    }).finally(()=>{
      firebaseAuth.onAuthStateChanged(async user=>{
        currentFirebaseUser=user||null;
        if(currentFirebaseUser){
          try{
            await createUserDocIfNotExists(currentFirebaseUser);
          }catch(err){
            console.warn('Failed to create/update user profile.',err);
          }
        }
        if(!authReadyResolved){
          authReadyResolved=true;
          resolve(currentFirebaseUser);
        }
        notifyAuthSubscribers(currentFirebaseUser);
      },err=>{
        console.warn('Firebase auth observer failed.',err);
        currentFirebaseUser=null;
        if(!authReadyResolved){
          authReadyResolved=true;
          resolve(null);
        }
        notifyAuthSubscribers(null);
      });
    });
  });
  return authReadyPromise;
}

function onFirebaseAuthStateChanged(callback){
  if(typeof callback!=='function')return ()=>{};
  authStateSubscribers.add(callback);
  if(authReadyResolved)callback(currentFirebaseUser);
  return ()=>authStateSubscribers.delete(callback);
}

async function waitForFirebaseAuthReady(){
  return bindFirebaseAuthListener();
}

function observeAuthState(callback){
  bindFirebaseAuthListener();
  return onFirebaseAuthStateChanged(callback);
}

async function registerWithEmail(email,password){
  if(!initFirebase()||!firebaseAuth)throw new Error('Firebase auth unavailable');
  const result=await firebaseAuth.createUserWithEmailAndPassword(String(email||'').trim(),String(password||''));
  if(result&&result.user)await createUserDocIfNotExists(result.user);
  return result&&result.user?result.user:null;
}

async function loginWithEmail(email,password){
  if(!initFirebase()||!firebaseAuth)throw new Error('Firebase auth unavailable');
  const result=await firebaseAuth.signInWithEmailAndPassword(String(email||'').trim(),String(password||''));
  if(result&&result.user)await createUserDocIfNotExists(result.user);
  return result&&result.user?result.user:null;
}

async function sendPasswordReset(email){
  if(!initFirebase()||!firebaseAuth)throw new Error('Firebase auth unavailable');
  const safeEmail=String(email||'').trim();
  if(!safeEmail)throw createFirebaseAuthError('auth/missing-email','Email is required');
  await firebaseAuth.sendPasswordResetEmail(safeEmail);
  return authLang()==='en'
    ? 'Password reset email sent. Check your inbox.'
    : 'تم إرسال رسالة إعادة تعيين كلمة المرور. راجعي بريدك الإلكتروني.';
}

async function logoutFromFirebase(){
  if(!initFirebase()||!firebaseAuth)return;
  await firebaseAuth.signOut();
}

window.registerWithEmail=registerWithEmail;
window.loginWithEmail=loginWithEmail;
window.sendPasswordReset=sendPasswordReset;
window.logoutFromFirebase=logoutFromFirebase;
window.observeAuthState=observeAuthState;
window.getFirebaseAuthErrorMessage=getFirebaseAuthErrorMessage;
