// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  // apiKey:import.meta.env.VITE_FIREBASE_APIKEY,
  // authDomain: "tastetrail-6dfca.firebaseapp.com",
  // projectId: "tastetrail-6dfca",
  // storageBucket: "tastetrail-6dfca.firebasestorage.app",
  // messagingSenderId: "30033373442",
  // appId: "1:30033373442:web:be47dc754ea0a898d43a1b",
  // measurementId: "G-048WPVFTNC"
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "kos-food-delivery.firebaseapp.com",
  projectId: "kos-food-delivery",
  storageBucket: "kos-food-delivery.firebasestorage.app",
  messagingSenderId: "1007193976687",
  appId: "1:1007193976687:web:bb1d12ea5b5d89b114829a"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth=getAuth(app)
export {app,auth};
// Analytics initialization - only if needed
// const analytics = getAnalytics(app);