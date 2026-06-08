# Yello AI Doctor — Integration Guide

Everything you need to wire the AI Doctor chatbot into the existing repo.

---

## What's in this package

```
functions/
  src/index.js          ← Firebase Cloud Function (holds the API key securely)
  package.json          ← Functions dependencies

src/
  services/
    aiDoctorService.js  ← All AI + DB calls go through here (one place to edit)
  screens/
    AIDoctorScreen.js   ← Drop-in chat screen, no API key needed
```

---

## Step 1 — Copy files into your repo

```
Yello-Companion-App/
├── functions/                    ← create this folder at the root
│   ├── src/
│   │   └── index.js              ← copy from this package
│   └── package.json              ← copy from this package
└── src/
    ├── services/
    │   └── aiDoctorService.js    ← copy from this package
    └── screens/
        └── AIDoctorScreen.js     ← copy from this package
```

---

## Step 2 — Install Firebase CLI & init Functions

```bash
# Install Firebase CLI globally (skip if already done)
npm install -g firebase-tools

# In your project root
firebase login
firebase init functions
# Choose: Use existing project → your Yello Firebase project
# Language: JavaScript
# Do NOT overwrite functions/src/index.js when prompted
```

---

## Step 3 — Store the API key securely

```bash
# This stores the key in Google Cloud Secret Manager — never in your code
firebase functions:secrets:set ANTHROPIC_API_KEY
# Paste your key from console.anthropic.com when prompted
```

---

## Step 4 — Deploy the Cloud Function

```bash
cd functions && npm install && cd ..
firebase deploy --only functions
```

After deploy you'll see a URL like:
`https://us-central1-YOUR-PROJECT.cloudfunctions.net/askDoctor`

You don't need to use this URL directly — the app calls it by name via the Firebase SDK.

---

## Step 5 — Link aiDoctorService.js to your Firebase config

Open `src/services/aiDoctorService.js` and update the import path:

```js
// Change this line to point to wherever your firebase app is initialised
const { app } = require("./firebaseConfig"); // adjust path
```

Your `firebaseConfig.js` should look something like:

```js
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  // etc.
};

export const app = initializeApp(firebaseConfig);
```

---

## Step 6 — Add the screen to your navigator

In your existing navigator file (e.g. `src/navigation/AppNavigator.js`):

```js
import AIDoctorScreen from "../screens/AIDoctorScreen";

// Inside your Stack or Drawer navigator:
<Stack.Screen
  name="AIDoctor"
  component={AIDoctorScreen}
  options={{ headerShown: false }}
/>
```

To navigate to it from anywhere:

```js
navigation.navigate("AIDoctor", { userId: currentUser.uid });
```

---

## Step 7 — Test locally with the emulator (optional but recommended)

```bash
firebase emulators:start --only functions
```

Then in `aiDoctorService.js`, add this before your function call during development:

```js
import { connectFunctionsEmulator } from "firebase/functions";
// Add this once after getFunctions():
if (__DEV__) {
  connectFunctionsEmulator(functions, "localhost", 5001);
}
```

---

## Wiring up the database (when ready)

All DB calls are stubbed with `// TODO:` comments in `aiDoctorService.js`.
When your Firestore collections are set up, just uncomment those blocks.

The collections expected:

| Collection     | Document ID | Fields                                      |
|----------------|-------------|---------------------------------------------|
| `chats`        | `userId`    | `messages[]`, `updatedAt`                   |
| `patients`     | `userId`    | `name`, `age`, `conditions`, `allergies`    |
| `appointments` | auto-ID     | `userId`, `specialty`, `preferredTime`, `status`, `createdAt` |

The Cloud Function (`functions/src/index.js`) also has commented Firestore code
ready to uncomment when collections exist.

---

## Architecture overview

```
Mobile App
    │
    │  Firebase SDK (httpsCallable)
    ▼
Firebase Cloud Function  ← API key lives here only
    │
    │  HTTPS + x-api-key header
    ▼
Anthropic API (Claude Sonnet)
    │
    ▼
Reply returned to app
```

The API key is stored in **Google Cloud Secret Manager** and injected at
runtime by Firebase — it is never in your code, never in the app binary,
and never visible to users.

---

## Cost estimates

| Service | Free tier | Rough cost at scale |
|---------|-----------|---------------------|
| Firebase Functions | 2M invocations/month free | ~$0.40 per 1M after |
| Anthropic Claude Sonnet | Pay per token | ~$0.003 per conversation turn |
| Firestore reads/writes | 50K/day free | Negligible at early scale |

---

## Security checklist before going to production

- [ ] Enable Firebase App Check to prevent abuse
- [ ] Uncomment the `request.auth` guard in `functions/src/index.js`
- [ ] Set Firestore security rules so users can only read their own `chats/` and `patients/` docs
- [ ] Add rate limiting (Firebase has built-in per-user throttling)
- [ ] Review the `max_tokens: 800` limit in the function — increase if answers feel cut off
