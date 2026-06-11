import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPhoneNumber, PhoneAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCz-S39YxpPzUOI9OVMnNXd0zWhpPB9aa4",
  authDomain: "yello-9355c.firebaseapp.com",
  projectId: "yello-9355c",
  storageBucket: "yello-9355c.firebasestorage.app",
  messagingSenderId: "654814927507",
  appId: "1:654814927507:web:fc7a2d8b9f8c4c0d5a4b66"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.settings.appVerificationDisabledForTesting = true;

const dummyVerifier = {
  type: 'recaptcha',
  verify: () => Promise.resolve('dummy-token')
};

async function test() {
  try {
    const provider = new PhoneAuthProvider(auth);
    const id = await provider.verifyPhoneNumber('+11234567890', dummyVerifier);
    console.log('Success:', id);
  } catch (e) {
    console.error('Error:', e);
  }
}

test();
