import firebase from "firebase";

const firebaseConfig = {
  apiKey: "AIzaSyD8YpAPlldZoRRioJqHMPNmIAQAox_B9wg",
  authDomain: "inzynieriaoprogramowania-2b402.firebaseapp.com",
  databaseURL: "https://inzynieriaoprogramowania-2b402.firebaseio.com",
  projectId: "inzynieriaoprogramowania-2b402",
  storageBucket: "inzynieriaoprogramowania-2b402.appspot.com",
  messagingSenderId: "868624015478",
  appId: "1:868624015478:web:05cb1ed1c0f6754d6b3f57"
};
firebase.initializeApp(firebaseConfig);
export const db = firebase.firestore();
