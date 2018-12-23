import * as firebase from "firebase";
import "firebase/firestore";
const config = {
  apiKey: "AIzaSyD6aTS8W5ILmQTTJuSBYCHemKInxsyyZLM",
  authDomain: "q0-app.firebaseapp.com",
  databaseURL: "https://q0-app.firebaseio.com",
  projectId: "q0-app",
  storageBucket: "q0-app.appspot.com",
  messagingSenderId: "458629012862"
};
const fileBucket = config.storageBucket;
if (!firebase.apps.length) firebase.initializeApp(config);
const app = firebase.apps[0];
const db = app.database();
const sRef = firebase.storage().ref();
export default firebase;
export { app, db, sRef, fileBucket };
