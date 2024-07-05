// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC1sJ-kfdhe7XFJ8SnPjTaxvnW6sZBMB_o",
  authDomain: "fir-web-chat-d8caf.firebaseapp.com",
  projectId: "fir-web-chat-d8caf",
  storageBucket: "fir-web-chat-d8caf.appspot.com",
  messagingSenderId: "998102434085",
  appId: "1:998102434085:web:7e5ed22a3e73027d4a1acc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);