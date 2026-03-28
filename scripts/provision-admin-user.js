#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const SERVICE_ACCOUNT_PATH = path.join(ROOT, 'sama-1ef04-firebase-adminsdk-fbsvc-e0df13c706.json');
const FIREBASE_CONFIG_PATH = path.join(ROOT, 'assets/js/firebase/config.js');

function base64UrlEncode(input) {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(String(input));
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function readApiKey() {
  const configSource = fs.readFileSync(FIREBASE_CONFIG_PATH, 'utf8');
  const match = configSource.match(/apiKey:\s*['"]([^'"]+)['"]/);
  if (!match) {
    throw new Error('Could not read Firebase apiKey from assets/js/firebase/config.js');
  }
  return match[1];
}

async function createAccessToken(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claimSet = base64UrlEncode(JSON.stringify({
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(`${header}.${claimSet}`);
  signer.end();
  const signature = base64UrlEncode(signer.sign(serviceAccount.private_key));
  const assertion = `${header}.${claimSet}.${signature}`;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  if (!response.ok) {
    throw new Error(`OAuth token request failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return data.access_token;
}

function encodeFirestoreValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return { integerValue: String(value) };
    return { doubleValue: value };
  }
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(encodeFirestoreValue) } };
  }
  if (typeof value === 'object') {
    const fields = {};
    Object.entries(value).forEach(([key, nestedValue]) => {
      fields[key] = encodeFirestoreValue(nestedValue);
    });
    return { mapValue: { fields } };
  }
  return { stringValue: String(value) };
}

function decodeFirestoreValue(value) {
  if (!value || typeof value !== 'object') return null;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('booleanValue' in value) return Boolean(value.booleanValue);
  if ('nullValue' in value) return null;
  if ('arrayValue' in value) {
    const items = value.arrayValue.values || [];
    return items.map(decodeFirestoreValue);
  }
  if ('mapValue' in value) {
    const result = {};
    const fields = value.mapValue.fields || {};
    Object.entries(fields).forEach(([key, nestedValue]) => {
      result[key] = decodeFirestoreValue(nestedValue);
    });
    return result;
  }
  return null;
}

function decodeFirestoreDoc(doc) {
  const fields = doc.fields || {};
  const data = { id: doc.name.split('/').pop() };
  Object.entries(fields).forEach(([key, value]) => {
    data[key] = decodeFirestoreValue(value);
  });
  return data;
}

async function firestoreRequest(accessToken, url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Firestore request failed: ${response.status} ${await response.text()}`);
  }

  return response.status === 204 ? null : response.json();
}

async function listUserDocs(accessToken, projectId) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users?pageSize=200`;
  const data = await firestoreRequest(accessToken, url);
  return (data.documents || []).map(decodeFirestoreDoc);
}

async function patchUserDoc(accessToken, projectId, uid, patch) {
  const url = new URL(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}`);
  Object.keys(patch).forEach(field => url.searchParams.append('updateMask.fieldPaths', field));
  const body = {
    fields: Object.fromEntries(
      Object.entries(patch).map(([key, value]) => [key, encodeFirestoreValue(value)])
    ),
  };
  return firestoreRequest(accessToken, url.toString(), {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

async function createAuthUser(apiKey, email, password) {
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      returnSecureToken: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Auth signUp failed: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

function buildNewUserProfile(uid, email) {
  const nowIso = new Date().toISOString();
  return {
    ownerUid: uid,
    email,
    displayName: 'Sama Admin',
    photoURL: '',
    providerId: 'password',
    timezone: 'Africa/Cairo',
    createdAt: nowIso,
    updatedAt: nowIso,
    lastLoginAt: nowIso,
    role: 'admin',
    dayType: 'normal',
    energy: 5,
    level: 1,
    xp: 0,
    savingsGoal: 5000,
    dashboardInitializedAt: nowIso,
    weeklyChallenge: null,
    weeklyChallengeDone: false,
    weeklyChallengeProgress: 0,
    settings: {
      fontScale: 1,
      language: 'ar',
      timezone: 'Africa/Cairo',
    },
    weekly: {
      w1: '',
      w2: '',
      w3: '',
      w4: '',
    },
    pomodoro: {
      lastTickAt: null,
      mode: 'focus',
      remainingSec: 1500,
      running: false,
      sessionsToday: {},
      totalSessions: 0,
    },
  };
}

async function ensureSingleAdminByEmail({ email, password }) {
  const serviceAccount = readJson(SERVICE_ACCOUNT_PATH);
  const apiKey = readApiKey();
  const accessToken = await createAccessToken(serviceAccount);
  const projectId = serviceAccount.project_id;
  const nowIso = new Date().toISOString();

  let users = await listUserDocs(accessToken, projectId);
  let targetUser = users.find(user => String(user.email || '').toLowerCase() === String(email).toLowerCase());

  if (!targetUser) {
    if (!password) {
      throw new Error('User doc not found and no password was provided to create a new auth account.');
    }
    const authUser = await createAuthUser(apiKey, email, password);
    const uid = authUser.localId;
    await patchUserDoc(accessToken, projectId, uid, buildNewUserProfile(uid, email));
    users = await listUserDocs(accessToken, projectId);
    targetUser = users.find(user => user.id === uid) || { id: uid, email };
  }

  const targetUid = targetUser.id;
  const demotions = users.filter(user => user.id !== targetUid && user.role === 'admin');

  for (const user of demotions) {
    await patchUserDoc(accessToken, projectId, user.id, {
      role: 'user',
      updatedAt: nowIso,
    });
  }

  await patchUserDoc(accessToken, projectId, targetUid, {
    role: 'admin',
    ownerUid: targetUid,
    email,
    updatedAt: nowIso,
  });

  return {
    uid: targetUid,
    email,
    demotedAdmins: demotions.map(user => user.email || user.id),
    created: !users.some(user => user.id === targetUid),
  };
}

async function main() {
  const email = process.env.ADMIN_EMAIL || process.argv[2];
  const password = process.env.ADMIN_PASSWORD || process.argv[3] || '';

  if (!email) {
    throw new Error('Usage: ADMIN_EMAIL=\"user@example.com\" ADMIN_PASSWORD=\"secret\" node scripts/provision-admin-user.js');
  }

  const result = await ensureSingleAdminByEmail({ email, password });
  console.log(JSON.stringify({
    ok: true,
    email: result.email,
    uid: result.uid,
    demotedAdmins: result.demotedAdmins,
  }, null, 2));
}

main().catch(error => {
  console.error(error.message || error);
  process.exit(1);
});
