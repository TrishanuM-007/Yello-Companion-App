import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCz-S39YxpPzUOI9OVMnNXd0zWhpPB9aa4",
  projectId: "yello-9355c"
};

const app = initializeApp(firebaseConfig);
const rawAuth = getAuth(app);

global.DEV_BYPASS_USER = { uid: '123', phoneNumber: '1234' };

const auth = new Proxy(rawAuth, {
  get(target, prop) {
    if (prop === 'currentUser' && global.DEV_BYPASS_USER) {
      return global.DEV_BYPASS_USER;
    }
    const value = target[prop];
    return typeof value === 'function' ? value.bind(target) : value;
  }
});

console.log("Mocked User:", auth.currentUser);
